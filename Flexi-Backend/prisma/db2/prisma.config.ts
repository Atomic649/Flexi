import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/db2/schema2.prisma',
  migrations: {
    path: 'prisma/db2/migrations',
  },
  datasource: {
    url: env('PPG_USER_DATABASE_URL2'),
  },
})