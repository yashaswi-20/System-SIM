# Detailed Backend Handoff Notes for Vikash

Date: 4 Jul 2026

This file is the detailed handoff summary for the current backend state. It follows the same order as the work captured in `DevNotes.md`, then documents the current code flow and latest Redis cache changes.

## Current Backend Stack

The backend currently uses:

- Express
- TypeScript
- PostgreSQL using the `pg` package
- Redis using the `redis` package
- Zod for request validation
- Winston for logging
- dotenv for environment variables

Main backend files:

- `backend/src/server.ts`
- `backend/src/app.ts`

## Work Completed In Order

### Yashaswi - 15 Jun 2026

Initial backend setup:

- Set up the backend with Express and TypeScript.
- Added a health route to verify the server is running.
- Created `AppError` for custom errors with status codes.
- Added `asyncHandler` to catch async route errors automatically.
- Added a global error middleware for consistent error responses.
- Set up Winston logger for console and file-based logging.

Important files:

- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/utils/AppError.ts`
- `backend/src/utils/AsyncHandler.ts`
- `backend/src/middleware/err.middleware.ts`
- `backend/src/utils/logger.ts`
- `backend/src/routes/healthRouter.ts`

### Vikash - 16 Jun 2026

Validation and request parsing:

- Added request validation for user routes using Zod.
- Created `userSchema` in `backend/src/validators/user.validator.ts`.
- The schema validates that `name` has at least 3 characters.
- The schema validates that `email` is a valid email address.
- Added reusable validation middleware in `backend/src/middleware/validate.middleware.ts`.
- The validation middleware returns status `400` and `error.issues` when validation fails.
- Added `express.json()` in `app.ts` so JSON request bodies are parsed.
- Noted that macOS reserves port `5000` for AirPlay, so the backend uses port `4000`.

Important files:

- `backend/src/validators/user.validator.ts`
- `backend/src/middleware/validate.middleware.ts`
- `backend/src/routes/user.routes.ts`
- `backend/src/app.ts`

### Yashaswi - 16 Jun 2026

PostgreSQL support:

- Added PostgreSQL support using the `pg` package.
- Created a shared PostgreSQL pool in `backend/src/database/postgres.ts`.
- The pool reads `DATABASE_URL` from the environment.
- Enabled dotenv loading in `backend/src/server.ts`.
- Updated the port config to use `process.env.PORT` with `4000` as fallback.
- Added URL-encoded body parsing in `app.ts`.
- Created a `/db-test` route that runs `SELECT NOW()` for database testing.
- Added temporary error logging in the global error middleware.

Important files:

- `backend/src/database/postgres.ts`
- `backend/src/routes/testRoute.ts`
- `backend/src/server.ts`
- `backend/src/app.ts`
- `backend/src/middleware/err.middleware.ts`

### Yashaswi - 17 Jun 2026

User type, repository, and service layer:

- Added the `User` interface in `backend/src/types/user.types.ts`.
- Created `UserRepository` in `backend/src/repositories/user.repository.ts`.
- Added repository methods for:
  - `findAll()`
  - `findById(id)`
  - `findByEmail(email)`
  - `create(name, email)`
  - `delete(id)`
- Fixed the Postgres pool import to use the default export from `database/postgres.ts`.
- Fixed the user list query to use `ORDER BY created_at DESC`.
- Updated `findAll()` to return `Promise<User[]>`.
- Created `UserService` in `backend/src/services/user.service.ts`.
- Added duplicate email checking in `createUser()`.
- Added `AppError("Email already Exist", 409)` when the email already exists.
- Added a first user route for fetching users.
- Created this detailed handoff file.

Important files:

- `backend/src/types/user.types.ts`
- `backend/src/repositories/user.repository.ts`
- `backend/src/services/user.service.ts`
- `backend/src/routes/user.routes.ts`
- `DetailedNotes.md`

### Current User Controller And Routes

The current route layer now uses `UserController`.

Current route file:

- `backend/src/routes/user.routes.ts`

Current routes:

```ts
router.get("/", controller.getUser);
router.get("/:id", controller.getUserById);
router.post("/", controller.createUser);
router.delete("/:id", controller.deleteUser);
```

The current flow is:

```txt
Route -> Controller -> Service -> Repository -> Database
```

For `GET /users/:id`, the current flow includes Redis:

```txt
Route -> Controller -> Service -> Redis
                         |
                         -> Repository -> Database
```

Current controller file:

- `backend/src/controllers/user.controller.ts`

Controller methods:

- `getUser`
- `getUserById`
- `createUser`
- `deleteUser`

### Yashaswi - 4 Jul 2026

Redis cache metrics and user caching:

- Created `backend/src/cache/cacheMetrices.ts`.
- Added in-memory counters for:
  - `cacheHits`
  - `cacheMisses`
  - `hitRate`
- Added `incrementHits()`.
- Added `incrementMisses()`.
- Added `getMetrics()`.
- Imported `cacheMetrices` into `backend/src/app.ts`.
- Added `GET /cache/stats` in `app.ts`.
- Kept `GET /redis-test` in `app.ts` for a Redis smoke test.
- Mounted the user router at `/users`.
- Imported `redisClient`, `cacheMetrices`, and `logger` into `UserService`.
- Updated `getUserById(id)` to check Redis before PostgreSQL.
- Uses the Redis key format `user:${id}`.
- On cache hit:
  - increments cache hits
  - logs `Cache HIT for user ${id}`
  - parses the cached JSON
  - returns the cached user
- On cache miss:
  - fetches the user from PostgreSQL
  - throws `AppError("User not found", 404)` if no user exists
  - increments cache misses
  - logs `Cache MISS for user ${id}`
  - stores the user in Redis for 1 hour using `EX: 3600`
  - returns the database user
- Updated `createUser(name, email)` to cache the newly created user under `user:${newUser.id}`.
- Updated `deleteUser(id)` to delete the user from PostgreSQL and delete the matching Redis key.

Important files:

- `backend/src/cache/redis.ts`
- `backend/src/cache/cacheMetrices.ts`
- `backend/src/services/user.service.ts`
- `backend/src/app.ts`

## Current App Wiring

Current middleware and routes in `backend/src/app.ts`:

```ts
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/redis-test", async (req, res) => {
    await redisClient.set("test", "hello redis");
    const value = await redisClient.get("test");
    res.json({ value });
});

app.use("/health", healthRouter);
app.use("/users", userRouter);

app.get("/cache/stats", (req, res) => {
    res.status(200).json(cacheMetrices.getMetrics());
});

app.use(errorHandler);
```

Current active endpoints:

```txt
GET    /health
GET    /redis-test
GET    /users
GET    /users/:id
POST   /users
DELETE /users/:id
GET    /cache/stats
```

Important route note:

- The current user base path is `/users`.
- Older notes mentioned `/user`; that is no longer the current mounted path.

## Current Redis Files

Redis client file:

- `backend/src/cache/redis.ts`

Current behavior:

- Creates the Redis client with `createClient()`.
- Logs Redis client errors with Winston.
- Connects immediately when the module is imported.
- Logs success when Redis connects.
- Logs failure if Redis connection fails.
- Exports `redisClient`.

Cache metrics file:

- `backend/src/cache/cacheMetrices.ts`

Current metric response shape:

```json
{
  "cacheHits": 0,
  "cacheMisses": 0,
  "hitRate": "0.00%"
}
```

Notes:

- Metrics are stored in memory, so they reset when the backend process restarts.
- Metrics currently count `getUserById()` cache hits and misses.
- The file and export are currently named `cacheMetrices`.

## Current User Service Behavior

Current service file:

- `backend/src/services/user.service.ts`

Methods:

- `getUsers()`
- `getUserById(id)`
- `createUser(name, email)`
- `deleteUser(id)`

### `getUsers()`

Fetches all users from PostgreSQL through `UserRepository.findAll()`.

### `getUserById(id)`

Uses Redis first:

```txt
Redis key: user:${id}
```

Behavior:

- Reads from Redis with `redisClient.get(cacheKey)`.
- If cached data exists, it increments cache hits and returns `JSON.parse(cacheData)`.
- If cached data does not exist, it reads from PostgreSQL.
- If PostgreSQL returns no user, it throws `AppError("User not found", 404)`.
- If PostgreSQL returns a user, it increments cache misses and caches the user for 1 hour.

### `createUser(name, email)`

Behavior:

- Checks for an existing user by email.
- Throws status `409` if the email already exists.
- Creates the user in PostgreSQL.
- Stores the newly created user in Redis using `user:${newUser.id}`.
- Returns the created user.

### `deleteUser(id)`

Behavior:

- Deletes the user from PostgreSQL.
- Deletes the Redis cache key `user:${id}`.
- Does not currently return the deleted user.

## How To Run And Test

From the backend folder:

```bash
cd backend
npm run dev
```

Expected server URL:

```txt
http://localhost:4000
```

Requirements:

- PostgreSQL must be running.
- `.env` must contain `DATABASE_URL`.
- Redis must be running and reachable by the default Redis client config.
- The database must have a `users` table.

The `users` table should match the current `User` type:

```ts
export interface User {
    id: string,
    name: string,
    email: string,
    created_at: Date;
}
```

Manual test order:

```txt
GET    http://localhost:4000/health
GET    http://localhost:4000/redis-test
POST   http://localhost:4000/users
GET    http://localhost:4000/users
GET    http://localhost:4000/users/:id
GET    http://localhost:4000/users/:id
GET    http://localhost:4000/cache/stats
DELETE http://localhost:4000/users/:id
GET    http://localhost:4000/users/:id
```

Expected cache behavior:

- The first `GET /users/:id` should miss Redis, fetch from PostgreSQL, and cache the user.
- The second `GET /users/:id` for the same id should hit Redis.
- `GET /cache/stats` should show updated `cacheHits`, `cacheMisses`, and `hitRate`.
- `DELETE /users/:id` should remove the database row and delete the Redis cache key.

## Important Pending Work

Pending items:

- Add validation middleware to `POST /users` using the existing Zod `userSchema`.
- Decide whether missing deletes should return `404` instead of always returning success.
- Consider changing `UserRepository.delete(id)` to return `Promise<User | null>`.
- Align Redis TTL behavior: `getUserById()` caches with `EX: 3600`, while `createUser()` currently stores without an expiry.
- Decide whether to rename `cacheMetrices` to `cacheMetrics` for spelling consistency.
- Decide whether `/redis-test` should remain in production-facing app wiring.
- Decide whether `/db-test` should be re-mounted or kept only as old test code.
- Consider adding a Redis URL environment variable if local/default Redis is not enough.
- Add automated tests for service caching behavior and user controller routes.

## Short Summary

The backend now has a full user flow through route, controller, service, and repository layers. Users are mounted under `/users`. Redis is connected through `backend/src/cache/redis.ts`, individual user lookups are cached by id, and `GET /cache/stats` exposes in-memory cache hit and miss metrics.
