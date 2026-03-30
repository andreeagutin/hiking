import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import hikesRouter from './routes/hikes.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import restaurantsRouter from './routes/restaurants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/hikes', hikesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/restaurants', restaurantsRouter);

if (isProd && !process.env.RENDER) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
