export interface ColumnInfoDto {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
}

export interface ForeignKeyInfoDto {
  columnName: string;
  referencedSchema: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface TableInfoDto {
  schemaName: string;
  tableName: string;
  fullName: string;
  columns: ColumnInfoDto[];
  foreignKeys: ForeignKeyInfoDto[];
}

export interface TableAnnotationRequest {
  fullTableName: string; // [schema].[table]
  tableDescription?: string;
  columnComments: Record<string, string | null>;
}

export interface SelectedTableBlock {
  rawBlockText: string;
  fullTableName: string;
}
