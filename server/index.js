import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import hikesRouter from './routes/hikes.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import restaurantsRouter from './routes/restaurants.js';
import poiRouter from './routes/poi.js';
import mountainsRouter from './routes/mountains.js';
import aiSearchRouter from './routes/aiSearch.js';
import usersRouter from './routes/users.js';
import sitemapRouter from './routes/sitemap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
}));
app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, try again later' },
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/users/login', loginLimiter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/hikes', hikesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/poi', poiRouter);
app.use('/api/mountains', mountainsRouter);
app.use('/api/ai-search', aiSearchRouter);
app.use('/sitemap.xml', sitemapRouter);

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
