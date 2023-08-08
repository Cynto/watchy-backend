export interface PgQueryError extends Error {
  length: number;
  severity: string;
  code: string;
  detail: string;
  hint?: string | undefined;
  position?: string | undefined;
  internalPosition?: string | undefined;
  internalQuery?: string | undefined;
  where?: string | undefined;
  schema: string;
  table: string;
  column?: string | undefined;
  dataType?: string | undefined;
  constraint: string;
  file: string;
  line: string;
  routine: string;
}

export interface PgMemError extends Error {
  data: {
    error: string;
    details: string;
    code: string;
  };
  code: string;
  location: {
    start: number;
    end: number;
  };
}
