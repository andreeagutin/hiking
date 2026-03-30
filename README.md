# Trail Mix

A fullstack application for tracking, managing, and sharing hiking routes.

## Production
- **Frontend:** https://hiking-high.netlify.app/
- **API:** https://hiking-1.onrender.com/api/hikes

---

## Overview

Trail Mix allows users to:
- Browse hikes publicly with search, filters, and a detail page per trail
- Track key metrics: distance, elevation, duration, difficulty
- Manage all data through a protected admin interface (CRUD)
- Upload trail photos via Cloudinary

---

## Architecture

```
Client (React + Vite)
        ↓
REST API (Node.js / Express)
        ↓
MongoDB Atlas
```

- Frontend communicates with backend via REST API
- Backend handles business logic, validation, and data access
- MongoDB stores structured hike data
- Images hosted on Cloudinary, URLs stored in DB

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Backend | Node.js, Express (ESM) |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (jsonwebtoken) |
| Image upload | Cloudinary + multer |
| Dev runner | concurrently + nodemon |
| Styling | Plain CSS (design tokens, no framework) |
| Deployment | Netlify (frontend), Render (backend) |

---

## Project Structure

```
hiking/
├── server/           # Node.js / Express API
│   ├── index.js
│   ├── db.js
│   ├── middleware/
│   ├── models/       # Mongoose schemas
│   └── routes/       # hikes, auth, upload
├── src/              # React frontend (Vite)
│   ├── api/          # fetch helpers
│   └── components/   # public + admin components
├── public/
│   └── favicon.svg
├── data/             # seed script
├── .env              # never commit
└── package.json
```

---

## Getting Started

```bash
git clone git@github.com:andreeagutin/hiking.git
cd hiking
npm install
npm run dev        # Express (port 3001) + Vite concurrently
```

Copy `.env.example` to `.env` and fill in your credentials.

---

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/hikes` | public | List all hikes |
| GET | `/api/hikes/:id` | public | Get single hike (restaurants populated) |
| POST | `/api/hikes` | JWT | Create hike |
| PUT | `/api/hikes/:id` | JWT | Update hike |
| DELETE | `/api/hikes/:id` | JWT | Delete hike |
| POST | `/api/auth/login` | — | Returns JWT token |
| POST | `/api/upload` | JWT | Upload image to Cloudinary |
| GET | `/api/restaurants` | public | List all restaurants |
| POST | `/api/restaurants` | JWT | Create restaurant |
| PUT | `/api/restaurants/:id` | JWT | Update restaurant |
| DELETE | `/api/restaurants/:id` | JWT | Delete restaurant |

---

## Features

### Public
- Hero section with search bar and filters (status, difficulty, mountains, zone, trip type)
- Card grid with hike thumbnails
- Auto-sliding carousel (hikes with photos)
- Detail page per hike (`/hike/:id`) with stats and description

### Admin (`/admin`)
- JWT login (8h token)
- CRUD table with image thumbnails
- Edit form per hike with prev/next navigation arrows
- Unsaved changes guard (confirm dialog before leaving)
- Cloudinary image upload
- Description field (free text)

---

## License

MIT
