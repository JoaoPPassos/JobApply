import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetToUser1781260200000 implements MigrationInterface {
  name = 'AddPasswordResetToUser1781260200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "reset_password_code" varchar DEFAULT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "reset_password_expires_at" TIMESTAMP DEFAULT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "reset_password_expires_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "reset_password_code"`,
    );
  }
}
