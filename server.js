
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors';



const app = express();
app.use(cors())

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Serve all files inside public/
app.use(express.static(path.join(__dirname, "public")));

var corsOptions = {
  origin: 'http://localhost:5000//',
  origin: 'https://erp.psit.ac.in/',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
// Home Route
app.get("/", cors(corsOptions) ,(req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "auth.html")
    );
});



app.listen(5000, () => {
    console.log("Server running on port 5000");
});
