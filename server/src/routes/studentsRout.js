import express from "express";
import Student from "../models/Student.js";

const router = express.Router();

/**
 * GET /api/all/students?id=29120
 */
router.get("/students", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Student id is required.",
      });
    }

    const student = await Student.findOne({ id }).lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export default router;