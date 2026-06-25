import {createClient} from 'redis'
import {logger}   from "../utils/logger"

const redisClient = createClient();

redisClient.on("error", (err) => {
    logger.error("redis client error", err);
});

(
    async ()=>{
        try{
            await redisClient.connect()
            logger.info("Redis connected Sucessfully..");
        }
        catch(err){
            logger.error("Redis connection failed",err);
        }
    }
)();

export {redisClient};