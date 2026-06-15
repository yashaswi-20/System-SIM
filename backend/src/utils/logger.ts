import winston, { transports } from 'winston'

const {combine , timestamp ,printf} =winston.format;

const logformat = printf(({level ,message ,timestamp})=>{
    return `${timestamp} [${level.toUpperCase()}]: ${message}`
})

export const logger = winston.createLogger({
    level : "info",
    format : combine (
        timestamp(),
        logformat
    ),
    transports : [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: "logs/combined.log"
        }),
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error"
        })
    ]
})