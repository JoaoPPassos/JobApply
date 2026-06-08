import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailPasswordToUser1780272000000 implements MigrationInterface {
  name = 'AddEmailPasswordToUser1780272000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "email_password" varchar DEFAULT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "email_password"
    `);
  }
}
