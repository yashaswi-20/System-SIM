import 'dotenv/config';
import app from './app'
import { logger } from './utils/logger';
import { connectRedis } from './cache/redis';

const PORT =process.env.PORT || 4000;

// Connect to Redis first, THEN start accepting requests.
// We don't crash the server if Redis is down — we just log it, so the
// /redis-test health check can still report the failure.
const start = async () => {
    try {
        await connectRedis();
    } catch (err) {
        logger.error(`Failed to connect to Redis on startup: ${(err as Error).message}`);
    }

    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
};

start();