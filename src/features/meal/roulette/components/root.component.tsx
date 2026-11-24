'use client';

import type { JSX } from 'react';
import { useEffect, useId, useRef } from 'react';

import {
  getMealChangeAnnouncement,
  getMealResultAnnouncement,
} from '@/features/meal/constants/meal-notice.constant';
import { MealRouletteAreaInputComponent } from '@/features/meal/roulette/components/area-input.component';
import { MealRouletteFilterPanelComponent } from '@/features/meal/roulette/components/filter-panel.component';
import { MealRouletteMealPickerComponent } from '@/features/meal/roulette/components/meal-picker.component';
import { MealRouletteResultComponent } from '@/features/meal/roulette/components/result.component';
import { MealRouletteSpinPanelComponent } from '@/features/meal/roulette/components/spin-panel.component';
import { MealRouletteStatusComponent } from '@/features/meal/roulette/components/status.component';
import { useMealAreaInput } from '@/features/meal/roulette/hooks/use-meal-area-input.hook';
import { useMealRoulette } from '@/features/meal/roulette/hooks/use-meal-roulette.hook';

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
    clear: clearArea,
  } = useMealAreaInput();

  const emptyNoticeId = useId();
  const spinButtonRef = useRef<HTMLButtonElement>(null);
  const focusSpinButtonRef = useRef(false);

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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <MealRouletteMealPickerComponent
          meal={state.meal}
          locked={spinning}
          onChangeMeal={setMeal}
        />
        <MealRouletteFilterPanelComponent
          categoryOptions={categoryOptions}
          categories={state.filter.categories}
          broth={state.filter.broth}
          candidateCount={candidates.length}
          showClearBroth={showClearBroth}
          locked={spinning}
          emptyNoticeId={emptyNoticeId}
          onToggleCategory={toggleCategory}
          onChangeBroth={setBroth}
          onClearBroth={handleClearBroth}
        />
      </div>
      <div className="space-y-6 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start md:gap-8 md:space-y-0">
        <div className="min-w-0 space-y-6">
          <MealRouletteSpinPanelComponent
            items={rouletteItems}
            targetIndex={targetIndex === -1 ? null : targetIndex}
            spinId={state.spinSeq}
            spinning={spinning}
            disabled={candidates.length === 0}
            buttonLabel={spinButtonLabel}
            describedBy={emptyNoticeId}
            buttonRef={spinButtonRef}
            onSpin={spin}
            onSpinEnd={handleSpinEnd}
          />
          <MealRouletteAreaInputComponent
            value={inputValue}
            error={area.status === 'invalid' ? area.reason : null}
            onChange={handleAreaChange}
            onCompositionEnd={handleAreaCompositionEnd}
            onClear={clearArea}
          />
        </div>
        <MealRouletteResultComponent
          menu={resultMenu}
          categoryLabel={categoryLabel}
          luckLabel={luckLabel}
          luckLine={luckLine}
          spinning={spinning}
          area={area}
        />
      </div>
      <MealRouletteStatusComponent message={announcement} />
    </div>
  );
}
