import app from './app'
import { logger } from './utils/logger';

const PORT =process.env.port || 5000;

app.listen(PORT,()=>{
    logger.info(`Server running on port ${PORT}`);
})