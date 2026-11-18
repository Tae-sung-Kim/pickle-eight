'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type ApiDocsSwaggerUiInnerPropsType = Readonly<{
  spec: Record<string, unknown>;
}>;

export function ApiDocsSwaggerUiInnerComponent({
  spec,
}: ApiDocsSwaggerUiInnerPropsType) {
  return (
    <SwaggerUI
      spec={spec}
      docExpansion="list"
      deepLinking={false}
      tryItOutEnabled
      defaultModelsExpandDepth={-1}
    />
  );
}
