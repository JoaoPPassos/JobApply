import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoResponseStatus1780800000000 implements MigrationInterface {
  name = 'AddNoResponseStatus1780800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."application_current_status_enum"
      RENAME TO "application_current_status_enum_old"
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."application_current_status_enum" AS ENUM(
        'applied',
        'in_review',
        'interview',
        'offer',
        'rejected',
        'withdrawn',
        'no_response'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      ALTER COLUMN "current_status" TYPE "public"."application_current_status_enum"
      USING "current_status"::"text"::"public"."application_current_status_enum"
    `);
    await queryRunner.query(`DROP TYPE "public"."application_current_status_enum_old"`);

    await queryRunner.query(`
      ALTER TYPE "public"."application_status_history_status_enum"
      RENAME TO "application_status_history_status_enum_old"
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."application_status_history_status_enum" AS ENUM(
        'applied',
        'in_review',
        'interview',
        'offer',
        'rejected',
        'withdrawn',
        'no_response'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "application_status_history"
      ALTER COLUMN "status" TYPE "public"."application_status_history_status_enum"
      USING "status"::"text"::"public"."application_status_history_status_enum"
    `);
    await queryRunner.query(`DROP TYPE "public"."application_status_history_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."application_status_history_status_enum"
      RENAME TO "application_status_history_status_enum_old"
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."application_status_history_status_enum" AS ENUM(
        'applied',
        'in_review',
        'interview',
        'offer',
        'rejected',
        'withdrawn'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "application_status_history"
      ALTER COLUMN "status" TYPE "public"."application_status_history_status_enum"
      USING "status"::"text"::"public"."application_status_history_status_enum"
    `);
    await queryRunner.query(`DROP TYPE "public"."application_status_history_status_enum_old"`);

    await queryRunner.query(`
      ALTER TYPE "public"."application_current_status_enum"
      RENAME TO "application_current_status_enum_old"
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."application_current_status_enum" AS ENUM(
        'applied',
        'in_review',
        'interview',
        'offer',
        'rejected',
        'withdrawn'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "application"
      ALTER COLUMN "current_status" TYPE "public"."application_current_status_enum"
      USING "current_status"::"text"::"public"."application_current_status_enum"
    `);
    await queryRunner.query(`DROP TYPE "public"."application_current_status_enum_old"`);
  }
}
