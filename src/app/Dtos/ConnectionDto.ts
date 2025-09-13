export class ConnectionDto {
  id: number = 0;
  provider!: number;
  isDefault: boolean = false;
  details: ConnectionDetailsDto | null = null;
  CreatedAt!: Date;
  LastModifiedAt!: Date | null;
  CreatedBy!: string;
  LastModifiedBy!: string;
}

export class ConnectionDetailsDto {
  sqlServerConfiguration!: SqlServerConnectionDetailsDto | null;
}

export class SqlServerConnectionDetailsDto {
  instanceName!: string;
  databaseName!: string;
  username!: string;
  password!: string;
}
