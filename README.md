# Hiking App
A fullstack application for tracking, managing, and sharing hiking routes.
---
## Overview
Hiking App allows users to:
- track hikes with key metrics (distance, elevation, duration)
- explore and filter hikes
- manage data through an admin interface
- (future) get intelligent recommendations based on preferences
The goal of this project is to build a clean, production-like fullstack system while experimenting with
modern tooling and AI-assisted development.
---
## Architecture
Client (React)
¯
REST API (Node.js / Express)
¯
MongoDB Atlas
- Frontend communicates with backend via REST API
- Backend handles business logic, validation, and data access
- MongoDB stores structured hike data
- Docker ensures consistent local development
---
## Tech Stack
- React – frontend SPA for displaying and filtering hikes
- Node.js (Express) – backend API (CRUD, validation, business logic)
- MongoDB Atlas – cloud database for storing hike data
- Docker – containerized development environment
- GitHub – version control (branches, pull requests)
- CodeRabbit – AI-powered code review on pull requests
- Jest – unit testing for backend logic -  // TODO
- Netlify – frontend deployment (CI/CD from GitHub)
- dotenv
- typescript - // TODO
db data:
DB_USER=<your_user>
DB_PASS=<your_pass>
> **Note:** Never commit real credentials. Load them from a `.env` file (see `.env` setup) or a secrets manager.
---
## Project Structure
```
hiking/               # repo root — package.json, vite.config.js, index.html live here
├── src/              # React frontend (Vite)
├── server/           # Node.js / Express API
│   ├── index.js
│   ├── models/
│   └── routes/
├── data/             # seed script
├── .env              # environment variables (never commit)
└── package.json      # root deps — runs both frontend and backend via concurrently
```
---
## Getting Started
### 1. Clone the repository
```bash
git clone git@github.com:andreeagutin/hiking.git
cd hiking
```
### 2. Install dependencies & start (frontend + backend together)
```bash
npm install       # install root deps (React, Vite, Express, etc.)
npm run dev       # starts Express (port 3001) + Vite dev server concurrently
```
### 3. Backend only
```bash
cd server
npm install       # only needed if server has separate deps
npm run dev       # nodemon watches server/
```
> **Note:** Docker support is not currently configured. Remove this note once a `docker-compose.yml` is added.
---
## API (initial design)
### Hikes
- GET /api/hikes ® list all hikes
- GET /api/hikes/:id ® get hike details
- POST /api/hikes ® create hike
- PUT /api/hikes/:id ® update hike
- DELETE /api/hikes/:id ® delete hike
---
## Testing
Run backend tests:
cd server
npm run test
Tests are written using Jest and focus on:
- business logic
- validation
- API behavior
---
## Development Workflow
- create feature branch
git switch -c feature/feature-name
- commit changes
git commit -m "feat: add hike filtering"
- push & open Pull Request
- CodeRabbit reviews PR automatically
---
## Features
### Current
- basic project setup (frontend + backend)
- initial API structure
### Planned
- admin panel for managing hikes
- public hikes list with filters (distance, elevation, duration)
- map integration (display routes)
- user authentication
- favorites / saved hikes
- AI-based hike recommendations
---
## Future Improvements
- caching (Redis)
- pagination & performance optimization
- advanced filtering (multi-criteria)
- mobile-friendly UI
- offline support
---
## Why this project
This project is used to:
- improve fullstack architecture skills
- experiment with AI-assisted development (CodeRabbit, Claude)
- build a portfolio-ready application
---
## License
MIT