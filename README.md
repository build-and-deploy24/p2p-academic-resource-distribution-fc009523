# P2P Academic Resource Distribution System

## 1. Project Overview

The **P2P Academic Resource Distribution System** is a university-focused web application designed to reduce server congestion during examination periods by using peer-to-peer (P2P) technology to distribute academic resources.

Students often need to download lecture notes, revision materials, past examination papers, and other learning resources at the same time. This can put significant pressure on a university's central server and result in slow downloads or service interruptions.

This project aims to combine a central university server with peer-assisted file distribution. Where possible, students can obtain file data from other peers, reducing repeated downloads from the central server. The university server remains the authoritative source for academic resources and provides a fallback when peer transfers are unavailable.

## 2. Project Objectives

- Reduce congestion on the university's central file server.
- Improve the availability and download performance of academic resources.
- Enable peer-assisted file distribution using WebRTC-based technology.
- Organize resources by semester and academic unit.
- Support downloading multiple resources for an entire semester.
- Provide reliable server-based downloads when P2P transfers cannot be completed.
- Measure system performance under different levels of download demand.

## 3. Planned Features

The following features define the intended system. Their implementation status will be updated as development progresses.

- **Academic resource catalog:** Browse semesters, units, and available files.
- **File management:** Store resource metadata and manage files on the university server.
- **Direct downloads:** Download files from the central server.
- **Peer-assisted distribution:** Share file data between participating browsers using WebTorrent and WebRTC.
- **Server fallback:** Use the central server when peer-assisted delivery is unavailable or fails.
- **Semester-wide downloads:** Select individual units or an entire semester and download the associated resources in a batch.
- **Download progress:** Display download progress and relevant status information.
- **Performance monitoring:** Evaluate server load, download times, and peer-assisted distribution performance.

## 4. Technology Stack

The planned technology stack is:

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend API | Node.js, TypeScript, Fastify |
| Database | PostgreSQL |
| Database access | Prisma ORM |
| P2P distribution | WebTorrent, WebRTC |
| Tracker and connectivity | bittorrent-tracker, Coturn |
| Monitoring | Socket.IO, Recharts |
| Reverse proxy and deployment | Nginx, Docker |
| Performance testing | k6 |

Technologies will be integrated as the corresponding modules are implemented.

## 5. System Architecture

The intended system consists of the following components:

1. **Frontend:** Provides the student interface for browsing academic resources, selecting files, and monitoring downloads.
2. **Backend API:** Handles resource requests, validates operations, and coordinates access to the central resource catalog and file storage.
3. **PostgreSQL database:** Stores structured metadata, including semesters, units, files, users, and download sessions.
4. **Central file storage:** Holds the authoritative file copies and supports direct downloads and fallback delivery.
5. **P2P distribution layer:** Enables compatible peers to exchange file data using WebTorrent and WebRTC.
6. **Monitoring and testing:** Collects performance information and helps evaluate the system's effectiveness.

The database stores file metadata; actual file contents are stored separately. The implementation must preserve the central server's ability to provide the authoritative resource and fallback download.

## 6. Repository Structure

The repository is organized by project component. As development progresses, additional directories and modules will be added.

```text
p2p-academic-resource-distribution-fc009523/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── api-contract.md
├── frontend/
│   └── (planned)
├── .gitignore
└── README.md
```

This is a guide to the intended structure, not a guarantee that every planned component is already present.

## 7. Prerequisites

For backend development, install:

- Node.js and npm
- Git
- A code editor such as Visual Studio Code

PostgreSQL and the other services will be required as their respective modules are integrated.

## 8. Getting Started

### Clone the repository

```bash
git clone https://github.com/build-and-deploy24/p2p-academic-resource-distribution-fc009523.git
cd p2p-academic-resource-distribution-fc009523
```

### Set up the backend

```bash
cd backend
npm install
```

Start the development server:

```bash
npm run dev
```

The current health-check endpoint is available at:

```text
http://127.0.0.1:3000/health
```

A successful response should contain:

```json
{
  "status": "ok",
  "service": "p2p-academic-resource-distribution-api"
}
```

### Check TypeScript

From the `backend` directory, run:

```bash
npm run typecheck
```

This checks the backend TypeScript code for type errors without generating compiled output.

**Note:** Database configuration, frontend startup instructions, and full application setup will be documented when those components are integrated.

## 9. API Documentation

The proposed API contract is maintained in:

`docs/api-contract.md`

The contract describes the intended endpoints for checking service health, retrieving semesters and units, listing files, and downloading resources.

At the current stage, the health-check endpoint is implemented. Other endpoints described in the contract must be treated as planned until their implementation and tests are complete.

## 10. Development Workflow

The project uses Git and GitHub for collaborative development.

- `main` is reserved for the final, stable deliverable.
- `dev` is the integration branch.
- Feature branches are used for individual tasks.
- Changes are submitted through pull requests into `dev`.
- Team members review code before changes are merged.
- Commit messages should follow the Conventional Commits convention where practical.

Example branch names:

```text
feature/backend-routes
feature/database-design
feature/resource-catalog
feature/p2p-downloads
docs/api-contract
```

Before submitting a pull request, contributors should test their changes, check for unintended modifications, and update relevant documentation.

## 11. Security and Reliability

The implementation should follow these principles:

- Validate and sanitize incoming requests.
- Avoid exposing credentials, secrets, or sensitive configuration in source control.
- Validate uploaded files and enforce appropriate size and type restrictions.
- Verify file integrity before accepting a downloaded file as complete.
- Handle unavailable peers and failed transfers gracefully.
- Keep authoritative resource metadata under the control of the university server.
- Use appropriate access controls for protected resources when authentication is introduced.
- Avoid exposing internal filesystem paths through API responses.

## 12. Testing and Evaluation

The project will be tested incrementally, covering:

- API health and endpoint behavior.
- Database operations and resource retrieval.
- File upload and download correctness.
- P2P transfer and server-fallback behavior.
- Semester-wide batch downloads.
- Error handling and file integrity.
- Performance under simulated concurrent download demand.

Performance results should be recorded and compared against an appropriate server-only baseline where feasible.

## 13. Project Status

**Current development stage:** Backend foundation and API contract.

Completed or verified so far:

- Backend project scaffold.
- Fastify development server.
- Health-check endpoint.
- TypeScript type-check command.
- Initial API contract documentation.

Planned or still in progress:

- PostgreSQL integration and Prisma schema.
- Semester, unit, and file catalog endpoints.
- File storage and direct download implementation.
- React frontend integration.
- WebTorrent/WebRTC peer-assisted transfers.
- Server fallback, batch downloads, and performance evaluation.

This section should be updated as features are implemented, tested, and merged.

## 14. Team

**Project group:** Build And Deploy

This project is developed collaboratively, with responsibilities distributed across backend development, frontend development, database design, testing, documentation, and integration.

## 15. License

A license will be specified when the project team determines the appropriate distribution terms.
    