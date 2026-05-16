import { MigrationInterface, QueryRunner } from "typeorm";

export class NewTables1778967744777 implements MigrationInterface {
    name = 'NewTables1778967744777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."job_source_platform_enum" AS ENUM('0', '1', '2', '3', '4')
        `);
        await queryRunner.query(`
            CREATE TABLE "job" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "title" character varying NOT NULL,
                "company" character varying NOT NULL,
                "description" text NOT NULL,
                "salary_range" character varying NOT NULL,
                "source_url" character varying NOT NULL,
                "source_platform" "public"."job_source_platform_enum" NOT NULL,
                "location" character varying NOT NULL,
                CONSTRAINT "PK_98ab1c14ff8d1cf80d18703b92f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."application_status_history_status_enum" AS ENUM('0', '1', '2', '3', '4', '5')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."application_status_history_source_type_enum" AS ENUM('0', '1', '2', '3', '4')
        `);
        await queryRunner.query(`
            CREATE TABLE "application_status_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "status" "public"."application_status_history_status_enum" NOT NULL,
                "changed_at" TIMESTAMP NOT NULL,
                "source_type" "public"."application_status_history_source_type_enum" NOT NULL,
                "applicationId" uuid,
                CONSTRAINT "PK_62f7e8a5533a7db21218f2e2434" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "contact" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_2cbbe00f59ab6b3bb5b8d19f989" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."application_current_status_enum" AS ENUM('0', '1', '2', '3', '4', '5')
        `);
        await queryRunner.query(`
            CREATE TABLE "application" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "current_status" "public"."application_current_status_enum" NOT NULL,
                "applied_at" TIMESTAMP NOT NULL,
                "notes" text NOT NULL,
                "userId" uuid,
                CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "application_status_history"
            ADD CONSTRAINT "FK_e30a860ef20ee4bb746cd58632d" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "application"
            ADD CONSTRAINT "FK_b4ae3fea4a24b4be1a86dacf8a2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "application" DROP CONSTRAINT "FK_b4ae3fea4a24b4be1a86dacf8a2"
        `);
        await queryRunner.query(`
            ALTER TABLE "application_status_history" DROP CONSTRAINT "FK_e30a860ef20ee4bb746cd58632d"
        `);
        await queryRunner.query(`
            DROP TABLE "application"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."application_current_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "contact"
        `);
        await queryRunner.query(`
            DROP TABLE "application_status_history"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."application_status_history_source_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."application_status_history_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "job"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."job_source_platform_enum"
        `);
    }

}
