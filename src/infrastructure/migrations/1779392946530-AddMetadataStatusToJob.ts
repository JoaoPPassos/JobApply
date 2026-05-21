import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMetadataStatusToJob1779392946530 implements MigrationInterface {
    name = 'AddMetadataStatusToJob1779392946530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "job"
            ADD "metadata_status" character varying NOT NULL DEFAULT 'pending'
        `);
        await queryRunner.query(`
            ALTER TABLE "contact"
            ADD "name" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "contact"
            ADD "email" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "contact"
            ADD "role" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "application"
            ADD "jobId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "application"
            ADD CONSTRAINT "UQ_dbc0341504212f830211b69ba0c" UNIQUE ("jobId")
        `);
        await queryRunner.query(`
            ALTER TABLE "application"
            ADD "contactId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "application"
            ADD CONSTRAINT "UQ_fde9a6c8a8fa5ea0565b24b289e" UNIQUE ("contactId")
        `);
        await queryRunner.query(`
            ALTER TABLE "application"
            ADD CONSTRAINT "FK_dbc0341504212f830211b69ba0c" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "application"
            ADD CONSTRAINT "FK_fde9a6c8a8fa5ea0565b24b289e" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "application" DROP CONSTRAINT "FK_fde9a6c8a8fa5ea0565b24b289e"
        `);
        await queryRunner.query(`
            ALTER TABLE "application" DROP CONSTRAINT "FK_dbc0341504212f830211b69ba0c"
        `);
        await queryRunner.query(`
            ALTER TABLE "application" DROP CONSTRAINT "UQ_fde9a6c8a8fa5ea0565b24b289e"
        `);
        await queryRunner.query(`
            ALTER TABLE "application" DROP COLUMN "contactId"
        `);
        await queryRunner.query(`
            ALTER TABLE "application" DROP CONSTRAINT "UQ_dbc0341504212f830211b69ba0c"
        `);
        await queryRunner.query(`
            ALTER TABLE "application" DROP COLUMN "jobId"
        `);
        await queryRunner.query(`
            ALTER TABLE "contact" DROP COLUMN "role"
        `);
        await queryRunner.query(`
            ALTER TABLE "contact" DROP COLUMN "email"
        `);
        await queryRunner.query(`
            ALTER TABLE "contact" DROP COLUMN "name"
        `);
        await queryRunner.query(`
            ALTER TABLE "job" DROP COLUMN "metadata_status"
        `);
    }

}
