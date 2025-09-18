export class ProviderDto {
  id: number = 0;
  type!: number;
  details: ProviderDetailsDto | null = null;
  CreatedAt!: Date;
  LastModifiedAt!: Date | null;
  CreatedBy!: string;
  LastModifiedBy!: string;
}

export class ProviderDetailsDto {
  sqlServerConfiguration!: SqlServerProviderDetailsDto | null;
}

export class SqlServerProviderDetailsDto {
  instanceName!: string;
  databaseName!: string;
  username!: string;
  password!: string;
}
