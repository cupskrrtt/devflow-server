# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3001/ with your browser to see the result.

## WARNING
please do this sql query in your db before seeding the db
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
