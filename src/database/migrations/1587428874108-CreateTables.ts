import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class CreateTables1587428874108 implements MigrationInterface {

    public async up(con: QueryRunner): Promise<void> {
      await con.createTable(new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'value',
            type: 'decimal',
            scale: 2,
            precision: 10
          },
          {
            name: 'type',
            type: 'varchar'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }));

      await con.createTable(new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }));

      await con.addColumn('transactions', new TableColumn({
        name: 'category_id',
        type: 'uuid',
        isNullable: true
      }));

      await con.createForeignKey('transactions', new TableForeignKey({
        name: 'Category_Id',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      }));
    }

    public async down(con: QueryRunner): Promise<void> {
      await con.dropForeignKey('transactions', 'Category_Id');
      await con.dropTable('categories');
      await con.dropTable('transactions');
    }

}
