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
user: dagutin
pass: hik#02
---
## Project Structure
hiking/
client/ # React app
server/ #ode.js API
---
##n Getting Started
### 1. Clone the repository
git clone git@github.com:andreeagutin/hiking.git
cd hiking
### 2. Run with Docker (recommended)
docker-compose up --build
### 3. Run manually (without Docker)
Backend
cd server
npm install
npm run dev
Frontend
cd client
npm install
npm start
---
## API (initial design)
### Hikes
- GET /hikes ® list all hikes
- GET /hikes/:id ® get hike details
- POST /hikes ® create hike
- PUT /hikes/:id ® update hike
- DELETE /hikes/:id ® delete hike
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