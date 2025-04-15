# BACKEND - Node.JS Express.JS Prisma PostgreSQL & Docker & AWS ubuntu

## Project Structure
### Docker Structure Entire Project

Using Docker for productoin:
```
├── Flexi-Backend/
│   ├── Dockerfile
│   ├── package.json
│   └── prisma/
├── Flexi-Frontend/
│   ├── Dockerfile
│   └── package.json
├── frontend-nextjs/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── nginx.conf

```
Here’s the corrected and complete project structure diagram for Bankend:

```
Flexi-Backend/
│
├── prisma/
│   ├── schema.prisma           # The frontend HTML file for authentication and todo management
│   └── migrations/             # 
│   └── dbml/                   # Flie to generate database diagram https://dbdiagram.io/d
│
│
├── src/
│   ├── controllers/            # (Optional) For future separation of concerns
│   └── middlewares/
│       └── authMiddleware.js    # Middleware for verifying JWT and protecting routes
│   └── routes/
│       └── authRoutes.js        # Routes for user registration and login     
│   
│  
│
├── upload                       # Store Upload file
├── docker-compose.yaml          # Docker setup config file
├── index.ts                     # Main server entry point that sets up routing and middleware
├── package.json                 # Project dependencies and scripts
├── package-lock.json            # Lockfile for exact dependency versions
└── tsconfig.json                # Typescrip Config


```

### **How to Use**
1. **Generate Prisma Clients**:
   ```bash
   npm run prisma:generate
   ```

2. **Run Migrations**:
   ```bash
   npm run prisma:migrate
   ```

3. **Start Development Server**:
   ```bash
   npm run start:dev
   ```

4. **Build the Project**:
   ```bash
   npm run build
   ```

5. **Start the Production Server**:
   ```bash
   npm run start
   ```

---
```bash
npx prisma generate --schema=prisma/db1/schema1.prisma              
npx prisma generate --schema=prisma/db2/schema2.prisma
```

```bash
npx prisma migrate reset --schema=prisma/db1/schema1.prisma
npx prisma migrate reset --schema=prisma/db2/schema2.prisma
```

```bash
npx prisma migrate dev --schema  prisma//db1/schema1.prisma --name initial                                                       
npx prisma migrate dev --schema  prisma/db2/schema2.prisma --name initial
```


# Get In Database

## Postgres

```bash
psql -h localhost -p 9649 -U postgres -d prismatypedb #Database1 flexi App
psql -h localhost -p 8956 -U postgres -d flexiadsdb #Database 2 Flexi Ad Manager
```

# ****Docker****
## Get in postgresql database by Docker

### Database 1 : Flexi App
```bash
docker exec -it flexidb psql -U postgres -d prismatypedb
\dt flexidb.* # schema flexidb
```

### Database 2 : Flexi Ad Manager
```bash
docker exec -it flexiadsdb psql -U postgres -d flexiadsdb
\dt flexiadsdb.* # schema flexiadsdb
```

### **Remove and Re-build all Containers**
```bash
docker-compose down --volumes                                   
docker-compose up --build
```

### **Run Container on Background**
```bash
docker compose up -d
```
### **Docker Status**
```bash
 docker ps  
 ```

 docker-compose run nodejs npx prisma generate --schema=prisma/db2/schema2.prisma