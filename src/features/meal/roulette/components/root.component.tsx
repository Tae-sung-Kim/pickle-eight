'use client';

import type { JSX } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

import { ResultNextLinksComponent } from '@/components/common/result-next-links.component';
import { ShareCardFrameComponent } from '@/components/share/share-card-frame.component';
import { ShareCardHostComponent } from '@/components/share/share-card-host.component';
import { SharePanelComponent } from '@/components/share/share-panel.component';
import {
  getMealChangeAnnouncement,
  getMealResultAnnouncement,
} from '@/features/meal/constants/meal-notice.constant';
import { MEAL_SHARE_TARGET } from '@/features/meal/constants/meal-share.constant';
import { MealRouletteAreaInputComponent } from '@/features/meal/roulette/components/area-input.component';
import { MealRouletteFilterPanelComponent } from '@/features/meal/roulette/components/filter-panel.component';
import { MealRouletteMapLinksComponent } from '@/features/meal/roulette/components/map-links.component';
import { MealRouletteMealPickerComponent } from '@/features/meal/roulette/components/meal-picker.component';
import { MealRouletteResultComponent } from '@/features/meal/roulette/components/result.component';
import { MealRouletteShareCardComponent } from '@/features/meal/roulette/components/share-card.component';
import { MealRouletteSpinPanelComponent } from '@/features/meal/roulette/components/spin-panel.component';
import { MealRouletteStatusComponent } from '@/features/meal/roulette/components/status.component';
import { MealRouletteWeatherPanelComponent } from '@/features/meal/roulette/components/weather-panel.component';
import { useMealAreaInput } from '@/features/meal/roulette/hooks/use-meal-area-input.hook';
import { useMealRoulette } from '@/features/meal/roulette/hooks/use-meal-roulette.hook';
import { useMealWeather } from '@/features/meal/roulette/hooks/use-meal-weather.hook';
import { buildMealShareCard } from '@/features/meal/utils/meal-share.util';
import { useShare } from '@/hooks/use-share.hook';
import { toShareCardKey } from '@/lib/share';

/**
 * MealRouletteComponent
 * - 클라이언트 경계 하나. 필터, 돌림판, 알림, 결과를 조립한다.
 * - 난수는 훅에서만 쓰고 돌림판은 연출만 한다.
 */
export function MealRouletteComponent(): JSX.Element {
  const {
    state,
    candidates,
    resultMenu,
    categoryOptions,
    mealLabel,
    luckLabel,
    canSpin,
    spinButtonLabel,
    showClearBroth,
    setMeal,
    toggleCategory,
    setBroth,
    spin,
    handleSpinEnd,
  } = useMealRoulette();
  const {
    inputValue,
    area,
    handleChange: handleAreaChange,
    handleCompositionEnd: handleAreaCompositionEnd,
    handleBlur: handleAreaBlur,
    clear: clearArea,
  } = useMealAreaInput();
  const weather = useMealWeather();

  const emptyNoticeId = useId();
  const spinButtonRef = useRef<HTMLButtonElement>(null);
  const focusSpinButtonRef = useRef(false);
  const resolvingRef = useRef(false);
  const mountedRef = useRef(true);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const spinning = state.spin.status === 'spinning';
  const rouletteItems = candidates.map((menu) => ({
    key: menu.id,
    label: menu.name,
  }));
  const spinMenuId = state.spin.status === 'idle' ? null : state.spin.menuId;
  const targetIndex =
    spinMenuId === null
      ? null
      : candidates.findIndex((menu) => menu.id === spinMenuId);

  // "국물 조건 없애기" 직후 후보가 생기면 뽑기 버튼으로 포커스를 옮긴다(U7)
  useEffect(() => {
    if (focusSpinButtonRef.current && canSpin) {
      focusSpinButtonRef.current = false;
      spinButtonRef.current?.focus();
    }
  }, [canSpin]);

  // 날씨 조회 중이면 최대 3초 기다렸다가 뽑는다. 대기 중 재클릭·언마운트는 무시
  async function handleSpin() {
    if (resolvingRef.current) {
      return;
    }
    resolvingRef.current = true;
    setIsResolving(true);
    const snapshot = await weather.resolveSnapshot();
    resolvingRef.current = false;
    if (!mountedRef.current) {
      return;
    }
    setIsResolving(false);
    spin(snapshot);
  }

  function handleClearBroth() {
    focusSpinButtonRef.current = true;
    setBroth('all');
  }

  const categoryLabel =
    categoryOptions.find((c) => c.key === resultMenu?.category)?.label ?? '';
  const luckLine = state.spin.status === 'done' ? state.spin.luckLine : '';
  // 결과 알림이 우선, 없을 때만 끼니 변경 알림 (한 번에 한 문장)
  const announcement = resultMenu
    ? getMealResultAnnouncement(resultMenu.name, categoryLabel)
    : state.hasMealChanged
      ? getMealChangeAnnouncement(mealLabel)
      : '';

  // 공유 카드는 결과가 확정(done)됐을 때만 만든다. 동네 이름은 넣지 않는다(AC-7)
  const shareCard = buildMealShareCard(
    resultMenu && state.spin.status === 'done'
      ? { mealLabel, menuName: resultMenu.name }
      : null
  );
  const { cardRef, controller } = useShare({
    target: MEAL_SHARE_TARGET,
    cardKey: shareCard ? toShareCardKey(shareCard.body) : null,
    requiresPreview: false,
  });
  const previewAlt = shareCard
    ? `${shareCard.frame.featureName} ${shareCard.body.mealLabel} ${shareCard.body.menuName}`
    : undefined;
  const previewTexts = shareCard
    ? [
        shareCard.frame.featureName,
        shareCard.body.mealLabel,
        shareCard.body.menuName,
        shareCard.frame.notice,
      ]
    : undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <MealRouletteMealPickerComponent
          meal={state.meal}
          locked={spinning || isResolving}
          // locked는 렌더 뒤에야 켜져서, 같은 틱 클릭은 ref로 먼저 막는다
          onChangeMeal={(meal) => {
            if (!resolvingRef.current) {
              setMeal(meal);
            }
          }}
        />
        <MealRouletteFilterPanelComponent
          categoryOptions={categoryOptions}
          categories={state.filter.categories}
          broth={state.filter.broth}
          candidateCount={candidates.length}
          showClearBroth={showClearBroth}
          locked={spinning || isResolving}
          emptyNoticeId={emptyNoticeId}
          onToggleCategory={toggleCategory}
          onChangeBroth={setBroth}
          onClearBroth={handleClearBroth}
        />
        <MealRouletteWeatherPanelComponent
          regionKey={weather.regionKey}
          isEnabled={weather.isEnabled}
          onChangeRegion={weather.setRegionKey}
          onChangeEnabled={weather.setIsEnabled}
          renderAreaInput={(noticeId) => (
            <MealRouletteAreaInputComponent
              value={inputValue}
              error={area.status === 'invalid' ? area.reason : null}
              onChange={handleAreaChange}
              onCompositionEnd={handleAreaCompositionEnd}
              onBlur={handleAreaBlur}
              onClear={clearArea}
              noticeId={noticeId}
            />
          )}
        />
      </div>
      <div className="space-y-6 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:grid-rows-[auto_auto] md:items-start md:gap-x-8 md:gap-y-6 md:space-y-0">
        <div className="min-w-0 md:col-start-1 md:row-start-1">
          <MealRouletteSpinPanelComponent
            items={rouletteItems}
            targetIndex={targetIndex === -1 ? null : targetIndex}
            spinId={state.spinSeq}
            spinning={spinning || isResolving}
            disabled={candidates.length === 0}
            buttonLabel={spinButtonLabel}
            describedBy={emptyNoticeId}
            buttonRef={spinButtonRef}
            onSpin={handleSpin}
            onSpinEnd={handleSpinEnd}
          />
        </div>
        {/* 결과+공유를 한 칸으로 묶는다. DOM 순서 = 모바일 순서(다음 링크는 맨 끝, 데스크톱은 오른쪽 열 2행) */}
        <div className="flex min-w-0 flex-col gap-6 md:col-start-2 md:row-start-1">
          <MealRouletteResultComponent
            menu={resultMenu}
            categoryLabel={categoryLabel}
            luckLabel={luckLabel}
            luckLine={luckLine}
            spinning={spinning}
            weather={state.spin.status === 'done' ? state.spin.weather : null}
          />
          {resultMenu && shareCard ? (
            <SharePanelComponent
              controller={controller}
              previewAlt={previewAlt}
              previewTexts={previewTexts}
            />
          ) : null}
        </div>
        {resultMenu ? (
          <div className="min-w-0 md:col-start-1 md:row-start-2">
            <MealRouletteMapLinksComponent menu={resultMenu} area={area} />
          </div>
        ) : null}
        {resultMenu && !spinning ? (
          <div className="min-w-0 md:col-start-2 md:row-start-2">
            <ResultNextLinksComponent from="/meal" />
          </div>
        ) : null}
      </div>
      <MealRouletteStatusComponent message={announcement} />
      {shareCard ? (
        <ShareCardHostComponent ref={cardRef}>
          <ShareCardFrameComponent frame={shareCard.frame}>
            <MealRouletteShareCardComponent {...shareCard.body} />
          </ShareCardFrameComponent>
        </ShareCardHostComponent>
      ) : null}
    </div>
  );
}
