import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoleColumn1704394800000 implements MigrationInterface {
  name = 'AddUserRoleColumn1704394800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'colaborador')
    `);
    
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'colaborador'
    `);

    // Tornar o primeiro usuário admin (assumindo que é o usuário de setup)
    await queryRunner.query(`
      UPDATE "users" 
      SET "role" = 'admin' 
      WHERE id = (SELECT id FROM "users" ORDER BY "createdAt" ASC LIMIT 1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}