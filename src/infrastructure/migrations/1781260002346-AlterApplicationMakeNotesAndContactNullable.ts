import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterApplicationMakeNotesAndContactNullable1781260002346 implements MigrationInterface {
    name = 'AlterApplicationMakeNotesAndContactNullable1781260002346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "application"
            ALTER COLUMN "notes" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "application"
            ALTER COLUMN "notes"
            SET NOT NULL
        `);
    }

}
