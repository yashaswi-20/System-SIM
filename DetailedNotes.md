# Detailed Backend Handoff Notes for Vikash

Date: 14 Jul 2026

This file is the detailed handoff summary for the current backend state. It follows the same order as the work captured in `DevNotes.md`, then documents the current code flow, Redis cache behavior, and latest authentication/JWT changes.

## Current Backend Stack

The backend currently uses:

- Express
- TypeScript
- PostgreSQL using the `pg` package
- Redis using the `redis` package
- Zod for request validation
- Winston for logging
- dotenv for environment variables
- bcrypt for password hashing and comparison
- jsonwebtoken for JWT access-token generation

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

Current `POST /users` body expectation:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
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

Important security note:

- `createUser()` removes `password` before returning the new user.
- `getUser()` and `getUserById()` currently read with `SELECT *`, so password hashes may still appear in read responses unless sanitized.
- This should be fixed before exposing these endpoints beyond local development.

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

### Yashaswi - 14 Jul 2026

Authentication, password hashing, and JWT support:

- Added auth module files under `backend/src/auth`.
- Added `backend/src/auth/auth.service.ts`.
- Added `backend/src/auth/auth.controller.ts`.
- Added `backend/src/auth/auth.routes.ts`.
- Mounted the auth router in `backend/src/app.ts` at `/auth`.
- Added `bcrypt` and `jsonwebtoken` dependencies.
- Added `backend/src/utils/password.ts` with:
  - `hashPassword(password)`
  - `comparePassword(password, hash)`
- Added `backend/src/utils/jwt.ts`.
- Added a typed JWT payload containing:
  - `id`
  - `email`
  - `role`
- JWT signing reads:
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
- JWT signing currently falls back to:
  - secret: `fallback-secret-do-not-use-in-prod`
  - expiry: `15m`
- Fixed the `jwt.sign()` TypeScript overload issue by typing:
  - `JWT_SECRET` as `Secret`
  - `JWT_EXPIRES_IN` as `SignOptions["expiresIn"]`
- Updated `User` to include:
  - optional `password`
  - required `role`
- Updated `UserRepository.create()` to insert:
  - `name`
  - `email`
  - `password`
  - `role`
- `UserRepository.create()` defaults role to `USER`.
- Updated user creation so `POST /users` accepts a password, hashes it, stores the hash, deletes the password from the returned object, and caches the safe returned object.
- Added `registerSchema` and `loginSchema` in `backend/src/validators/auth.validator.ts`.
- Added login behavior in `AuthService.login(email, passwordPlain)`.
- Login finds the user by email, compares the password hash, returns generic `Invalid credentials` errors on failure, signs an access token on success, removes `password`, and returns `{ user, accessToken }`.

Important current route mismatch:

- `backend/src/auth/auth.routes.ts` currently defines `POST /auth/register`.
- That route currently uses `validate(registerSchema)`.
- That route currently calls `controller.login`.
- So the configured path says register, the validator expects a register-shaped body, but the controller behavior is login.
- Before auth is considered complete, this should be changed to either:
  - `POST /auth/login` with `loginSchema` and `controller.login`
  - or a real `POST /auth/register` route using a restored register controller/service method

Important files:

- `backend/src/auth/auth.routes.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/validators/auth.validator.ts`
- `backend/src/utils/password.ts`
- `backend/src/utils/jwt.ts`
- `backend/src/repositories/user.repository.ts`
- `backend/src/types/user.types.ts`

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
app.use("/auth", authRouter);
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
POST   /auth/register
GET    /users
GET    /users/:id
POST   /users
DELETE /users/:id
GET    /cache/stats
```

Important route note:

- The current user base path is `/users`.
- Older notes mentioned `/user`; that is no longer the current mounted path.
- The current auth base path is `/auth`.
- `POST /auth/register` is currently configured, but it currently executes login behavior. See the auth mismatch note above.

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

## Current Auth Flow

Current auth files:

- `backend/src/auth/auth.routes.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/validators/auth.validator.ts`
- `backend/src/utils/password.ts`
- `backend/src/utils/jwt.ts`

Current configured auth route:

```ts
router.post("/register", validate(registerSchema), controller.login);
```

Actual current behavior:

- Mounted path is `POST /auth/register`.
- The request is validated with `registerSchema`.
- The controller method that runs is `login`.
- `login` expects `email` and `password`.
- `AuthService.login()` finds the user by email.
- It compares the submitted password with the stored bcrypt hash using `comparePassword()`.
- It throws `AppError("Invalid credentials", 401)` if the email is missing or the password is wrong.
- It signs an access token with `generateAccessToken()`.
- It removes `user.password` before returning.
- It returns `{ user, accessToken }`.

Current JWT payload:

```ts
{
  id: user.id,
  email: user.email,
  role: user.role
}
```

Current auth validation schemas:

- `registerSchema` requires `name`, valid `email`, and `password` between 8 and 64 characters.
- `loginSchema` requires valid `email` and a non-empty `password`.

Important caution:

- The register method in `AuthController` and `AuthService` is currently commented out.
- There is currently no configured `POST /auth/login` route.
- The current `POST /auth/register` route behaves like login, not registration.
- This route should be corrected before frontend or API consumers depend on it.

## Current User Service Behavior

Current service file:

- `backend/src/services/user.service.ts`

Methods:

- `getUsers()`
- `getUserById(id)`
- `createUser(name, email, passwordPlain)`
- `deleteUser(id)`

### `getUsers()`

Fetches all users from PostgreSQL through `UserRepository.findAll()`.

Current caution:

- The repository currently uses `SELECT *`, so returned rows can include password hashes.
- Response sanitization should be added for list/read endpoints.

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
- Current caution: database misses can cache the full repository row, including `password`, unless the user is sanitized first.

### `createUser(name, email, passwordPlain)`

Behavior:

- Checks for an existing user by email.
- Throws status `409` if the email already exists.
- Hashes the plain password with bcrypt using 10 salt rounds.
- Creates the user in PostgreSQL with the hashed password.
- The repository defaults `role` to `USER`.
- Deletes `newUser.password` before caching and returning.
- Stores the safe newly created user in Redis using `user:${newUser.id}`.
- Returns the created user.

Current caution:

- This method imports bcrypt directly.
- `backend/src/utils/password.ts` also exists, so this can be aligned later to use `hashPassword()`.
- The cached user from `createUser()` currently has no Redis expiry.

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
- `.env` should contain `JWT_SECRET`.
- `.env` can contain `JWT_EXPIRES_IN`; it defaults to `15m` if missing.
- Redis must be running and reachable by the default Redis client config.
- The database must have a `users` table.

The `users` table should match the current `User` type:

```ts
export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: string;
    created_at: Date;
}
```

The current repository insert expects these database columns:

```txt
id
name
email
password
role
created_at
```

Manual test order:

```txt
GET    http://localhost:4000/health
GET    http://localhost:4000/redis-test
POST   http://localhost:4000/users              body: name, email, password
GET    http://localhost:4000/users
GET    http://localhost:4000/users/:id
GET    http://localhost:4000/users/:id
GET    http://localhost:4000/cache/stats
POST   http://localhost:4000/auth/register      currently behaves like login
DELETE http://localhost:4000/users/:id
GET    http://localhost:4000/users/:id
```

Current auth test note:

- Because `POST /auth/register` currently uses `registerSchema` but calls `controller.login`, the test body must include `name`, `email`, and `password`, but the route will only use `email` and `password`.
- The email must already exist in the database with a bcrypt-hashed password.
- This is a temporary mismatch, not the intended final auth API.

Expected cache behavior:

- The first `GET /users/:id` should miss Redis, fetch from PostgreSQL, and cache the user.
- The second `GET /users/:id` for the same id should hit Redis.
- `GET /cache/stats` should show updated `cacheHits`, `cacheMisses`, and `hitRate`.
- `DELETE /users/:id` should remove the database row and delete the Redis cache key.

## Important Pending Work

Pending items:

- Fix auth route wiring: add `POST /auth/login` with `loginSchema` and `controller.login`, or restore a real `POST /auth/register` handler.
- Decide whether registration should live under `/auth/register` or continue through `POST /users`.
- Add validation middleware to `POST /users`; the current body now needs `name`, `email`, and `password`.
- Sanitize password hashes from `GET /users`, `GET /users/:id`, and Redis cache writes after database reads.
- Align password hashing to use `backend/src/utils/password.ts` consistently instead of direct bcrypt usage in `UserService`.
- Add JWT verification middleware for protected routes.
- Decide how `role` should be assigned and validated beyond the repository default of `USER`.
- Decide whether missing deletes should return `404` instead of always returning success.
- Consider changing `UserRepository.delete(id)` to return `Promise<User | null>`.
- Align Redis TTL behavior: `getUserById()` caches with `EX: 3600`, while `createUser()` currently stores without an expiry.
- Decide whether to rename `cacheMetrices` to `cacheMetrics` for spelling consistency.
- Decide whether `/redis-test` should remain in production-facing app wiring.
- Decide whether `/db-test` should be re-mounted or kept only as old test code.
- Consider adding a Redis URL environment variable if local/default Redis is not enough.
- Add automated tests for service caching behavior, user controller routes, and auth login/JWT behavior.

## Short Summary

The backend now has a full user flow through route, controller, service, and repository layers. Users are mounted under `/users`. Redis is connected through `backend/src/cache/redis.ts`, individual user lookups are cached by id, and `GET /cache/stats` exposes in-memory cache hit and miss metrics. Auth files now exist under `backend/src/auth`, JWT access-token generation is available through `backend/src/utils/jwt.ts`, and password comparison is available through `backend/src/utils/password.ts`. The main auth cleanup is to align the current `/auth/register` route with the intended register/login behavior.
