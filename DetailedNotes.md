# Detailed Backend Handoff Notes for Vikash

Date: 17 Jun 2026

This file is a detailed handoff summary of what has been done in the repository so far, based on `DevNotes.md` and the backend files currently present in the project.

## Current Backend Stack

The backend is built with:

- Express
- TypeScript
- PostgreSQL using the `pg` package
- Zod for request validation
- Winston for logging
- dotenv for environment variables

The backend entry point is:

- `backend/src/server.ts`

The Express app setup is in:

- `backend/src/app.ts`

## Work Completed Earlier

### Yashaswi - 15 Jun 2026

Yashaswi set up the initial backend structure using Express and TypeScript.

Completed items:

- Created the Express backend.
- Added a health route to verify that the server is running.
- Created `AppError` for custom application errors with status codes.
- Added `asyncHandler` to automatically catch async route errors.
- Added a global error middleware for consistent error responses.
- Set up Winston logger for console and file-based logging.

Important files from this phase:

- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/utils/AppError.ts`
- `backend/src/utils/AsyncHandler.ts`
- `backend/src/middleware/err.middleware.ts`
- `backend/src/utils/logger.ts`
- `backend/src/routes/healthRouter.ts`

### Vikash - 16 Jun 2026

Vikash added validation support for user routes using Zod.

Completed items:

- Added `userSchema` in `backend/src/validators/user.validator.ts`.
- The schema validates:
  - `name` must be at least 3 characters.
  - `email` must be a valid email address.
- Added a reusable `validate` middleware in `backend/src/middleware/validate.middleware.ts`.
- The validation middleware parses `req.body` and returns status `400` when validation fails.
- For Zod v4, validation errors are read from `error.issues`, not `error.errors`.
- Mounted the user router in `app.ts`.
- Added `express.json()` in `app.ts` so JSON request bodies are parsed.
- Noted that macOS reserves port `5000` for AirPlay, so the backend uses port `4000`.

Important files from this phase:

- `backend/src/validators/user.validator.ts`
- `backend/src/middleware/validate.middleware.ts`
- `backend/src/routes/user.ts`
- `backend/src/app.ts`

### Yashaswi - 16 Jun 2026

Yashaswi added PostgreSQL database support.

Completed items:

- Installed and configured PostgreSQL support using the `pg` package.
- Created a shared PostgreSQL pool in `backend/src/database/postgres.ts`.
- The pool reads the database connection string from `process.env.DATABASE_URL`.
- Enabled dotenv loading in `backend/src/server.ts` using:

```ts
import 'dotenv/config';
```

- Updated port configuration so the server uses `process.env.PORT` or falls back to `4000`.
- Added URL-encoded body parsing in `app.ts` for form-style payloads.
- Created a `/db-test` route that runs:

```sql
SELECT NOW()
```

- Mounted the DB test route in `app.ts`.
- Added temporary error logging in the global error middleware to make backend failures easier to debug.

Important files from this phase:

- `backend/src/database/postgres.ts`
- `backend/src/routes/testRoute.ts`
- `backend/src/server.ts`
- `backend/src/app.ts`
- `backend/src/middleware/err.middleware.ts`

## Changes Made Today - 17 Jun 2026

Today, Yashaswi started building the user repository and service layer.

The main goal was to move user-related database operations into a repository class and then call those repository methods from a service class.

### User Type Added

A `User` interface exists in:

- `backend/src/types/user.types.ts`

Current shape:

```ts
export interface User {
    id: string,
    name: string,
    email: string,
    created_at: Date;
}
```

This type represents rows from the `users` table.

### User Repository Added

The repository is in:

- `backend/src/repositories/user.repository.ts`

The repository imports the shared Postgres pool:

```ts
import pool from "../database/postgres"
```

Important note: `pool` is a default export from `database/postgres.ts`, so it must be imported without curly braces.

Correct:

```ts
import pool from "../database/postgres"
```

Incorrect:

```ts
import { pool } from "../database/postgres"
```

Current repository methods:

- `findAll()`
- `findById(id: string)`
- `create(name: string, email: string)`
- `delete(id: string)`
- `findByEmail(email: string)`

Current implementation summary:

```ts
export class UserRepository {
    async findAll(): Promise<User[]> {
        const result = await pool.query<User>(
            `SELECT * FROM users ORDER BY created_at DESC`
        );
        return result.rows;
    }

    async findById(id: string): Promise<User | null> {
        const result = await pool.query(
            `SELECT * FROM users WHERE id = $1`, [id]
        )
        return result.rows[0] || null
    }

    async create(name: string, email: string): Promise<User> {
        const result = await pool.query(
            `INSERT INTO users (name,email) VALUES ($1, $2) RETURNING *`, [name, email]
        )
        return result.rows[0]
    }

    async delete(id: string): Promise<User> {
        const result = await pool.query(
            `DELETE FROM users WHERE id=$1 RETURNING *`, [id]
        )
        return result.rows[0]
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(
            `SELECT * FROM users WHERE email=$1`, [email]
        )
        return result.rows[0] || null;
    }
}
```

Important correction made today:

- SQL should use `ORDER BY`, not `ORDERED BY`.
- `findAll()` returns an array, so its return type should be `Promise<User[]>`, not `Promise<User | null>`.

### User Service Added

The service is in:

- `backend/src/services/user.service.ts`

The service creates a private repository instance:

```ts
private repository = new UserRepository();
```

This means the repository belongs to each `UserService` object and is accessed using:

```ts
this.repository
```

Current service methods:

- `getUsers()`
- `getUserById(id: string)`
- `createUser(name: string, email: string)`
- `deleteUser(id: string)`

Current implementation summary:

```ts
export class UserService {
    private repository = new UserRepository();

    async getUsers() {
        return await this.repository.findAll();
    }

    async getUserById(id: string) {
        return await this.repository.findById(id);
    }

    async createUser(name: string, email: string) {
        const existingUser = await this.repository.findByEmail(email);

        if (existingUser) {
            throw new AppError("Email already Exist", 409);
        }

        return await this.repository.create(name, email);
    }

    async deleteUser(id: string) {
        return await this.repository.delete(id);
    }
}
```

Why `this.repository` is used:

- `repository` is a class property.
- Class properties must be accessed through `this`.
- Without `this`, TypeScript looks for a local variable named `repository`, which does not exist.

Example:

```ts
this.repository.findAll(); // correct
repository.findAll();      // incorrect unless a local/global repository variable exists
```

Why this structure is useful:

- The service owns its repository dependency.
- The same repository instance can be reused across service methods.
- It keeps database logic in the repository and business logic in the service.
- Later, the repository can be injected through the constructor to make testing easier.

Possible future testing-friendly version:

```ts
export class UserService {
    constructor(private repository = new UserRepository()) {}

    async getUsers() {
        return this.repository.findAll();
    }
}
```

### Current User Route

The current user route is in:

- `backend/src/routes/user.routes.ts`

Current route:

```ts
router.get("/", asyncHandler(async (req, res) => {
    const users = await userRepository.findAll();
    res.status(200).json({ success: true, users });
}));
```

This means:

- `GET /user` currently returns all users from the database.
- It currently calls `UserRepository` directly.
- The next improvement should be to call `UserService` instead of calling the repository directly from the route.

Recommended next route structure:

```ts
const userService = new UserService();

router.get("/", asyncHandler(async (req, res) => {
    const users = await userService.getUsers();
    res.status(200).json({ success: true, users });
}));
```

This would keep the flow cleaner:

```txt
Route -> Service -> Repository -> Database
```

## Current App Wiring

In `backend/src/app.ts`, the current user router is mounted as:

```ts
app.use("/user", userRouter);
```

So the current user list endpoint is:

```txt
GET http://localhost:4000/user
```

The health route is:

```txt
GET http://localhost:4000/health
```

The async error test route is:

```txt
GET http://localhost:4000/user-test
```

Note: The older `/db-test` route was mentioned in `DevNotes.md`, but the current `app.ts` no longer mounts `testRoute`. If we still want `/db-test`, it should be re-added to `app.ts`.

## How to Run and Test

From the backend folder:

```bash
cd backend
npm run dev
```

The server should run on:

```txt
http://localhost:4000
```

To test whether the backend is alive:

```txt
GET http://localhost:4000/health
```

To test fetching users:

```txt
GET http://localhost:4000/user
```

Requirements for the user endpoint:

- `.env` must contain `DATABASE_URL`.
- PostgreSQL must be running.
- The connected database must have a `users` table.
- The `users` table should contain columns matching the `User` interface:
  - `id`
  - `name`
  - `email`
  - `created_at`

The project currently compiles successfully with:

```bash
npm run build
```

## Important Pending Work

The following items should be handled next:

- Connect `user.routes.ts` to `UserService` instead of using `UserRepository` directly.
- Fill in `backend/src/controllers/user.controller.ts` or remove it if we do not plan to use a controller layer.
- Decide the final route flow:

```txt
Route -> Controller -> Service -> Repository
```

or:

```txt
Route -> Service -> Repository
```

- Add routes for:
  - `GET /user/:id`
  - `POST /user`
  - `DELETE /user/:id`
- Use the existing Zod validation middleware for creating users.
- Decide what response should be returned when deleting a user that does not exist.
- Consider changing `delete(id)` return type to `Promise<User | null>` because `DELETE ... RETURNING *` can return no rows.
- Consider using `pool.query<User>()` consistently in all repository methods for stronger TypeScript typing.
- Confirm whether `/db-test` should remain available and re-mount it if needed.

## Short Summary for Vikash

The backend now has the foundation for a proper user module. Earlier work set up Express, error handling, logging, validation, and PostgreSQL. Today, Yashaswi added the `User` type, `UserRepository`, and `UserService`.

The current working endpoint is:

```txt
GET /user
```

It returns all users ordered by `created_at DESC`.

The next best step is to connect the route to `UserService`, then add full CRUD routes using the existing repository and validation middleware.
