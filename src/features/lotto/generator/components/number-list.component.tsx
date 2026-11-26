'use client';
import { ShareCardFrameComponent } from '@/components/share/share-card-frame.component';
import { ShareCardHostComponent } from '@/components/share/share-card-host.component';
import { SharePanelComponent } from '@/components/share/share-panel.component';
import { LOTTO_SHARE_TARGET } from '@/features/lotto/constants/lotto-share.constant';
import { LottoGeneratorShareCardComponent } from '@/features/lotto/generator/components/share-card.component';
import { LottoBallComponent } from '@/features/lotto/shared/components/ball.component';
import { LottoSaveNumbersButtonComponent } from '@/features/lotto/shared/components/save-numbers-button.component';
import type { LottoNumberListPropsType } from '@/features/lotto/types/lotto.type';
import { buildLottoShareCard } from '@/features/lotto/utils/lotto-share.util';
import { useShare } from '@/hooks/use-share.hook';
import { withUniqueKeys } from '@/lib/react-key';
import { toShareCardKey } from '@/lib/share';

export function LottoNumberListComponent({
  numbersList,
  title = '생성된 번호',
}: LottoNumberListPropsType) {
  const shareCard = buildLottoShareCard(numbersList);
  const { cardRef, controller } = useShare({
    target: LOTTO_SHARE_TARGET,
    cardKey: shareCard ? toShareCardKey(shareCard.body) : null,
    requiresPreview: false,
  });

  if (numbersList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 생성된 번호가 없습니다.
      </p>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <h2 className="whitespace-nowrap text-base font-semibold">{title}</h2>
        <div className="flex items-center gap-1">
          <LottoSaveNumbersButtonComponent numbersList={numbersList} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
        {withUniqueKeys(numbersList, (n) => n.join('-')).map(
          ({ key, item: numbers, position: index }) => (
            <div
              key={key}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border py-4"
            >
              <span className="w-14 text-sm tabular-nums text-muted-foreground">
                {index + 1}게임
              </span>
              <div className="flex flex-wrap gap-2">
                {numbers.map((num) => (
                  <LottoBallComponent key={num} number={num} />
                ))}
              </div>
            </div>
          )
        )}
      </div>
      {shareCard ? (
        <>
          <div className="pt-4">
            <SharePanelComponent
              controller={controller}
              previewAlt={`${shareCard.frame.featureName} ${shareCard.body.games.length}게임`}
              previewTexts={[
                shareCard.frame.featureName,
                shareCard.frame.notice,
              ]}
            />
          </div>
          <ShareCardHostComponent ref={cardRef}>
            <ShareCardFrameComponent frame={shareCard.frame}>
              <LottoGeneratorShareCardComponent {...shareCard.body} />
            </ShareCardFrameComponent>
          </ShareCardHostComponent>
        </>
      ) : null}
    </section>
  );
}
