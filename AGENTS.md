# AGENTS.md — P2P Academic Resource Distribution System

## 1. Project Overview

This repository contains the implementation of the university capstone project:

**Design and Implementation of a Peer-Assisted (P2P) File Distribution System to Mitigate Server Congestion During University Exam Periods.**

The system aims to reduce congestion on a central university server by allowing students to obtain academic resources from other peers when possible, while retaining the authoritative server as the source of truth and fallback download provider.

The application should support browsing academic resources by semester and unit, downloading individual resources, peer-assisted file distribution, server fallback, and semester-wide or selected-unit batch downloads.

The implementation must remain practical, secure, testable, and achievable within the team's project timeline.

## 2. Instructions for AI Coding Agents

Any AI coding agent working in this repository must follow these rules.

1. Inspect the existing repository, current branch, working tree, relevant files, and project documentation before making changes.
2. Preserve working code. Do not rewrite existing implementations merely to follow personal preferences.
3. Make small, focused, reviewable changes.
4. Explain the purpose of each significant change and how it fits the architecture.
5. Do not assume that proposed API endpoints, database models, or features have already been implemented.
6. Follow the existing API contract and raise inconsistencies before changing public interfaces.
7. Do not modify unrelated files.
8. Do not delete, overwrite, reset, or discard existing work without explicit approval.
9. Do not commit, push, merge, rebase, or force-push unless explicitly authorized.
10. Do not expose secrets, credentials, tokens, or private environment configuration.
11. Never claim that code has been tested unless the relevant test was actually executed.
12. If tool output, source code, and test results conflict, investigate the discrepancy before proceeding.
13. When requirements are unclear, ask a focused question rather than inventing a design.
14. Provide manageable, sequential instructions to contributors who are still learning.
15. Do not install major dependencies, introduce new infrastructure, or make broad architectural changes without explaining the reason and obtaining approval when appropriate.

## 3. Technology Stack

The agreed target stack is:

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Node.js
- TypeScript
- Fastify

### Database and ORM
- MySql
- Prisma ORM

### Peer-to-peer distribution
- WebTorrent
- WebRTC
- A compatible BitTorrent tracker where required
- Coturn for TURN connectivity when required

### Monitoring and deployment
- Socket.IO
- Recharts
- Nginx
- Docker
- k6 for performance testing

Before using a technology, inspect the relevant package files and existing implementation. The target stack does not mean every component has already been installed or configured.

Do not introduce alternative frameworks, databases, or overlapping libraries without discussing the trade-offs with the Lead Developer.

## 4. Architecture and Responsibilities

### 4.1 Frontend

The frontend is responsible for:
- Browsing semesters, units, and available resources.
- Displaying file metadata.
- Initiating downloads and, where required, uploads.
- Showing download progress, loading states, errors, and retry options.
- Supporting batch downloads for selected units or a semester.
- Using the agreed backend API contract.

Frontend code must not connect directly to PostgreSQL or expose database credentials.

### 4.2 Backend API

The backend is responsible for:
- Exposing documented HTTP endpoints.
- Validating request parameters and request bodies.
- Applying business rules.
- Reading and writing resource metadata.
- Managing uploads and authoritative server-side file storage.
- Returning consistent success and error responses.
- Enforcing access controls and resource ownership where applicable.
- Providing server-side download fallback when peer-assisted delivery is unavailable.
- Recording relevant operational and performance metrics.

Use Fastify's existing application structure. Keep route definitions, business logic, persistence, and shared utilities separated when this improves maintainability.

Do not put the entire application into one large server file.

### 4.3 Database

Mysql stores structured metadata rather than the full binary contents of academic files.

The initial domain models are expected to include:
- `Semester`
- `Unit`
- `File`

Additional models may include:
- `User`
- `DownloadSession`
- `PeerRecord`

These are planned domain concepts, not a declaration that the models already exist.

Use Prisma for schema management and database access once its setup is verified. Do not create competing schemas or independently switch databases.

The `File` model should contain a storage reference such as `storageKey`, along with the agreed metadata. Actual file bytes must be stored using an appropriate file-storage mechanism.

Use migrations for database schema changes. Do not edit production data or run destructive migrations without explicit authorization.

### 4.4 P2P Delivery

The authoritative server and database remain the source of truth for resource metadata.

Peer-assisted delivery should:
1. Identify the requested resource and its valid metadata.
2. Establish peer-assisted delivery when supported.
3. Verify downloaded content integrity using an appropriate hash or integrity mechanism.
4. Fall back to the authoritative server when peers are unavailable or transfer fails.
5. Report download status and errors to the frontend.
6. Avoid treating untrusted peer data as authoritative metadata.

Do not claim that P2P delivery reduces server congestion until performance tests provide evidence.

## 5. API Contract

The API contract is documented in `docs/api-contract.md`, if present in the current repository. Read the current version before implementing or changing endpoints.

The documented initial endpoints include:

| Endpoint | Purpose |
|---|---|
| `GET /health` | Verify backend availability |
| `GET /api/semesters` | List semesters |
| `GET /api/semesters/:semesterId/units` | List units in a semester |
| `GET /api/units/:unitId/files` | List resources for a unit |
| `GET /api/files/:fileId/download` | Download a resource |

The health endpoint was previously implemented and tested. The remaining endpoints are proposals until verified in the current code.

Follow these principles:
- Use consistent response structures.
- Validate IDs and user input.
- Return appropriate HTTP status codes.
- Distinguish malformed requests, missing resources, and unexpected server failures.
- Do not expose stack traces, credentials, local filesystem paths, or internal implementation details to clients.
- Document changes to public endpoints and coordinate them with the frontend team.

The agreed error response shape is:

```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "The requested file was not found."
  }
}
```

Use an appropriate status code separately from the JSON response body.

Do not silently change existing response fields or endpoint paths.

## 6. Repository Structure

Follow the existing structure and extend it deliberately. A possible target organization is:

```text
/
├── AGENTS.md
├── README.md
├── docs/
│   ├── PROJECT_DOCUMENTATION.md
│   └── api-contract.md
├── frontend/
│   └── src/
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── server.ts
        ├── routes/
        ├── controllers/
        ├── services/
        ├── repositories/
        ├── schemas/
        ├── plugins/
        └── utils/
```

This is a proposed organization, not a requirement to create every directory immediately.

Only introduce a folder or abstraction when there is a clear use for it. Avoid speculative scaffolding.

The backend currently uses TypeScript with ESM-style imports and `NodeNext` module resolution. Inspect the actual configuration before changing import conventions.

## 7. Coding Standards

### TypeScript
- Prefer explicit types for public interfaces and function contracts.
- Use strict typing.
- Avoid `any` unless justified and documented.
- Use interfaces or types to represent API request and response shapes.
- Validate external input at runtime; TypeScript types alone do not validate HTTP requests.
- Keep functions small and focused.

### Fastify
- Use Fastify route registration patterns consistent with the existing code.
- Validate route parameters, query parameters, and request bodies.
- Handle errors consistently.
- Avoid duplicated response-formatting logic.
- Keep configuration separate from business logic where appropriate.

### React
- Use reusable components where useful.
- Keep API communication in a dedicated service layer.
- Represent loading, success, empty, and error states explicitly.
- Keep API response types aligned with the backend contract.

### General
- Use descriptive names.
- Avoid unnecessary dependencies.
- Avoid duplicated logic.
- Prefer readable code over clever abstractions.
- Add comments to explain non-obvious decisions, not to narrate every line.

## 8. Security Requirements

Security must be considered during implementation, not postponed until deployment.

- Never commit `.env` files containing secrets.
- Provide `.env.example` files with placeholder values only.
- Validate and constrain file uploads, including file size and accepted file types.
- Generate safe server-side storage names; never trust client-supplied filesystem paths.
- Prevent path traversal and unsafe file access.
- Apply authentication and authorization when required by the agreed project scope.
- Avoid logging passwords, tokens, session secrets, or sensitive file contents.
- Use parameterized database operations through Prisma or another approved safe mechanism.
- Enforce appropriate CORS and network-access policies.
- Treat peers and peer-supplied metadata as untrusted.
- Use integrity checks before accepting downloaded content as valid.
- Do not expose internal server errors to users.
- Do not disable security controls merely to make a test pass.

Report security-sensitive design decisions to the Lead Developer.

## 9. Error Handling and Observability

Use a consistent error response format throughout the API.

Expected error categories may include:
- Invalid request
- Validation failure
- Resource not found
- Conflict
- Unauthorized or forbidden access, when applicable
- File-storage failure
- Database failure
- P2P transfer failure
- Unexpected internal error

Use appropriate HTTP status codes and safe, useful messages.

Log server-side diagnostic details through the configured logger, but do not return stack traces or secrets to clients.

When adding logging or metrics, avoid recording unnecessary personal data.

## 10. Testing Requirements

Every meaningful change must be verified.

### Backend
- Run `npm run typecheck` from the backend directory.
- Run the relevant automated tests, if configured.
- Start the backend and test affected HTTP endpoints.
- Test expected success and failure cases.
- Verify status codes and response bodies.
- Test validation and missing-resource behavior.

### Database
- Verify the database connection.
- Apply Prisma migrations in the intended development database.
- Test relevant queries and constraints.
- Never assume a migration succeeded because its command was issued.

### File delivery
- Test valid and missing file requests.
- Test unsupported file types and upload-size limits where applicable.
- Verify file integrity.
- Test server fallback when peer delivery is unavailable.

### Performance
- Define the baseline and test scenarios before claiming congestion reduction.
- Record throughput, latency, error rate, and server resource usage as appropriate.
- Compare centralized delivery with the peer-assisted approach under controlled conditions.
- Document limitations and reproducible test steps.

Distinguish clearly between type-checking, unit tests, integration tests, manual endpoint tests, and performance tests.

## 11. Git and Collaboration

The canonical repository is:

`https://github.com/build-and-deploy24/p2p-academic-resource-distribution-fc009523`

The repository workflow uses:
- `main` for the final stable deliverable.
- `dev` for integration.
- Feature branches for individual tasks.
- Pull requests for reviewed changes.

Before starting work:
1. Check `git status`.
2. Confirm the branch.
3. Inspect recent commits.
4. Check whether the relevant feature already exists.

Use focused commits with Conventional Commit messages, such as:
- `feat(backend): add semester listing route`
- `fix(api): standardize validation errors`
- `test(backend): cover missing file responses`
- `docs(api): clarify download fallback behavior`

Do not commit generated build artifacts, `node_modules`, secrets, or local database files.

Do not push directly to protected branches. Do not overwrite another contributor's work.

Coordinate API changes with frontend and database contributors before merging incompatible changes.

## 12. Environment Configuration

Use environment variables for configuration such as:
- `PORT`
- `HOST`
- `DATABASE_URL`
- File-storage directory
- Allowed frontend origins
- Tracker or P2P configuration where required

Provide safe placeholder values in `.env.example`.

Never print or request the complete contents of a real `.env` file. When diagnosing configuration, inspect variable names and redact credentials.

Use a dedicated database and user for this project. Do not reuse or modify unrelated application databases, including databases managed by an existing Odoo installation.

Document the required environment variables in the relevant README.

## 13. Definition of Done

A task is complete only when:
- Its scope and acceptance criteria are clear.
- The implementation follows the existing architecture and API contract.
- Relevant input validation and error handling are present.
- The code has been type-checked.
- Relevant tests have been run, with results reported accurately.
- Documentation has been updated when necessary.
- No unrelated work or secrets have been included.
- The change is ready for review.
- Any remaining limitations are documented.

For API endpoints, completion additionally requires a demonstrated request and response, including at least one meaningful failure case.

For database work, completion requires verification against the intended development database.

For P2P delivery, completion requires evidence that the actual transfer and fallback behavior work; a mocked UI is not sufficient.

## 14. Priorities

Work in this order unless the Lead Developer explicitly changes priorities:

1. Verify the existing scaffold and health endpoint.
2. Finalize the API contract and shared response/error conventions.
3. Establish the PostgreSQL and Prisma development connection.
4. Implement the initial database schema and migrations.
5. Implement semester, unit, and file metadata routes.
6. Implement safe file storage and direct server downloads.
7. Integrate WebTorrent/WebRTC delivery and server fallback.
8. Implement basic batch downloads and progress reporting.
9. Add automated integration tests.
10. Measure performance and document results.
11. Complete deployment and demonstration documentation.

Avoid spending time on advanced dashboards or speculative features before the core flow is demonstrated.

## 15. Communication Expectations

When proposing work, state:
- What needs to change.
- Why the change is necessary.
- Which files are affected.
- What the implementation does.
- How to verify it.
- What remains incomplete.

Give one manageable next step at a time when guiding a beginner.

If the current repository contradicts this document, inspect the evidence and report the difference before changing code. The repository's actual state and approved project decisions take precedence over assumptions in this file.

**Primary objective:** deliver a reliable, secure, testable P2P academic resource distribution system while keeping the implementation understandable and maintainable for the student team.