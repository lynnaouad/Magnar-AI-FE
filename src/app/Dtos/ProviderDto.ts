import { String } from "lodash";

export class ProviderDto {
  id: number = 0;
  workspaceId!: number;
  type!: number;
  details: ProviderDetailsDto = new ProviderDetailsDto();
  createdAt!: Date;
  castModifiedAt!: Date | null;
  CreatedBy!: string;
  lastModifiedBy!: string;
}

export class ProviderDetailsDto {
  sqlServerConfiguration!: SqlServerProviderDetailsDto | null;
  apiProviderDetails: ApiProviderDetailsDto[] = [];
}

export class SqlServerProviderDetailsDto {
  instanceName!: string;
  databaseName!: string;
  username!: string;
  password!: string;
}

export class ApiProviderDetailsDto {
  id: number = 0;
  providerId: number = 0;
  pluginName: string = '';
  functionName: string = '';
  description: string = '';
  apiUrl: string = '';
  httpMethod: string = 'GET';
  payload: string = '';
  parameters: ApiParameterDto[] = [];
  createdAt!: Date;
  lastModifiedAt!: Date | null;
  constructorreatedBy!: string;
  lastModifiedBy!: string;
}

export class ApiParameterDto {
  name!: string;
  type: string = "String";
  description!: string;
  required: boolean = true;
  location: string = "Query";
}