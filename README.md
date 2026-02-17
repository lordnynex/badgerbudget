# bun-react-tailwind-shadcn-template

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

## Database migrations

Schema changes are managed with TypeORM migrations. Migrations run automatically on server startup. To run migrations manually (e.g. in CI or before deployment):

```bash
bun run migrate
```

This initializes the database and applies any pending migrations, then exits. See `src/backend/db/migrations/README.md` for details on adding new migrations.

---

This project was created using `bun init` in bun v1.3.9. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
