import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUserTableAndAddUserIdToApplication1781700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" ADD COLUMN IF NOT EXISTS "user_id" varchar`,
    );

    await queryRunner.query(
      `UPDATE "application" a SET "user_id" = u.id::varchar
       FROM "user" u
       WHERE a."userId" = u.id`,
    );

    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT IF EXISTS "FK_application_user"`,
    );

    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN IF EXISTS "userId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "user_id" SET NOT NULL`,
    );

    await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying NOT NULL,
        "email" character varying NOT NULL UNIQUE,
        "password" character varying NOT NULL,
        "is_active" boolean NOT NULL DEFAULT false,
        "email_password" character varying,
        "reset_password_code" character varying,
        "reset_password_expires_at" TIMESTAMP,
        CONSTRAINT "PK_user" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `ALTER TABLE "application" ADD COLUMN IF NOT EXISTS "userId" uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN IF EXISTS "user_id"`,
    );
  }
}
