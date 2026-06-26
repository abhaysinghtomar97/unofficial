import dotenv from 'dotenv';
dotenv.config();
import app from "./src/app.js";
import axios from 'axios';
import jwt from "jsonwebtoken";
import validateErpCredentials from './src/helper/validateErpCredentials.js';
import connectDb from './src/db/db.js'
import User from './src/models/user.model.js';
import student from './src/models/Student.js';


const ERP_AUTH_URL = process.env.ERP_AUTH_URL;
const CHE_ERP_AUTH_URL = process.env.CHE_ERP_AUTH_URL;
const ERP_PLACED_STUDENTS_URL = process.env.ERP_PLACED_STUDENTS_URL; // PSIT typo preserved
const ERP_PLACEMENT_DRIVES_URL = process.env.ERP_PLACEMENT_DRIVES_URL;
const PSIT_RECRUITERS_URL = process.env.PSIT_RECRUITERS_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;
const PORT = process.env.PORT || 9000;

connectDb();


// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------


function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// ------------------- AUTH -------------------
app.post('/api/auth/login', async (req, res) => {
  const { username, password, college } = req.body || {};
  if (!username || !password || !college) {
    return res.status(400).json({ success: false, message: 'username, password and College  are required' });
  }


  try {

    const user = await User.findOneAndUpdate(
      { username, password },
      {
        $inc: { loginCount: 1 },
        $set: { lastLogin: new Date(), college },

        $setOnInsert: {
          username,
          password,
        }
      },
      {
        new: true,
        upsert: true,
      }
    );

    let erp;
    if (false && Date.now() - new Date(cached.createdAt).getTime() < 1000 * 60 * 60 * 24) {

      erp = { success: true, role: cached.role, fromCache: true };
    } else {
      // 2. Validate live against ERP
      erp = await validateErpCredentials(username, password, college);
    }

    if (!erp.success) {
      return res.status(401).json({ success: false, message: 'Invalid ERP credentials' });
    }




    // 3. Mint JWT
    const token = signToken({ username: String(username), role: erp.role });

    // 4. Persist session in Mongo
    // await db.collection('sessions').updateOne(
    //     { token },
    //     {
    //         $set: {
    //             token,
    //             username: String(username),
    //             passwordHash: hashPassword(password),
    //             role: erp.role,
    //             createdAt: new Date().toISOString(),
    //         },
    //     },
    //     { upsert: true }
    // );

    const needProfileSetup =
      !user.studentId ||
      !user.name ||
      !user.profileImage;

    if (!needProfileSetup) {

      return res.json({
        success: true,
        needProfileSetup: true,
        user,
        token
      });
    }



    return res.json({
      success: true,
      message: "Login successful",
      token,
      needProfileSetup,
      user: {
        ...user.toObject(),
        role: erp.role,
        needProfileSetup,
      },
      fromCache: !!erp.fromCache,
    });
  } catch (err) {
    console.error('[login] error', err.message);
    return res.status(502).json({ success: false, message: 'Unable to reach PSIT ERP. Please try again.' });
  }
});


// ------------------- PLACED STUDENTS -------------------
app.get('/api/students', async (req, res) => {
  const { year, branch } = req.query;
  if (!year || !branch) return res.status(400).json({ success: false, message: 'year and branch are required' });
  try {
    let url;

    if (branch == 'BBA' || branch == 'BCA') {
      url = `${ERP_PLACED_STUDENTS_URL}/${encodeURIComponent(year)}/3/${encodeURIComponent(branch)}/0/500`;

    }
    else {
      url = `${ERP_PLACED_STUDENTS_URL}/${encodeURIComponent(year)}/1/${encodeURIComponent(branch)}/0/100`;
    }
    const { data } = await axios.get(url, { timeout: 25000 });
    const students = Array.isArray(data) ? data.map(normalizeStudent) : [];
    return res.json({ success: true, count: students.length, students });
  } catch (err) {
    console.error('[students] error', err.message);
    return res.status(502).json({ success: false, message: 'Failed to fetch placed students from PSIT ERP.' });
  }
});

function normalizeStudent(s) {
  const companies = Array.isArray(s.c_name) ? s.c_name.map((c) => c.c_name).filter(Boolean) : [];
  return {
    id: s.id,
    rollNo: s.RollNo,
    name: s.name,
    branch: s.branch,
    companies,
    primaryCompany: companies[0] || null,
    imageUrl: `https://erp.psit.ac.in/assets/img/Simages/${s.id}.jpg`,
  };
}

// ------------------- PLACEMENT DRIVES -------------------
app.get('/api/drives', async (_req, res) => {
  try {
    const { data } = await axios.get(ERP_PLACEMENT_DRIVES_URL, { timeout: 25000 });
    const drives = Array.isArray(data) ? data.map(normalizeDrive) : [];
    return res.json({ success: true, count: drives.length, drives });
  } catch (err) {
    console.error('[drives] error', err.message);
    return res.status(502).json({ success: false, message: 'Failed to fetch placement drives.' });
  }
});

function normalizeDrive(d) {
  return {
    id: d.Id,
    company: d.Organisation,
    date: d.pdate,
    year: d.year,
    students: d.No_of_Student || null,
    active: d.isactive === 1,
    jobId: d.job_id || null,
  };
}

// ------------------- RECRUITERS -------------------
app.get('/api/recruiters', async (_req, res) => {
  try {
    const { data } = await axios.get(PSIT_RECRUITERS_URL, { timeout: 25000 });
    const active = Array.isArray(data)
      ? data
        .filter((r) => r.home_status === 1 && r.status === 1)
        .map((r) => ({
          logo: r.Logo,
          url: `https://www.psit.ac.in/assets/webp/psit-recruiters-logo/${r.Logo}`,
        }))
      : [];
    return res.json({ success: true, count: active.length, recruiters: active });
  } catch (err) {
    console.error('[recruiters] error', err.message);
    return res.status(502).json({ success: false, message: 'Failed to fetch recruiters.' });
  }
});

// ------------------- STATS -------------------
app.get('/api/stats', async (_req, res) => {
  try {
    const [drivesRes, recruitersRes] = await Promise.allSettled([
      axios.get(ERP_PLACEMENT_DRIVES_URL, { timeout: 25000 }),
      axios.get(PSIT_RECRUITERS_URL, { timeout: 25000 }),
    ]);

    const drives = drivesRes.status === 'fulfilled' && Array.isArray(drivesRes.value.data) ? drivesRes.value.data : [];
    const recruiters = recruitersRes.status === 'fulfilled' && Array.isArray(recruitersRes.value.data) ? recruitersRes.value.data : [];

    const byYear = {};
    drives.forEach((d) => {
      const y = String(d.year || 'unknown');
      byYear[y] = (byYear[y] || 0) + 1;
    });

    const activeDrives = drives.filter((d) => d.isactive === 1).length;
    const totalRecruiters = recruiters.filter((r) => r.home_status === 1 && r.status === 1).length;
    const uniqueCompanies = new Set(drives.map((d) => d.Organisation)).size;

    return res.json({
      success: true,
      stats: {
        totalDrives: drives.length,
        activeDrives,
        uniqueCompanies,
        totalRecruiters,
        drivesByYear: byYear,
      },
    });
  } catch (err) {
    console.error('[stats] error', err.message);
    return res.status(502).json({ success: false, message: 'Failed to compute statistics.' });
  }
});

// -------------------- update name and id ----------------
app.post("/api/profile", async (req, res) => {
  try {
    const { username, studentId, name, profileImage } = req.body;

    if (!username || !studentId || !name) {
      return res.status(400).json({
        success: false,
        message: "username, studentId and name are required",
      });
    }
    
    const user = await User.findOneAndUpdate(
      { username },
      {
        $set: {
          studentId,
          name,
          profileImage,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const needProfileSetup =
      !user.studentId || !user.name || !user.profileImage;

    return res.json({
      success: true,
      user,
      needProfileSetup,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


app.get("/api/auth/me", async (req, res) => {
  try {
    const username = req.query.username;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        needProfileSetup:
          !user.studentId ||
          !user.name ||
          !user.profileImage,
      },
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});



// 404
app.use('/api', (_req, res) => res.status(404).json({ success: false, message: 'Not found' }));




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

