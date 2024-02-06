import { Redis } from '@upstash/redis';

export const db = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
})

//? soluciones xd

//* 1
// export const db = Redis.fromEnv()

//*2
// export const db = new Redis({
//   url: 'https://eu2-grown-humpback-32161.upstash.io',
//   token: 'AX2hASQgYTRhZDdkNzItMThlNS00MWI5LTg0NGQtYWM3ZTdlZjc2ODdmOTMxNjkzODU0M2NjNDViYThkOTc2MDliMmFiNjUwM2I=',
// })