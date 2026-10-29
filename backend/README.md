# P2P Academic Resource Distribution: Backend (Express + MongoDB)

REST API for the university portal. It serves semesters, units and files, stores
uploaded documents with a SHA-256 hash, and supports the peer-assisted (P2P)
distribution flow with a server fallback, as described in `docs/api-contract.md`.

## Tech stack
- Node.js, Express
- MongoDB Atlas with Mongoose
- Multer (file upload), dotenv, cors

## Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file:
   ```
   PORT=3000
   MONGODB_URI=your-atlas-connection-string
   ```
4. `node seed.js` fills the database with 8 semesters, 7 Year 1 units and sample files
5. `npm run dev` starts the server at http://localhost:3000

## Folder structure
```
backend/
  config/db.js          database connection
  models/               Semester, Unit, File, PeerRecord, User, DownloadSession
  controllers/          browse, file (upload/download), p2p (peers, sessions, admin)
  routes/api.js         all routes
  seed.js               sample data
  server.js             app entry point
```

## Endpoints
| Method | URL | Purpose |
|---|---|---|
| GET | /health | Health check |
| GET | /api/semesters | List semesters |
| GET | /api/semesters/:semesterId/units | List units in a semester |
| GET | /api/units/:unitId/files | List files (optional `?year=2024`) |
| POST | /api/files | Upload a file (form fields: file, unitId, title, category, year) |
| GET | /api/files/:fileId/download | Download from the server (fallback path) |
| GET | /api/files/:fileId/peers | Peer count and recommended mode (p2p or fallback) |
| GET | /api/files/:fileId/magnet | Magnet link |
| POST | /api/files/:fileId/peers | Register a student as a seeder |
| DELETE | /api/files/:fileId/peers/:userId | Remove a seeder |
| PATCH | /api/users/:userId/seeding | Opt in or out of seeding |
| POST | /api/sessions | Log a completed download |
| GET | /api/admin/stats | Dashboard numbers |
| GET | /api/admin/files/health | Per-file peer and download counts |

Errors use the contract format: `{ "success": false, "error": { "code", "message" } }`.

## Design decisions
- Minimum peers before recommending P2P: 3 (open decision #6, configurable in `p2pController.js`)
- A peer silent for 5 minutes stops counting (open decision #7)
- Opting out of seeding removes the student from every swarm immediately
- Uploads are limited to 50 MB

## Known limitations
- Magnet links are not generated yet: real WebTorrent seeding is not implemented
- No authentication, so upload and admin routes are open (open decision #3)
- Uploaded files are stored on local disk, not cloud storage
- Seed data covers Year 1 Semester 1 only

## Author
Silas Lutta. Built as part of a group university project; this is my version of the backend including API.