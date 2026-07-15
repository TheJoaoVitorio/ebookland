import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import notebookRoutes from './routes/notebook.routes';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'EbookLandia API is running' });
});

// API Routes
app.use('/api', notebookRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
