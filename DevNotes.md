
# Development Notes

# Yashaswi 6/15/26
I set up the backend using Express and TypeScript.
I added a health route to check if the server is running.
I created `AppError` for custom error messages and status codes.
I added `asyncHandler` to catch async route errors automatically.
I added a global error middleware for consistent error responses.
I set up Winston logger to log messages to console and log files.



# Vikas 16 Jun 2026
I added request validation for the user route using Zod.
I created `userSchema` (name min 3 chars, valid email) in `validators/user.validator.ts`.
I added a `validate` middleware that parses `req.body` and returns 400 with `error.issues` on failure (Zod v4 uses `.issues`, not `.errors`).
I mounted `userRouter` and added `express.json()` in `app.ts` so request bodies are parsed.
Note: macOS reserves port 5000 (AirPlay), so the server runs on 4000.

over to you Yash.



# Yashaswi 16 Jun 2026
I added PostgreSQL support to the backend using the `pg` package.
I created a shared Postgres pool in `database/postgres.ts` that reads `DATABASE_URL` from the environment.
I enabled dotenv loading in `server.ts` so environment variables are available when the server starts.
I fixed the port config to use `process.env.PORT` with 4000 as the fallback.
I added URL-encoded body parsing in `app.ts` for form-style request payloads.
I created a `/db-test` route that runs `SELECT NOW()` to confirm the database connection works.
I mounted the DB test route in `app.ts`.
I added temporary error logging in the global error middleware to make backend failures easier to debug.



# Yashaswi 17 Jun 2026
I added the `User` type in `types/user.types.ts` for user database rows.
I created `UserRepository` in `repositories/user.repository.ts` to handle user database queries.
I added repository methods for finding all users, finding by id, finding by email, creating users, and deleting users.
I fixed the Postgres pool import to use the default export from `database/postgres.ts`.
I fixed the user list query to use `ORDER BY created_at DESC`.
I updated `findAll()` to return `Promise<User[]>` because `result.rows` returns an array.
I created `UserService` in `services/user.service.ts` to keep user business logic separate from database logic.
I added duplicate email checking in `createUser()` and throw `AppError` with status 409 when the email already exists.
I added a basic `GET /user` route in `routes/user.routes.ts` to fetch all users from the database.
I updated `app.ts` to mount `user.routes.ts` at `/user`.
I created `DetailedNotes.md` as a detailed handoff note for Vikash with the current backend status, explanations, testing steps, and pending work.



# Yashaswi 4 Jul 2026
I added Redis-backed caching support to the user service flow.
I created `cacheMetrices` in `backend/src/cache/cacheMetrices.ts` to track cache hits, cache misses, and hit rate.
I imported `cacheMetrices` into `app.ts`.
I added `GET /cache/stats` in `app.ts` so cache metrics can be checked from the API.
I kept the Redis smoke-test route at `GET /redis-test`.
I updated `app.ts` so the user router is mounted at `/users`.
I updated `UserService` to import `redisClient`, `cacheMetrices`, and `logger`.
I changed `getUserById(id)` so it checks Redis first using the key `user:${id}`.
I increment cache hits, log a cache hit, parse the cached JSON, and return it when Redis has the user.
I fetch the user from PostgreSQL when Redis does not have the user.
I throw `AppError("User not found", 404)` when the repository cannot find a user by id.
I increment cache misses, log a cache miss, and store the database result in Redis for 1 hour with `EX: 3600`.
I updated `createUser(name, email)` so a newly created user is stored in Redis under `user:${newUser.id}`.
I updated `deleteUser(id)` so it deletes the user from PostgreSQL and removes the matching Redis cache key.
I updated `DetailedNotes.md` with the current ordered backend flow, active endpoints, cache behavior, testing steps, and remaining pending work.



# Yashaswi 14 Jul 2026
I added authentication-related backend files under `backend/src/auth`.
I added `AuthService`, `AuthController`, and `auth.routes.ts`.
I mounted the auth router in `app.ts` at `/auth`.
I added password hashing and comparison support using bcrypt.
I created `utils/password.ts` with `hashPassword()` and `comparePassword()`.
I added JWT access-token generation using `jsonwebtoken`.
I created `utils/jwt.ts` with a typed JWT payload containing `id`, `email`, and `role`.
I configured JWT signing to read `JWT_SECRET` and `JWT_EXPIRES_IN` from environment variables, with development fallbacks.
I fixed the TypeScript overload issue in `jwt.sign()` by typing the secret as `Secret` and `expiresIn` as `SignOptions["expiresIn"]`.
I updated the `User` type to include optional `password` and required `role`.
I updated `UserRepository.create()` so users are inserted with `name`, `email`, hashed `password`, and a default `role` of `USER`.
I updated `UserRepository.findByEmail()` so auth login can fetch users by email.
At that point, I updated the user creation flow so `POST /users` expected `name`, `email`, and `password`, hashed the password, removed it from the returned user object, and cached the safe user object.
I added auth validation schemas in `validators/auth.validator.ts` for register and login request bodies.
I added login logic that checks email/password, compares the submitted password with the stored hash, returns a generic `Invalid credentials` error on failure, and returns an access token on success.
Historical note from this point: `POST /auth/register` was wired to `controller.login` while using `registerSchema`; this needed to be aligned before the auth route was treated as complete.
I updated `DetailedNotes.md` with the current auth flow, JWT behavior, active endpoints, testing notes, and pending cleanup items.



# Yashaswi 22 Aug 2026
I completed the auth route cleanup so `/auth/register` now calls `controller.register` and `/auth/login` calls `controller.login`.
I added refresh-token support with `RefreshTokenRepository` in `backend/src/auth/refresh-token.repository.ts`.
I updated login so it returns both an access token and a refresh token.
I added refresh-token hashing with SHA-256 in `backend/src/utils/hash.ts`.
I added refresh-token JWT generation and verification in `backend/src/utils/jwt.ts`.
I added `POST /auth/refresh` to rotate refresh tokens and return a new access/refresh token pair.
I added `POST /auth/logout` to invalidate one refresh token.
I added `POST /auth/logout-all` to invalidate all refresh tokens for the authenticated user.
I added `authenticate` middleware in `backend/src/middleware/auth.middleware.ts` to validate Bearer access tokens and attach the decoded payload to `req.user`.
I added the Express request type augmentation in `backend/src/types/express.d.ts` so TypeScript recognizes `req.user`.
I added `authorize` middleware in `backend/src/middleware/authorize.middleware.ts` for role-based route protection.
I protected user read routes with `authenticate` and protected `DELETE /users/:id` with `authenticate` plus `authorize("ADMIN")`.
I updated user repository read queries to avoid returning password hashes from `GET /users` and `GET /users/:id`.
I fixed the `ts-node-dev` TypeScript compile issue by adding `--files` to the backend `dev` script so ambient declaration files are loaded during development.
I updated `DetailedNotes.md` with the current auth routes, token lifecycle, protected user routes, database table expectations, test order, and remaining cleanup items before pushing to GitHub.
