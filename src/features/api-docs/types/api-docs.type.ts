export type ApiDocsJsonObjectType = Record<string, unknown>;

/** 기능별 OpenAPI 조각 파일 하나. piece는 검증 전이라 unknown이다. */
export type ApiDocsSpecFileType = Readonly<{
  /** 예: lotto.openapi.json */
  fileName: string;
  piece: unknown;
}>;

export type ApiDocsInfoType = Readonly<{
  title: string;
  version: string;
  description: string;
}>;
