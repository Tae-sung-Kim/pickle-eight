'use client';

import type {
  EmojiControlsSectionType,
  EmojiGenerateValuesType,
} from '@/types';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GptModelSelectButtonComponent } from '@/components';

export function EmojiTranslationControlsSectionComponent({
  category,
  onCategoryChange,
  model,
  onModelChange,
  canUse,
  used,
  limit,
  isGenerating,
  onGenerate,
}: EmojiControlsSectionType) {
  return (
    <Card className="p-5 sm:p-6 rounded-xl shadow-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onGenerate();
        }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="sm:col-span-2">
          <Label className="mb-2 inline-block">카테고리</Label>
          <Select
            value={category}
            onValueChange={(v) =>
              onCategoryChange(v as EmojiGenerateValuesType['category'])
            }
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="영화">영화</SelectItem>
              <SelectItem value="음식">음식</SelectItem>
              <SelectItem value="일상">일상</SelectItem>
              <SelectItem value="랜덤">랜덤</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-2 text-xs text-muted-foreground">
            오늘 사용량: {used}/{limit} {canUse ? '' : ' · 제한 도달'}
          </p>
        </div>
        <div className="sm:col-span-1 flex items-end justify-end gap-2">
          <div className="flex flex-col items-end gap-2">
            <Label className="mb-0 inline-block">GPT 모델</Label>
            <GptModelSelectButtonComponent
              className=""
              model={model}
              onModelChange={onModelChange}
              onProceed={onGenerate}
              isBusy={isGenerating}
              disabled={!canUse}
              buttonLabel="문제 생성"
            />
          </div>
        </div>
      </form>
    </Card>
  );
}

export default EmojiTranslationControlsSectionComponent;
