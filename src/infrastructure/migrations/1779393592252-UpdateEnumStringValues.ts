import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnumStringValues1779393592252 implements MigrationInterface {
    name = 'UpdateEnumStringValues1779393592252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "public"."job_source_platform_enum"
            RENAME TO "job_source_platform_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."job_source_platform_enum" AS ENUM(
                'linkedin',
                'indeed',
                'company_board',
                'recruiter',
                'other'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "job"
            ALTER COLUMN "source_platform" TYPE "public"."job_source_platform_enum" USING "source_platform"::"text"::"public"."job_source_platform_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."job_source_platform_enum_old"
        `);
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
            ALTER COLUMN "status" TYPE "public"."application_status_history_status_enum" USING "status"::"text"::"public"."application_status_history_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."application_status_history_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."application_status_history_source_type_enum"
            RENAME TO "application_status_history_source_type_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."application_status_history_source_type_enum" AS ENUM(
                'linkedin',
                'indeed',
                'company_board',
                'recruiter',
                'other'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "application_status_history"
            ALTER COLUMN "source_type" TYPE "public"."application_status_history_source_type_enum" USING "source_type"::"text"::"public"."application_status_history_source_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."application_status_history_source_type_enum_old"
        `);
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
            ALTER COLUMN "current_status" TYPE "public"."application_current_status_enum" USING "current_status"::"text"::"public"."application_current_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."application_current_status_enum_old"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."application_current_status_enum_old" AS ENUM('0', '1', '2', '3', '4', '5')
        `);
        await queryRunner.query(`
            ALTER TABLE "application"
            ALTER COLUMN "current_status" TYPE "public"."application_current_status_enum_old" USING "current_status"::"text"::"public"."application_current_status_enum_old"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."application_current_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."application_current_status_enum_old"
            RENAME TO "application_current_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."application_status_history_source_type_enum_old" AS ENUM('0', '1', '2', '3', '4')
        `);
        await queryRunner.query(`
            ALTER TABLE "application_status_history"
            ALTER COLUMN "source_type" TYPE "public"."application_status_history_source_type_enum_old" USING "source_type"::"text"::"public"."application_status_history_source_type_enum_old"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."application_status_history_source_type_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."application_status_history_source_type_enum_old"
            RENAME TO "application_status_history_source_type_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."application_status_history_status_enum_old" AS ENUM('0', '1', '2', '3', '4', '5')
        `);
        await queryRunner.query(`
            ALTER TABLE "application_status_history"
            ALTER COLUMN "status" TYPE "public"."application_status_history_status_enum_old" USING "status"::"text"::"public"."application_status_history_status_enum_old"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."application_status_history_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."application_status_history_status_enum_old"
            RENAME TO "application_status_history_status_enum"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."job_source_platform_enum_old" AS ENUM('0', '1', '2', '3', '4')
        `);
        await queryRunner.query(`
            ALTER TABLE "job"
            ALTER COLUMN "source_platform" TYPE "public"."job_source_platform_enum_old" USING "source_platform"::"text"::"public"."job_source_platform_enum_old"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."job_source_platform_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."job_source_platform_enum_old"
            RENAME TO "job_source_platform_enum"
        `);
    }

}
