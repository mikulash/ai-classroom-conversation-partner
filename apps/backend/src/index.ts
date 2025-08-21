import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import replyRoutes from './routes/replies';
import authRoutes from './routes/auth';

const app = express();
const port = +process.env.PORT! || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/replies', replyRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API is running version 11.05.2025v2');
});

// Health Check
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
