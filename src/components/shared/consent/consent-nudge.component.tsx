'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useConsentContext } from '@/providers';

interface ConsentNudgeProps {
  readonly variant?: 'gratitude' | 'value' | 'transparent' | 'gentle';
}

export function ConsentNudgeComponent({
  variant = 'gratitude',
}: ConsentNudgeProps) {
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
          title: '결과가 마음에 드시나요?',
          description:
            '이런 무료 도구들을 계속 제공하려면 광고 수익이 필요해요',
          buttonText: '무료 서비스 지원하기',
          bgClass: 'bg-gradient-to-r from-green-50 to-blue-50',
        };

      case 'value':
        return {
          emoji: '💡',
          title: '무료 서비스를 계속 이용하세요',
          description:
            '광고 수익으로 서버 비용을 충당하여 모든 기능을 무료로 제공합니다',
          buttonText: '동의하기',
          bgClass: 'bg-blue-50 border border-blue-200',
        };

      case 'transparent':
        return {
          emoji: '📊',
          title: '서비스 운영 현황',
          description:
            '월 서버 비용 ~50,000원 | 이용자 1,000명+ | 여러분의 동의가 큰 도움이 됩니다',
          buttonText: '서비스 지원하기',
          bgClass: 'bg-gray-50 border border-gray-200',
        };

      case 'gentle':
      default:
        return {
          emoji: '💝',
          title: '',
          description: '광고 동의로 무료 서비스를 지원해주세요',
          buttonText: '동의',
          bgClass: 'bg-yellow-50',
        };
    }
  };

  const content = getContent();

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
