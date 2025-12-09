import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: './schema2.prisma',
  migrations: {
    path: './migrations',
  },
  datasource: {
    url: env('PPG_USER_DATABASE_URL2'),
  },
})