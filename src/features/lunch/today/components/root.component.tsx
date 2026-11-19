'use client';

import type { JSX } from 'react';
import { useEffect, useId, useRef } from 'react';

import { LUNCH_CATEGORIES } from '@/features/lunch/constants/lunch-category.constant';
import { getLunchResultAnnouncement } from '@/features/lunch/constants/lunch-notice.constant';
import { LunchTodayFilterPanelComponent } from '@/features/lunch/today/components/filter-panel.component';
import { LunchTodayResultComponent } from '@/features/lunch/today/components/result.component';
import { LunchTodaySpinPanelComponent } from '@/features/lunch/today/components/spin-panel.component';
import { LunchTodayStatusComponent } from '@/features/lunch/today/components/status.component';
import { useLunchToday } from '@/features/lunch/today/hooks/use-lunch-today.hook';

/**
 * LunchTodayComponent
 * - 클라이언트 경계 하나. 필터, 돌림판, 알림, 결과를 조립한다.
 * - 난수는 훅에서만 쓰고 돌림판은 연출만 한다.
 */
export function LunchTodayComponent(): JSX.Element {
  const {
    state,
    candidates,
    resultMenu,
    canSpin,
    spinButtonLabel,
    showClearBroth,
    toggleCategory,
    setBroth,
    spin,
    handleSpinEnd,
  } = useLunchToday();

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
    LUNCH_CATEGORIES.find((c) => c.key === resultMenu?.category)?.label ?? '';
  const luckLine = state.spin.status === 'done' ? state.spin.luckLine : '';
  const announcement = resultMenu
    ? getLunchResultAnnouncement(resultMenu.name, categoryLabel)
    : '';

  return (
    <div className="space-y-6">
      <LunchTodayFilterPanelComponent
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
      <div className="space-y-6 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start md:gap-8 md:space-y-0">
        <LunchTodaySpinPanelComponent
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
        <LunchTodayResultComponent
          menu={resultMenu}
          categoryLabel={categoryLabel}
          luckLine={luckLine}
          spinning={spinning}
        />
      </div>
      <LunchTodayStatusComponent message={announcement} />
    </div>
  );
}
