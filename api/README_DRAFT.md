# Rumblr API

Rumblr API is the backend service for our debate-focused social app. It handles authentication, onboarding statements, mismatch discovery, rumble requests, active rumble conversations, messages, blocking, reporting, and live Socket.IO updates.

**Local API URL:** `http://localhost:3001/api`  
**API Documentation:** Swagger is available at `/api/docs`

---

## Tech Stack

- **Runtime & Framework:** Node.js, Express
- **Database & Query Builder:** SQLite locally, PostgreSQL on Render, managed with Knex
- **Authentication:** JWT, bcrypt
- **Validation:** Zod
- **Realtime:** Socket.IO
- **Testing:** Jest, Supertest
- **API Docs:** Swagger / OpenAPI

---

## Getting Started

### Prerequisites

- Node.js
- npm
- SQLite for local development. No separate local database server is required.
- PostgreSQL for the deployed Render environment.

### Local Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd rumblr/api
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file from the template:

   ```bash
   cp .env-template .env
   ```

   Then update the values for your local setup.

   Local development uses SQLite by default:

   ```env
   PORT=3001
   DB_CLIENT=sqlite3
   DB_SQLITE_FILENAME="./src/database.sqlite3"
   DB_USE_NULL_AS_DEFAULT=true
   ```

   Other required values, such as JWT and admin bootstrap values, should be set in `.env` or in Render environment variables. 

4. **Initialize the database:**

   ```bash
   npm run db:migrate
   ```

   To load demo data:

   ```bash
   npm run db:seed
   ```

   Note: seeds reset demo tables, so avoid running seeds if you want to keep manually created local data.

5. **Start the server:**

   ```bash
   npm run dev
   ```

   The API should now be running at:

   ```text
   http://localhost:3001/api
   ```

---

## Deployment Notes

The deployed API is configured on Render and uses PostgreSQL.

For Render, set the database variables in the Render dashboard instead of committing them:

```env
DB_CLIENT=pg
DB_HOST=<render-postgres-host>
DB_PORT=5432
DB_USER=<render-postgres-user>
DB_PASSWORD=<render-postgres-password>
DB_DATABASE_NAME=<render-postgres-database>
DB_USE_SSL=true
```

Keep JWT secrets, admin bootstrap credentials, and database credentials only in environment variables.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive an access token | No |

### Current User

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | `/api/user` | Get the current user's profile | Yes |
| PUT | `/api/user` | Update the current user's profile | Yes |
| DELETE | `/api/user` | Delete the current user's account | Yes |
| GET | `/api/user/onboarding` | Get onboarding progress | Yes |

### Statements and Responses

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | `/api/statements` | Get an unanswered statement | Yes |
| POST | `/api/statements/:id/respond` | Submit a response to a statement | Yes |
| GET | `/api/statements/onboarding/:number` | Get onboarding statement by number | Yes |
| GET | `/api/statements/responses` | Get current user's responses | Yes |
| GET | `/api/statements/list` | List all statements | Admin |
| POST | `/api/statements` | Create a statement | Admin |
| PATCH | `/api/statements/:id` | Update a statement | Admin |
| DELETE | `/api/statements/:id` | Delete a statement | Admin |

### Mismatches and Requests

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | `/api/mismatches` | Get mismatches for the current user | Yes |
| GET | `/api/mismatches/requests` | Get incoming and outgoing rumble requests | Yes |
| POST | `/api/mismatches/:id` | Send a rumble request to a user | Yes |
| POST | `/api/mismatches/:id/accept` | Accept a rumble request | Yes |
| POST | `/api/mismatches/:id/decline` | Decline a rumble request | Yes |

### Rumbles and Messages

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | `/api/rumbles` | Get active/inactive rumbles for the current user | Yes |
| PUT | `/api/rumbles/:id/terminate` | Terminate a rumble | Yes |
| GET | `/api/rumbles/:id/messages` | Get messages for a rumble | Yes |
| POST | `/api/rumbles/:id/messages` | Send a message in a rumble | Yes |

### Blocking and Reports

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| GET | `/api/user/blocks` | Get users blocked by the current user | Yes |
| POST | `/api/user/blocks/:id` | Block a user | Yes |
| DELETE | `/api/user/blocks/:id` | Unblock a user | Yes |
| POST | `/api/users/:id/report` | Report a user | Yes |
| GET | `/api/users/reports` | List user reports | Admin |

---

## Running Tests

Run all tests:

```bash
npm run test
```

Run focused test groups:

```bash
npm run test:auth
npm run test:users
npm run test:rumbles
npm run test:messages
npm run test:mismatches
```

---

## Database Schema Summary

- **users:** Stores account data, profile fields, role, status, and threat level preferences.
- **statements:** Stores prompts that users respond to during onboarding and matching.
- **responses:** Stores each user's answer and importance score for a statement.
- **mismatches:** Stores calculated mismatch scores between user pairs.
- **rumble_requests:** Stores pending, accepted, and declined requests between users.
- **rumbles:** Stores active, inactive, or terminated debate relationships.
- **messages:** Stores message history for rumbles.
- **blocks:** Stores blocked-user relationships.
- **user_reports:** Stores reports made against users, optionally linked to a rumble.

---

## Realtime Events

Socket.IO is used for live rumble message updates.

Client events:

- `rumble:join`
- `rumble:leave`

Server events:

- `rumble:message`

Sockets authenticate with the same JWT access token through `socket.handshake.auth.token`.
