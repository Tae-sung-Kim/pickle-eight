'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { EMOJI_CATEGORY_ENUM } from "@/constants/emoji-translation.constant";
import type { EmojiControlsSectionType, EmojiGenerateValuesType } from "@/types/emoji-translation.type";

export function EmojiTranslationControlsSectionComponent({
  category,
  onCategoryChange,
  canUse,
  used,
  limit,
  isGenerating,
  onGenerate,
}: EmojiControlsSectionType) {
  const categories = Object.values(EMOJI_CATEGORY_ENUM);
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
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-2 text-xs text-muted-foreground">
            오늘 사용량: {used}/{limit} {canUse ? '' : ' · 제한 도달'}
          </p>
        </div>
        <div className="sm:col-span-1 flex items-end justify-end gap-2">
          <div className="flex flex-col items-end gap-2">
            <Button
              type="submit"
              variant="default"
              onClick={onGenerate}
              aria-disabled={isGenerating || !canUse}
              disabled={isGenerating || !canUse}
            >
              문제 생성
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}

export default EmojiTranslationControlsSectionComponent;
