import type { JSX, Ref } from 'react';

import { Input } from '@/components/ui/input';
import {
  DREAM_SEARCH_LABEL,
  DREAM_SEARCH_NOTICE,
  DREAM_SEARCH_PLACEHOLDER,
} from '@/features/dream/constants/dream-notice.constant';
import { DREAM_SEARCH_MAX_LENGTH } from '@/features/dream/constants/dream-search.constant';

export type DreamHubSearchInputComponentPropsType = Readonly<{
  inputId: string;
  noticeId: string;
  value: string;
  onChange: (value: string) => void;
  inputRef: Ref<HTMLInputElement>;
}>;

/**
 * DreamHubSearchInputComponent
 * - 검색칸 하나. form·name 없음. 값은 부모 state만 쓰고 어디로도 보내지 않는다.
 */
export function DreamHubSearchInputComponent({
  inputId,
  noticeId,
  value,
  onChange,
  inputRef,
}: DreamHubSearchInputComponentPropsType): JSX.Element {
  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-base font-semibold text-foreground"
      >
        {DREAM_SEARCH_LABEL}
      </label>
      <Input
        ref={inputRef}
        id={inputId}
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value.slice(0, DREAM_SEARCH_MAX_LENGTH))
        }
        placeholder={DREAM_SEARCH_PLACEHOLDER}
        autoComplete="off"
        enterKeyHint="search"
        maxLength={DREAM_SEARCH_MAX_LENGTH}
        aria-describedby={noticeId}
        className="h-12 bg-card px-4 text-base md:text-base"
      />
      <p
        id={noticeId}
        className="text-sm leading-6 break-keep text-muted-foreground"
      >
        {DREAM_SEARCH_NOTICE}
      </p>
    </div>
  );
}
