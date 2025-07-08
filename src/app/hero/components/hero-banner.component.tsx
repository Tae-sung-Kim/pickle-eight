'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';

/**
 * 메인 홈 상단 Hero 배너 - 서비스 비전, 안내, 기능 소개까지 포함 (문장 줄바꿈 개선)
 */
export function HeroBanner() {
  return (
    <Alert className="mb-8 bg-gradient-to-r from-yellow-100 to-pink-100 border-0 shadow-lg flex flex-col md:flex-row items-center gap-4 py-6 px-6">
      <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 shadow">
        <Sparkles className="w-8 h-8 text-pink-500" />
      </div>
      <div className="flex-1">
        <AlertTitle className="font-extrabold text-2xl text-pink-600 mb-2 text-center md:text-left">
          Pickle-eight에 오신 걸 환영합니다!{' '}
          <span className="ml-2 animate-bounce">🎉</span>
        </AlertTitle>
        <AlertDescription className="text-base text-gray-700 leading-relaxed">
          <span className="font-semibold text-pink-500">Pickle-eight</span>는
          누구나 쉽고 재미있게 사용할 수 있는{' '}
          <span className="font-semibold">랜덤 추첨 & 게임 플랫폼입니다.</span>
          <span className="block text-sm text-gray-600 mt-1">
            모임, 행사, 파티, 회식, 학교, 회사 등 다양한 상황에서 활용할 수 있는
            여러 가지 추첨/게임 기능을 제공합니다.
          </span>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-sm text-gray-700">
            <li>
              참가자 이름, 번호, 좌석 등 다양한 기준으로{' '}
              <span className="font-semibold text-pink-500">
                공정한 랜덤 추첨
              </span>
            </li>
            <li>
              사다리 타기, 주사위, 순서 정하기 등{' '}
              <span className="font-semibold text-pink-500">
                재미있는 미니게임
              </span>
              도 한 곳에서!
            </li>
            <li>로또 랜덤 번호 추천 등 실생활에 바로 쓸 수 있는 기능까지!</li>
          </ul>
          <div className="mt-3">
            <span className="inline-block bg-pink-200 text-pink-800 rounded-full px-3 py-1 text-xs font-semibold mr-2">
              🚀 새로운 기능이 계속 추가되고 있어요!
            </span>
            <span className="inline-block bg-yellow-200 text-yellow-800 rounded-full px-3 py-1 text-xs font-semibold">
              여러분의 피드백과 아이디어를 언제나 환영합니다.
            </span>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            아래에서 원하는 기능을 바로 선택해 사용해보세요.
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
