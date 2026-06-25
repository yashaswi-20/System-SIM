
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



# Vikas 25 Jun 2026
I added a reusable Redis caching layer to the backend (infrastructure only, no business logic yet).
I installed the `redis` client and added `REDIS_URL=redis://localhost:6379` to the backend `.env`.
I installed and started the Redis server locally with `brew install redis` and `brew services start redis` (the npm `redis` package is only the client, not the server).
I created the Redis client in `cache/redis.ts` that configures the client, logs connect/error/disconnect via Winston, and exposes a `connectRedis()` helper.
I learned the redis v4 client does not auto-connect, so I call `await connectRedis()` from `server.ts` before `app.listen()`.
I wrapped startup so a Redis outage logs the error but does not crash the server (a cache is a performance layer, not a correctness layer).
I created `CacheService` in `services/cache.service.ts` with generic `get`, `set`, `del`, and `exists` methods.
I made the service handle JSON serialization (`JSON.stringify` on set, `JSON.parse` on get) so callers always work with objects.
I added cache hit/miss logging inside `get()` (a missing key returns null and logs a MISS).
I added optional TTL support in `set()` using `{ EX: ttl }` so keys can auto-expire.
I created the `GET /redis-test` health route in `routes/redisRoute.ts` that pings Redis and returns `{ success: true, message: "Redis connected" }`.
I mounted the redis route in `app.ts` at `/redis-test`.
I verified everything end to end: server connects, health check passes, set/get/del/exists work, objects round-trip, TTL is honored, and hit/miss logs appear in `logs/combined.log`.
I updated `DetailedNotes.md` with a full explanation of the Redis layer.
