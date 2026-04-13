import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
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
import trackedHikesRouter from './routes/trackedHikes.js';
import swaggerSpec from './swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Swagger UI — relaxed CSP scoped to /api-docs only (before global helmet)
app.use('/api-docs', (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
  );
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(helmet());
app.use(compression());
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
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
app.use('/api/tracked-hikes', trackedHikesRouter);

// JSON error handler — catches CORS rejections and other middleware errors
// so the client always receives JSON instead of Express's default HTML error page
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

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
