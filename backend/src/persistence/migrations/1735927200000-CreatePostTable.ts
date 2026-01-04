import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreatePostTable1735927200000 implements MigrationInterface {
  name = 'CreatePostTable1735927200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'body',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'imageAttachments',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'pdfAttachments',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            onUpdate: 'now()',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_POST_USER_ID',
            columnNames: ['userId'],
          },
          {
            name: 'IDX_POST_CREATED_AT',
            columnNames: ['createdAt'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_POST_USER',
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('posts');
  }
}