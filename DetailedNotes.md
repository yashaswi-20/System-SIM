# Detailed Backend Handoff Notes for Vikash

Date: 22 Aug 2026

This file is the detailed handoff summary for the current backend state. It follows the same order as `DevNotes.md`, then documents the live route wiring, authentication flow, refresh-token lifecycle, protected user routes, Redis cache behavior, local test steps, and remaining cleanup work before pushing to GitHub.

## Current Backend Stack

The backend currently uses:

- Express
- TypeScript
- PostgreSQL with the `pg` package
- Redis with the `redis` package
- Zod for request validation
- Winston for logging
- dotenv for environment variables
- bcrypt for password hashing and comparison
- jsonwebtoken for access and refresh JWTs
- Node `crypto` for hashing refresh tokens before database storage

Main backend files:

- `backend/src/server.ts`
- `backend/src/app.ts`
- `backend/package.json`
- `backend/tsconfig.json`

## Current Scripts

From `backend/package.json`:

```json
{
  "dev": "ts-node-dev --respawn --files src/server.ts",
  "build": "tsc",
  "start": "node dist/server.ts"
}
```

Important note:

- `--files` is required in the dev script so `ts-node-dev` loads ambient declaration files like `backend/src/types/express.d.ts`.
- Without `--files`, development startup can fail with `Property 'user' does not exist on type 'Request'` when `req.user` is used in auth middleware/controllers.

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
- Added reusable validation middleware in `backend/src/middleware/validate.middleware.ts`.
- The validation middleware returns status `400` with `error.issues` when validation fails.
- Added `express.json()` in `app.ts` so JSON request bodies are parsed.
- Noted that macOS can reserve port `5000` for AirPlay, so `4000` is the fallback port.

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
- Created a `/db-test` route file for database testing.
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
- Added repository methods for finding all users, finding by id, finding by email, creating users, and deleting users.
- Created `UserService` in `backend/src/services/user.service.ts`.
- Added duplicate email checking.
- Added `AppError("Email already Exist", 409)` when the email already exists in the user creation flow.
- Created the first user routes and this detailed handoff file.

Important files:

- `backend/src/types/user.types.ts`
- `backend/src/repositories/user.repository.ts`
- `backend/src/services/user.service.ts`
- `backend/src/routes/user.routes.ts`
- `DetailedNotes.md`

### Yashaswi - 4 Jul 2026

Redis cache metrics and user caching:

- Created `backend/src/cache/cacheMetrices.ts`.
- Added in-memory counters for cache hits, cache misses, and hit rate.
- Added `GET /cache/stats`.
- Kept `GET /redis-test` for a Redis smoke test.
- Mounted the user router at `/users`.
- Updated `getUserById(id)` to check Redis before PostgreSQL.
- Used Redis key format `user:${id}`.
- Cached user lookups for 1 hour using `EX: 3600`.
- Deleted the matching Redis key when a user is deleted.

Important files:

- `backend/src/cache/redis.ts`
- `backend/src/cache/cacheMetrices.ts`
- `backend/src/services/user.service.ts`
- `backend/src/app.ts`

### Yashaswi - 14 Jul 2026

Authentication, password hashing, and JWT support:

- Added auth module files under `backend/src/auth`.
- Added `AuthService`, `AuthController`, and `auth.routes.ts`.
- Mounted the auth router in `backend/src/app.ts` at `/auth`.
- Added bcrypt password hashing and comparison helpers.
- Added JWT access-token generation in `backend/src/utils/jwt.ts`.
- Added typed JWT payload fields: `id`, `email`, and `role`.
- Added auth validation schemas for register and login request bodies.
- Added login behavior with generic `Invalid credentials` errors.

Important files:

- `backend/src/auth/auth.routes.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/validators/auth.validator.ts`
- `backend/src/utils/password.ts`
- `backend/src/utils/jwt.ts`

### Yashaswi - 22 Aug 2026

Auth route cleanup, refresh tokens, protected routes, and dev compile fix:

- Fixed auth route wiring so `/auth/register` calls `controller.register`.
- Added `/auth/login` with `loginSchema` and `controller.login`.
- Added refresh-token persistence through `RefreshTokenRepository`.
- Added refresh-token hashing with SHA-256 before database storage.
- Updated login to return both `accessToken` and `refreshToken`.
- Added `/auth/refresh` to rotate refresh tokens.
- Added `/auth/logout` to invalidate one refresh token.
- Added `/auth/logout-all` to invalidate every refresh token for the authenticated user.
- Added `authenticate` middleware to verify Bearer access tokens and attach payload data to `req.user`.
- Added `backend/src/types/express.d.ts` so Express `Request` knows about `req.user`.
- Added `authorize(...allowedRoles)` middleware for role checks.
- Protected user read routes with `authenticate`.
- Protected `DELETE /users/:id` with `authenticate` and `authorize("ADMIN")`.
- Updated user read queries to return safe columns only, excluding password hashes.
- Fixed the `ts-node-dev` compile issue by adding `--files` to the dev script.

Important files:

- `backend/src/auth/refresh-token.repository.ts`
- `backend/src/middleware/auth.middleware.ts`
- `backend/src/middleware/authorize.middleware.ts`
- `backend/src/types/express.d.ts`
- `backend/src/utils/hash.ts`
- `backend/src/utils/jwt.ts`
- `backend/src/routes/user.routes.ts`
- `backend/package.json`

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
GET    /cache/stats

POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/logout-all

GET    /users
GET    /users/:id
DELETE /users/:id
```

Important route notes:

- The current user base path is `/users`.
- The current auth base path is `/auth`.
- `POST /users` is currently commented out in `backend/src/routes/user.routes.ts`.
- New user registration currently happens through `POST /auth/register`.
- `GET /users` and `GET /users/:id` require a valid Bearer access token.
- `DELETE /users/:id` requires a valid Bearer access token and an `ADMIN` role.

## Current Auth Routes

Current auth route file:

- `backend/src/auth/auth.routes.ts`

Current route wiring:

```ts
router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/refresh", validate(refreshSchema), controller.refresh);
router.post("/logout", authenticate, validate(logoutSchema), controller.logout);
router.post("/logout-all", authenticate, controller.logoutAll);
```

### `POST /auth/register`

Expected body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

Current behavior:

- Validates the body with `registerSchema`.
- Checks for duplicate email through `UserRepository.findByEmail(email)`.
- Throws `AppError("Email already exists", 409)` if the email is already used.
- Hashes the password using `hashPassword()`.
- Creates the user through `UserRepository.create(name, email, passwordHash)`.
- Defaults the role to `USER` in the repository.
- Deletes `user.password` before returning the response.

Current response shape:

```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "USER",
    "created_at": "..."
  }
}
```

### `POST /auth/login`

Expected body:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Current behavior:

- Validates the body with `loginSchema`.
- Finds the user by email.
- Uses a generic `AppError("Invalid credentials", 401)` if the user is missing or the password is wrong.
- Compares the submitted password with the stored bcrypt hash using `comparePassword()`.
- Signs an access token.
- Signs a refresh token.
- Hashes the refresh token with SHA-256.
- Stores the hashed refresh token in PostgreSQL.
- Sets the refresh-token database expiry to 7 days from login.
- Deletes `user.password` before returning the response.

Current response shape:

```json
{
  "success": true,
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "USER",
    "created_at": "..."
  }
}
```

### `POST /auth/refresh`

Expected body:

```json
{
  "refreshToken": "..."
}
```

Current behavior:

- Validates the body with `refreshSchema`.
- Hashes the incoming refresh token.
- Looks up the hash in the `refresh_tokens` table.
- Throws `AppError("Invalid or expired refresh token", 401)` if the hash is missing.
- Verifies the refresh JWT signature and expiry.
- Deletes the stored hash if JWT verification fails.
- Generates a new access token and refresh token.
- Hashes the new refresh token.
- Deletes the old refresh-token hash.
- Saves the new refresh-token hash.
- Returns the new token pair.

This is refresh-token rotation: every successful refresh invalidates the previous refresh token.

### `POST /auth/logout`

Expected headers:

```txt
Authorization: Bearer <accessToken>
```

Expected body:

```json
{
  "refreshToken": "..."
}
```

Current behavior:

- Requires a valid access token through `authenticate`.
- Validates the body with `logoutSchema`.
- Hashes the submitted refresh token.
- Deletes the matching refresh-token hash from PostgreSQL.
- Returns a success message.

### `POST /auth/logout-all`

Expected headers:

```txt
Authorization: Bearer <accessToken>
```

Current behavior:

- Requires a valid access token through `authenticate`.
- Reads the authenticated user id from `req.user`.
- Deletes all refresh-token rows for that user.
- Returns a success message.

## Current JWT And Token Behavior

Current JWT helper file:

- `backend/src/utils/jwt.ts`

Current JWT payload:

```ts
{
  id: user.id,
  email: user.email,
  role: user.role
}
```

Access token settings:

- Secret env var: `JWT_SECRET`
- Expiry env var: `JWT_EXPIRES_IN`
- Development fallback secret: `fallback-secret-do-not-use-in-prod`
- Development fallback expiry: `15m`

Refresh token settings:

- Secret env var: `JWT_REFRESH_SECRET`
- Expiry env var: `JWT_REFRESH_EXPIRES_IN`
- Development fallback secret: `fallback-refresh-secret`
- Development fallback expiry: `7d`

Refresh-token storage:

- The plain refresh token is returned to the client once.
- The database stores only a SHA-256 hash of the refresh token.
- Token hashing currently lives in `backend/src/utils/hash.ts`.
- `backend/src/utils/token.ts` also contains a `hashToken()` helper and appears duplicated or unused.

Production caution:

- Do not rely on fallback JWT secrets outside local development.
- Set both `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env` before deploying or sharing a deployed environment.

## Current Auth Middleware

### `authenticate`

File:

- `backend/src/middleware/auth.middleware.ts`

Current behavior:

- Reads the `Authorization` header.
- Requires the header to start with `Bearer `.
- Verifies the access token with `verifyAccessToken()`.
- Attaches the decoded payload to `req.user`.
- Sends an auth error through `AppError` when the token is missing, invalid, or expired.

### Express Request Type Augmentation

File:

- `backend/src/types/express.d.ts`

Current behavior:

- Adds optional `user?: JwtPayload` to `Express.Request`.
- This lets TypeScript accept `req.user` in middleware and controllers.
- The backend dev script uses `--files` so this declaration is loaded by `ts-node-dev`.

### `authorize`

File:

- `backend/src/middleware/authorize.middleware.ts`

Current behavior:

- Accepts allowed roles like `authorize("ADMIN")`.
- Requires `req.user` to exist.
- Returns `401` if the request is not authenticated.
- Returns `403` if the authenticated user's role is not allowed.
- Calls `next()` when the role is allowed.

## Current User Routes

Current route file:

- `backend/src/routes/user.routes.ts`

Current route wiring:

```ts
router.get("/", authenticate, controller.getUser);
router.get("/:id", authenticate, controller.getUserById);
// router.post("/", controller.createUser);
router.delete("/:id", authenticate, authorize("ADMIN"), controller.deleteUser);
```

Current behavior:

- `GET /users` requires authentication.
- `GET /users/:id` requires authentication.
- `DELETE /users/:id` requires authentication and the `ADMIN` role.
- `POST /users` is not currently active.

Current response shape for reads:

```json
{
  "success": true,
  "data": []
}
```

## Current User Service And Repository Behavior

Current service file:

- `backend/src/services/user.service.ts`

Current repository file:

- `backend/src/repositories/user.repository.ts`

### `getUsers()`

Current behavior:

- Calls `UserRepository.findAll()`.
- `findAll()` returns only safe fields:
  - `id`
  - `name`
  - `email`
  - `role`
  - `created_at`
- Password hashes are not returned by the current list query.

### `getUserById(id)`

Redis key:

```txt
user:${id}
```

Current behavior:

- Reads from Redis first.
- On cache hit:
  - increments cache hits
  - logs `Cache HIT for user ${id}`
  - returns `JSON.parse(cacheData)`
- On cache miss:
  - fetches the user from PostgreSQL
  - throws `AppError("User not found", 404)` if no user exists
  - increments cache misses
  - logs `Cache MISS for user ${id}`
  - stores the user in Redis for 1 hour with `EX: 3600`
  - returns the database user
- `findById()` returns only safe fields and does not select the password hash.

### `createUser(name, email, passwordPlain)`

Current status:

- The service method still exists.
- The route using it, `POST /users`, is currently commented out.
- Registration currently happens through `AuthService.register()`.

Current behavior if called:

- Checks for an existing user by email.
- Throws status `409` if the email already exists.
- Hashes the plain password directly with bcrypt.
- Creates the user in PostgreSQL.
- Deletes `newUser.password` before caching and returning.
- Stores the safe new user in Redis using `user:${newUser.id}` without an expiry.

Cleanup note:

- This method can be removed, reactivated with validation, or aligned to use `hashPassword()` depending on the final API design.

### `deleteUser(id)`

Current behavior:

- Deletes the user from PostgreSQL.
- Deletes Redis key `user:${id}`.
- Does not currently check whether a row was deleted before returning success.

Cleanup note:

- Consider returning `404` when the user does not exist.

## Current Redis Files

Redis client file:

- `backend/src/cache/redis.ts`

Current behavior:

- Creates the Redis client with `createClient()`.
- Connects immediately when the module is imported.
- Logs Redis client errors with Winston.
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

- Metrics are stored in memory and reset when the backend process restarts.
- Metrics currently count `getUserById()` cache hits and misses.
- The file and export are currently named `cacheMetrices`.

## Current Database Expectations

The backend expects a `users` table with columns compatible with:

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

The user repository expects these columns:

```txt
id
name
email
password
role
created_at
```

The backend also expects a `refresh_tokens` table used by `RefreshTokenRepository`.

The current repository queries require at least these refresh-token columns:

```txt
user_id
token_hash
expires_at
```

Recommended refresh-token table details:

- `token_hash` should be indexed.
- `token_hash` should be unique if each stored refresh token must be single-use.
- `user_id` should be indexed for `logout-all`.
- A cleanup job or query should remove expired rows over time.

## How To Run Locally

From the backend folder:

```bash
cd backend
npm run dev
```

Expected server URL:

```txt
http://localhost:<PORT>
```

Port behavior:

- `server.ts` uses `process.env.PORT`.
- If `PORT` is missing, it falls back to `4000`.

Required local services:

- PostgreSQL must be running.
- Redis must be running and reachable by the default Redis client config.

Required environment variables:

```txt
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
```

Optional environment variables:

```txt
PORT
JWT_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
```

Build check:

```bash
cd backend
npm run build
```

## Manual Test Order

Start with health and Redis:

```txt
GET http://localhost:4000/health
GET http://localhost:4000/redis-test
GET http://localhost:4000/cache/stats
```

Register a user:

```txt
POST http://localhost:4000/auth/register
body: name, email, password
```

Login:

```txt
POST http://localhost:4000/auth/login
body: email, password
```

Save the returned:

```txt
accessToken
refreshToken
```

Use the access token for protected user routes:

```txt
GET http://localhost:4000/users
Authorization: Bearer <accessToken>

GET http://localhost:4000/users/:id
Authorization: Bearer <accessToken>
```

Check cache behavior:

```txt
GET http://localhost:4000/users/:id
GET http://localhost:4000/users/:id
GET http://localhost:4000/cache/stats
```

Expected cache behavior:

- The first `GET /users/:id` should miss Redis, fetch from PostgreSQL, and cache the user.
- The second `GET /users/:id` for the same id should hit Redis.
- `GET /cache/stats` should show updated `cacheHits`, `cacheMisses`, and `hitRate`.

Refresh the session:

```txt
POST http://localhost:4000/auth/refresh
body: refreshToken
```

Expected refresh behavior:

- The old refresh token becomes invalid.
- The response returns a new `accessToken` and `refreshToken`.
- Use the new refresh token for future refresh/logout calls.

Logout one session:

```txt
POST http://localhost:4000/auth/logout
Authorization: Bearer <accessToken>
body: refreshToken
```

Logout all sessions:

```txt
POST http://localhost:4000/auth/logout-all
Authorization: Bearer <accessToken>
```

Admin-only delete:

```txt
DELETE http://localhost:4000/users/:id
Authorization: Bearer <adminAccessToken>
```

Important delete note:

- The access token must contain `role: "ADMIN"`.
- Normal `USER` accounts should receive `403`.

## Important Pending Work

Pending items before this is treated as production-ready:

- Add SQL migration files or schema documentation for `users` and `refresh_tokens`.
- Add automated tests for register, login, refresh rotation, logout, logout-all, protected user routes, and role authorization.
- Add validation middleware if `POST /users` is reactivated.
- Decide whether `POST /users` should stay removed now that registration lives under `/auth/register`.
- Align or remove `UserService.createUser()` because it still hashes directly with bcrypt while auth uses `hashPassword()`.
- Remove duplicated or unused refresh-token hashing helper code in `backend/src/utils/token.ts` if `backend/src/utils/hash.ts` is the final helper.
- Remove `UserRepository.storeRefreshToken()` if `RefreshTokenRepository` is the final owner for refresh-token persistence.
- Decide whether missing deletes should return `404` instead of always returning success.
- Enforce `expires_at` in `RefreshTokenRepository.findToken()` or add cleanup for expired refresh-token rows.
- Decide whether to rename `cacheMetrices` to `cacheMetrics` for spelling consistency.
- Decide whether `/redis-test` should remain mounted in production-facing app wiring.
- Decide whether `/db-test` should be re-mounted, deleted, or kept only as old local test code.
- Consider adding a Redis URL environment variable if local/default Redis is not enough.
- Standardize response shapes across auth and user routes if the frontend needs one consistent API format.
- Before pushing to GitHub, check repository hygiene because root `node_modules` appears to be tracked.

## Short Summary

The backend now has user, auth, cache, and role-protection flows in place. Auth supports registration, login, refresh-token rotation, single-session logout, and logout-all. User reads are protected by access-token auth, user deletion is restricted to `ADMIN`, and user read queries avoid returning password hashes. Redis caches individual user lookups and exposes hit/miss metrics through `/cache/stats`. The biggest remaining work is test coverage, database schema/migration documentation, refresh-token expiry cleanup, and GitHub repository hygiene before pushing.
