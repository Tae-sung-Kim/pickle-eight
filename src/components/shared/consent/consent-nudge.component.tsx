'use client';

import { Button } from '@/components/ui/button';
import { useConsentContext } from '@/providers';
import { ConsentNudgeType } from '@/types';

export function ConsentNudgeComponent({
  variant = 'gratitude',
}: ConsentNudgeType) {
  const { state, onAccept } = useConsentContext();

  // Don't show if already accepted
  if (state === 'accepted') return null;

  const handleAccept = () => {
    onAccept();
  };

  const getContent = () => {
    switch (variant) {
      case 'gratitude':
        return {
          emoji: '🎉',
          title: '유용했나요?',
          description: '광고 동의 한 번으로 이 도구의 유지·개선을 도와주세요',
          buttonText: '동의하고 응원하기',
          bgClass: 'bg-gradient-to-r from-green-50 to-blue-50',
        };

      case 'value':
        return {
          emoji: '💡',
          title: '광고 동의로 모든 기능을 계속 무료로',
          description: '광고 수익으로 서버·유지 비용을 충당하고 있어요',
          buttonText: '광고에 동의',
          bgClass: 'bg-blue-50 border border-blue-200',
        };

      case 'transparent':
        return {
          emoji: '📊',
          title: '운영 투명성',
          description:
            '월 서버비 약 5만 원 · 이용자 1,000+ — 광고 동의가 큰 힘이 됩니다',
          buttonText: '광고 동의로 지원',
          bgClass: 'bg-gray-50 border border-gray-200',
        };

      case 'ad-slot':
        return {
          emoji: '🪧',
          title: '',
          description: '광고 동의 시 이 영역에 스폰서 콘텐츠가 표시됩니다',
          buttonText: '동의하고 보기',
          bgClass: 'bg-muted/40 border border-border',
        };

      case 'gentle':
      default:
        return {
          emoji: '💝',
          title: '',
          description: '광고 동의로 무료 서비스 유지를 함께해 주세요',
          buttonText: '동의하기',
          bgClass: 'bg-yellow-50',
        };
    }
  };

  const content = getContent();

  if (variant === 'ad-slot') {
    return (
      <div className={`w-full rounded ${content.bgClass} px-3 py-2`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-base leading-none">{content.emoji}</span>
            <span>{content.description}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={handleAccept}
          >
            {content.buttonText}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'gentle') {
    return (
      <div className="text-center py-2">
        <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
          <span>{content.emoji}</span>
          <span>{content.description}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleAccept}
          >
            {content.buttonText}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 mb-4 ${content.bgClass}`}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">{content.emoji}</div>
        <div className="flex-1">
          {content.title && (
            <p className="text-sm font-medium text-gray-900 mb-1">
              {content.title}
            </p>
          )}
          <p className="text-xs text-gray-700">{content.description}</p>
        </div>
        <Button
          size="sm"
          variant={variant === 'value' ? 'default' : 'outline'}
          onClick={handleAccept}
        >
          {content.buttonText}
        </Button>
      </div>
    </div>
  );
}

export default ConsentNudgeComponent;
