# API Contract — P2P Academic Resource Distribution System

**Status:** Proposed  
**Version:** 1.0  
**Owner:** Backend team

## 1. General conventions

- JSON API endpoints use the `/api` prefix, except for the health check.
- Request and response bodies use JSON unless an endpoint returns a file.
- Resource identifiers are represented as strings.
- List endpoints return their results inside a `data` field.
- Errors follow a consistent response structure.
- These endpoints are proposed; they are not all implemented yet.

## 2. Health check

**GET `/health`**

Purpose: Verify that the backend API is running.

Example response:

```json
{
  "status": "ok",
  "service": "p2p-academic-resource-distribution-api"
}
```

This endpoint is already implemented in the backend scaffold.

## 3. List semesters

**GET `/api/semesters`**

Purpose: Return semesters available to students.

Proposed response:

```json
{
  "success": true,
  "data": [
    {
      "id": "semester-id",
      "name": "Year 1 Semester 1"
    }
  ]
}
```

## 4. List units in a semester

**GET `/api/semesters/:semesterId/units`**

Purpose: Return the academic units belonging to a semester.

- Return `200 OK` when the request succeeds.
- Return `404 Not Found` if the semester does not exist.

## 5. List files in a unit

**GET `/api/units/:unitId/files`**

Purpose: Return academic resources available for a unit.

The final file metadata should include, at minimum:

- `id`: unique file identifier
- `title`: display name
- `fileType`: file format
- `sizeBytes`: file size in bytes

P2P availability metadata will be agreed upon when the file model is designed.

## 6. Download a file

**GET `/api/files/:fileId/download`**

Purpose: Download a resource from the authoritative server.

- Return the file bytes on success, not a JSON representation of the file.
- Return `404 Not Found` if the file does not exist.
- Set appropriate `Content-Type` and `Content-Disposition` headers.
- Keep the server download available as a fallback if P2P transfer fails.

## 7. Error response format

Example:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found."
  }
}
```

Use appropriate HTTP status codes, including:

- `400 Bad Request` — invalid input
- `404 Not Found` — resource does not exist
- `500 Internal Server Error` — unexpected server failure

## 8. Open decisions

The team must agree on the following before the related endpoints are implemented:

1. How semesters and academic years are named.
2. The final metadata fields returned for each file.
3. Whether authentication and access control are required for uploads and downloads.
4. How the API exposes P2P availability and server fallback to the frontend.
5. Whether file uploads are part of the first working prototype.

## 9. Definition of done

- [ ] Endpoint names and purposes are documented.
- [ ] Example responses are included.
- [ ] Implemented and proposed endpoints are clearly distinguished.
- [ ] Open decisions are recorded.
- [ ] The document is committed on a feature branch and submitted through a pull request to `dev`..