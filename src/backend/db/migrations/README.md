# Database migrations

Schema changes are managed with TypeORM migrations. Migrations run automatically on server startup (`migrationsRun: true` in the DataSource config).

## Adding a new migration

1. Create a new file in this directory named `{timestamp}-Description.ts`, e.g. `1700000001000-AddEventNotesColumn.ts`. Use a timestamp greater than existing migrations so it runs in order.

2. Implement `MigrationInterface`:

```ts
import type { MigrationInterface } from "typeorm";
import type { QueryRunner } from "typeorm";

export class AddEventNotesColumn1700000001000 implements MigrationInterface {
  name = "AddEventNotesColumn1700000001000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events ADD COLUMN notes TEXT`
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // SQLite does not support DROP COLUMN easily; document manual steps if needed
  }
}
```

3. In `dataSource.ts`, import the migration class and add it to the `migrations` array in `dataSourceOptions`.

4. Restart the server; the new migration will run once.

## Notes

- Use raw SQL in `up()` and `down()`. For SQLite/sql.js, use `queryRunner.query(sql)` or `queryRunner.query(sql, parameters)`.
- `down()` is used for reverting; SQLite has limited ALTER support, so some migrations may have no-op or manual revert steps.
- TypeORM records applied migrations in a `migrations` table; do not edit or delete that table manually.
