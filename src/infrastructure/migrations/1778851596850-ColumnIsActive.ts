import { MigrationInterface, QueryRunner } from "typeorm";

export class ColumnIsActive1778851596850 implements MigrationInterface {
    name = 'ColumnIsActive1778851596850'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "is_active" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "is_active"
        `);
    }

}
