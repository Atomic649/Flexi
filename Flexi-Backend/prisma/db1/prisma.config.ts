import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/db1/schema1.prisma',
  migrations: {
    path: 'prisma/db1/migrations',
  },
  datasource: {
    url: env('PPG_USER_DATABASE_URL1'),
  },
})