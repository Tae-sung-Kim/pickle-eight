'use client';

import { type ComponentType, useEffect, useState } from 'react';
import { API_DOCS_SPEC_PATHNAME } from '@/features/api-docs/constants/api-docs.constant';

type SpecType = Record<string, unknown>;
type InnerPropsType = Readonly<{ spec: SpecType }>;

type ViewerStateType =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'error' }>
  | Readonly<{
      status: 'ready';
      spec: SpecType;
      Inner: ComponentType<InnerPropsType>;
    }>;

export function ApiDocsSwaggerViewerComponent() {
  const [state, setState] = useState<ViewerStateType>({ status: 'loading' });

  useEffect(() => {
    let isActive = true;
    async function load() {
      try {
        const [res, mod] = await Promise.all([
          fetch(API_DOCS_SPEC_PATHNAME, { cache: 'no-store' }),
          import('@/features/api-docs/components/swagger-ui-inner.component'),
        ]);
        if (!res.ok) throw new Error('spec');
        const spec = (await res.json()) as SpecType;
        if (isActive) {
          setState({
            status: 'ready',
            spec,
            Inner: mod.ApiDocsSwaggerUiInnerComponent,
          });
        }
      } catch {
        if (isActive) setState({ status: 'error' });
      }
    }
    load();
    return () => {
      isActive = false;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <p className="p-4 text-sm text-muted-foreground" role="status">
        API 문서를 불러오는 중이에요.
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <p className="p-4 text-sm text-muted-foreground" role="alert">
        API 문서 화면을 불러오지 못했어요. 명세 원본은{' '}
        <a
          className="text-foreground underline underline-offset-2"
          href={API_DOCS_SPEC_PATHNAME}
        >
          {API_DOCS_SPEC_PATHNAME}
        </a>
        에서 볼 수 있어요.
      </p>
    );
  }

  return <state.Inner spec={state.spec} />;
}
