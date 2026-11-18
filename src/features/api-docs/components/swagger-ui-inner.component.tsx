'use client';

import { useEffect, useRef } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type ApiDocsSwaggerUiInnerPropsType = Readonly<{
  spec: Record<string, unknown>;
}>;

export function ApiDocsSwaggerUiInnerComponent({
  spec,
}: ApiDocsSwaggerUiInnerPropsType) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Swagger UI가 그리는 h1을 h2로 바꿔 페이지 h1을 하나로 유지한다.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const demote = () => {
      for (const h1 of root.querySelectorAll('h1')) {
        const h2 = document.createElement('h2');
        h2.className = h1.className;
        h2.append(...Array.from(h1.childNodes));
        h1.replaceWith(h2);
      }
    };
    demote();
    const observer = new MutationObserver(demote);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef}>
      <SwaggerUI
        spec={spec}
        docExpansion="list"
        deepLinking={false}
        tryItOutEnabled
        defaultModelsExpandDepth={-1}
      />
    </div>
  );
}
