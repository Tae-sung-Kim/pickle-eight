import type { JSX } from 'react';

import { ShareCardFrameComponent } from '@/components/share/share-card-frame.component';
import { LUCKY_DRAW_SHARE_ROULETTE_RESULT_LABEL } from '../../constants/lucky-draw-share.constant';
import type { LuckyDrawRouletteShareCardType } from '../../types/lucky-draw.type';
import { formatLuckyDrawShareMore } from '../../utils/lucky-draw-share.util';

type LuckyDrawRouletteShareCardPropsType = Readonly<{
  card: LuckyDrawRouletteShareCardType;
}>;

/** 결과 글자 크기. 후보 영역이 없으면 한 단계 키운다 (ui-ux 4장 돌림판) */
function getPickedClass(length: number, hasCandidates: boolean): string {
  if (length <= 4) return hasCandidates ? 'text-[64px]' : 'text-[72px]';
  if (length <= 8) return hasCandidates ? 'text-5xl' : 'text-[56px]';
  return hasCandidates ? 'text-4xl' : 'text-[44px]';
}

/** 후보 태그 크기. 개수가 많을수록 줄인다 */
function getTagClass(count: number): string {
  if (count <= 8) return 'h-10 text-[22px]';
  if (count <= 14) return 'h-9 text-xl';
  return 'h-8 text-lg';
}

/**
 * LuckyDrawRouletteShareCardComponent
 * - 공유 카드 본문. 바늘, 결과 박스, 후보 태그 영역. 버튼, 링크, 제목 태그, 이미지 없음.
 */
export function LuckyDrawRouletteShareCardComponent({
  card,
}: LuckyDrawRouletteShareCardPropsType): JSX.Element {
  const { picked, candidates, hiddenCount } = card.body;
  const hasCandidates = candidates !== null;
  const pickedLength: number = Array.from(picked).length;
  const highlightIndex: number = candidates ? candidates.indexOf(picked) : -1;

  return (
    <ShareCardFrameComponent frame={card.frame}>
      <div className="flex h-full w-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center">
          <span
            aria-hidden="true"
            className="relative z-10 -mb-0.5 h-0 w-0 border-x-12 border-t-14 border-x-transparent border-t-share-card-accent-lucky"
          />
          <div
            className={`box-border flex w-full flex-col items-center justify-center rounded-panel border-2 border-share-card-accent-lucky bg-share-card-accent-lucky/10 px-4 text-center ${hasCandidates ? 'min-h-35' : 'min-h-55'}`}
          >
            <span className="text-lg leading-6 text-share-card-muted">
              {LUCKY_DRAW_SHARE_ROULETTE_RESULT_LABEL}
            </span>
            <span
              className={`line-clamp-2 w-full font-bold leading-[1.15] ${getPickedClass(pickedLength, hasCandidates)}`}
            >
              {picked}
            </span>
          </div>
        </div>
        {hasCandidates ? (
          <div className="box-border h-[222px] overflow-hidden border-t border-share-card-border pt-3">
            <ul
              className="flex flex-wrap gap-x-2 gap-y-1.5"
              data-share-roulette-tags
            >
              {candidates.map((name, index) => (
                <li
                  // biome-ignore lint/suspicious/noArrayIndexKey: 카드는 정적 렌더링이며 같은 이름이 중복될 수 있다
                  key={index}
                  className={`box-border flex max-w-32 items-center rounded-md border px-2 leading-none ${getTagClass(candidates.length)} ${
                    index === highlightIndex
                      ? 'border-share-card-accent-lucky bg-share-card-accent-lucky text-share-card-bg'
                      : 'border-share-card-border'
                  }`}
                >
                  <span className="truncate">{name}</span>
                </li>
              ))}
              {hiddenCount > 0 ? (
                <li
                  className={`box-border flex items-center px-2 leading-none text-share-card-muted ${getTagClass(candidates.length)}`}
                >
                  {formatLuckyDrawShareMore(hiddenCount)}
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </ShareCardFrameComponent>
  );
}
