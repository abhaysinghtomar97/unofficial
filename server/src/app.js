
import express from 'express'
import morgan from 'morgan';
import cors from 'cors'

 const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('tiny')); 


// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'psit-unofficial-express', time: new Date().toISOString() });
});



export default app