import { expect as baseExpect, type Page, test } from '@playwright/test';
import {
  FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_COPY,
  FORTUNE_COMPATIBILITY_TTI_RELATION_COPY,
} from '@/features/fortune/constants/fortune-compatibility-copy.constant';
import { FORTUNE_COMPATIBILITY_GRADE_NAMES } from '@/features/fortune/constants/fortune-compatibility-grade.constant';
import { FORTUNE_COMPATIBILITY_MENU_TEXTS } from '@/features/fortune/constants/fortune-compatibility-menu.constant';
import {
  FORTUNE_COMPATIBILITY_AGE_BLOCKED_TEXTS,
  FORTUNE_COMPATIBILITY_CONSENT_TEXTS,
  FORTUNE_COMPATIBILITY_DECLINED_TEXTS,
  FORTUNE_COMPATIBILITY_DISCLAIMER_TEXT,
  FORTUNE_COMPATIBILITY_RESULT_NOTICE,
} from '@/features/fortune/constants/fortune-compatibility-notice.constant';
import { FORTUNE_COMPATIBILITY_ROUTES } from '@/features/fortune/constants/fortune-compatibility-route.constant';
import {
  FORTUNE_COMPATIBILITY_STAR_SIGN_SAME_COPY,
  FORTUNE_COMPATIBILITY_TTI_SAME_COPY,
} from '@/features/fortune/constants/fortune-compatibility-same-copy.constant';
import {
  FORTUNE_COMPATIBILITY_HUB_SEO,
  FORTUNE_COMPATIBILITY_STAR_SIGN_SEO,
  FORTUNE_COMPATIBILITY_TTI_SEO,
} from '@/features/fortune/constants/fortune-compatibility-seo.constant';
import {
  FORTUNE_COMPATIBILITY_ELEMENT_NAMES,
  FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS,
  FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_NAMES,
} from '@/features/fortune/constants/fortune-compatibility-star-sign.constant';
import { FORTUNE_COMPATIBILITY_TTI_RELATION_NAMES } from '@/features/fortune/constants/fortune-compatibility-tti.constant';
import {
  FORTUNE_CALC_BASIS_TTI,
  FORTUNE_TIME_UNKNOWN_NOTICE,
} from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import { FORTUNE_STAR_SIGNS } from '@/features/fortune/constants/fortune-star-sign.constant';
import { FORTUNE_ZODIAC } from '@/features/fortune/constants/fortune-zodiac.constant';
import type {
  FortuneStarSignKeyType,
  FortuneTtiKeyType,
} from '@/features/fortune/types/fortune.type';
import {
  resolveFortuneCompatibilityStarSign,
  resolveFortuneCompatibilityStarSignCopy,
  resolveFortuneCompatibilityTti,
  resolveFortuneCompatibilityTtiCopy,
} from '@/features/fortune/utils/fortune-compatibility.util';
import { getSolarTermTime } from '@/features/fortune/utils/fortune-solar-term.util';
import { getTtiKeyByYear } from '@/features/fortune/utils/fortune-tti.util';
import {
  declineCookies,
  storageSnapshot,
  watchPageErrors,
} from './helpers/common.util';

// 개발 서버(첫 컴파일 포함)와 애니메이션을 감안해 기본 대기를 늘린다
const expect = baseExpect.configure({ timeout: 10_000 });

test.describe.configure({ timeout: 120_000 });

/** 2026-11-05 09:00 KST. 날짜가 바뀌어도 결과가 흔들리지 않게 고정한다 */
const NOW = '2026-11-05T09:00:00+09:00';

const TTI_NAME = Object.fromEntries(
  FORTUNE_ZODIAC.map((z) => [z.key, z.name])
) as Record<FortuneTtiKeyType, string>;
const STAR_NAME = Object.fromEntries(
  FORTUNE_STAR_SIGNS.map((s) => [s.key, s.name])
) as Record<FortuneStarSignKeyType, string>;

type BirthType = Readonly<{ year: number; month: number; day: number }>;

// ---------- 열기·입력 ----------

async function open(page: Page, path: string) {
  await page.clock.setFixedTime(new Date(NOW));
  const res = await page.goto(path);
  expect(res?.status(), `${path} 응답`).toBeLessThan(400);
  await declineCookies(page);
}

const consentHeading = (page: Page) =>
  page.getByRole('heading', {
    level: 2,
    name: FORTUNE_COMPATIBILITY_CONSENT_TEXTS.title,
    exact: true,
  });

const grantButton = (page: Page) =>
  page.getByRole('button', {
    name: FORTUNE_COMPATIBILITY_CONSENT_TEXTS.grantButton,
    exact: true,
  });

const stepHeading = (page: Page, name: string) =>
  page.getByRole('heading', { level: 2, name, exact: true });

const FIRST_STEP = '첫 번째 사람의 생년월일';
const SECOND_STEP = '두 번째 사람의 생년월일';

async function checkAllConsent(page: Page) {
  for (const item of FORTUNE_COMPATIBILITY_CONSENT_TEXTS.items) {
    await page.getByRole('checkbox', { name: item, exact: true }).check();
  }
}

/** 이용 전 확인 네 항목을 모두 체크하고 시작한다 */
async function grantConsent(page: Page) {
  await expect(consentHeading(page)).toBeVisible();
  await checkAllConsent(page);
  await grantButton(page).click();
  await expect(stepHeading(page, FIRST_STEP)).toBeVisible();
}

async function openGranted(page: Page, path: string) {
  await open(page, path);
  await grantConsent(page);
}

async function enterBirth(page: Page, birth: BirthType) {
  await page.getByRole('radio', { name: '양력', exact: true }).check({
    force: true,
  });
  await page.getByLabel('연도', { exact: true }).fill(String(birth.year));
  await page.getByLabel('월', { exact: true }).fill(String(birth.month));
  await page.getByLabel('일', { exact: true }).fill(String(birth.day));
}

async function submitBirth(page: Page, submit: string, birth: BirthType) {
  await enterBirth(page, birth);
  await page.getByRole('button', { name: submit, exact: true }).click();
}

/** 첫 번째 사람 → 두 번째 사람 제출. 결과 화면 직전까지 간다 */
async function enterBoth(page: Page, first: BirthType, second: BirthType) {
  await submitBirth(page, '다음 사람 입력', first);
  await expect(stepHeading(page, SECOND_STEP)).toBeVisible();
  await submitBirth(page, '궁합 보기', second);
}

const resultRegion = (page: Page) =>
  page.getByRole('region', { name: '궁합 결과', exact: true });

/** 경계일(입춘·별자리 시작일)이면 시각 질문이 나온다. 시각 모름 → 후보 선택 */
async function chooseCandidate(page: Page, label: string) {
  await expect(
    page.getByRole('heading', { level: 3, name: '태어난 시각', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: '시각 모름', exact: true }).click();
  await page.getByRole('button', { name: label, exact: true }).click();
}

// ---------- AC-3 ----------

test('AC-3: 메뉴에서 궁합 항목으로 허브가 열리고 허브에서 띠 궁합·별자리 궁합으로 이동한다', {
  tag: '@smoke',
}, async ({ page }) => {
  const { pageErrors } = watchPageErrors(page);
  await open(page, '/');

  // 헤더 메뉴: 모바일은 메뉴 시트, 데스크톱은 운세 드롭다운
  const opener = page.getByRole('button', { name: '메뉴 열기', exact: true });
  if (await opener.isVisible()) {
    await opener.click();
    await page
      .getByRole('dialog')
      .getByRole('link', {
        name: new RegExp(`^${FORTUNE_COMPATIBILITY_MENU_TEXTS.label}`),
      })
      .click();
  } else {
    await page
      .getByRole('banner')
      .getByRole('link', { name: '운세', exact: true })
      .hover();
    await page
      .getByRole('link', {
        name: new RegExp(`^${FORTUNE_COMPATIBILITY_MENU_TEXTS.label}`),
      })
      .click();
  }
  await expect(page).toHaveURL(
    new RegExp(`${FORTUNE_COMPATIBILITY_ROUTES.hub}$`)
  );
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: FORTUNE_COMPATIBILITY_HUB_SEO.heading,
      exact: true,
    })
  ).toBeVisible();

  // 허브 목록에서 두 페이지로
  const main = page.getByRole('main');
  await main.getByRole('link', { name: /^띠 궁합/ }).click();
  await expect(page).toHaveURL(
    new RegExp(`${FORTUNE_COMPATIBILITY_ROUTES.tti}$`)
  );
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: FORTUNE_COMPATIBILITY_TTI_SEO.heading,
      exact: true,
    })
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(
    new RegExp(`${FORTUNE_COMPATIBILITY_ROUTES.hub}$`)
  );
  await main.getByRole('link', { name: /^별자리 궁합/ }).click();
  await expect(page).toHaveURL(
    new RegExp(`${FORTUNE_COMPATIBILITY_ROUTES.starSign}$`)
  );
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: FORTUNE_COMPATIBILITY_STAR_SIGN_SEO.heading,
      exact: true,
    })
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

// ---------- AC-12 ----------

test('AC-12: 동의 전에는 입력칸·결과가 없고, 거부하면 이용 불가, 미성년이면 연령 안내만 나온다', async ({
  page,
}) => {
  await open(page, FORTUNE_COMPATIBILITY_ROUTES.tti);

  // 동의 전: 이용 전 확인 항목 4개만 있고 입력칸·결과는 없다
  await expect(consentHeading(page)).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(
    FORTUNE_COMPATIBILITY_CONSENT_TEXTS.items.length
  );
  await expect(page.getByLabel('연도', { exact: true })).toHaveCount(0);
  await expect(resultRegion(page)).toHaveCount(0);

  // 하나라도 체크하지 않으면 시작되지 않고 안내가 나온다
  const items = FORTUNE_COMPATIBILITY_CONSENT_TEXTS.items;
  for (const item of items.slice(0, -1)) {
    await page.getByRole('checkbox', { name: item, exact: true }).check();
  }
  // aria-disabled 버튼은 Playwright가 비활성으로 보므로 사용자가 누르는 것처럼 강제로 누른다
  await grantButton(page).click({ force: true });
  await expect(
    page.getByText(FORTUNE_COMPATIBILITY_CONSENT_TEXTS.blockedNotice, {
      exact: true,
    })
  ).toBeVisible();
  await expect(page.getByLabel('연도', { exact: true })).toHaveCount(0);

  // 거부하면 이용 불가, 돌아가기로 확인 화면이 다시 나온다
  await page
    .getByRole('button', {
      name: FORTUNE_COMPATIBILITY_CONSENT_TEXTS.declineButton,
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: FORTUNE_COMPATIBILITY_DECLINED_TEXTS.title,
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByText(FORTUNE_COMPATIBILITY_DECLINED_TEXTS.body, { exact: true })
  ).toBeVisible();
  await expect(page.getByLabel('연도', { exact: true })).toHaveCount(0);
  await page
    .getByRole('button', {
      name: FORTUNE_COMPATIBILITY_DECLINED_TEXTS.backButton,
      exact: true,
    })
    .click();
  await expect(consentHeading(page)).toBeVisible();

  // 동의 후 두 번째 사람이 만 14세 미만이면 연령 안내만 보인다
  await checkAllConsent(page);
  await grantButton(page).click();
  await expect(stepHeading(page, FIRST_STEP)).toBeVisible();
  await enterBoth(
    page,
    { year: 1990, month: 5, day: 15 },
    { year: 2025, month: 1, day: 1 }
  );
  const ageHeading = page.getByRole('heading', {
    level: 2,
    name: FORTUNE_COMPATIBILITY_AGE_BLOCKED_TEXTS.title,
    exact: true,
  });
  await expect(ageHeading).toBeVisible();
  await expect(
    page.getByText(FORTUNE_COMPATIBILITY_AGE_BLOCKED_TEXTS.body, {
      exact: true,
    })
  ).toBeVisible();
  await expect(resultRegion(page)).toHaveCount(0);
  await expect(page.getByLabel('연도', { exact: true })).toHaveCount(0);
  await expect(stepHeading(page, SECOND_STEP)).toHaveCount(0);

  // 새로고침 뒤에는 입력이 비어 있고, 첫 번째 사람이 미성년이어도 연령 안내만 나온다
  await page.reload();
  await expect(stepHeading(page, FIRST_STEP)).toBeVisible();
  await submitBirth(page, '다음 사람 입력', {
    year: 2025,
    month: 1,
    day: 1,
  });
  await expect(ageHeading).toBeVisible();
  await expect(resultRegion(page)).toHaveCount(0);
  await expect(stepHeading(page, SECOND_STEP)).toHaveCount(0);
});

// ---------- AC-1 ----------

test('AC-1: 띠 궁합은 두 띠·관계·등급·설명·하단 고지가 한 화면에 나오고 같은 입력은 같은 결과이며 새로고침하면 비워진다', async ({
  page,
}) => {
  const { pageErrors } = watchPageErrors(page);
  await openGranted(page, FORTUNE_COMPATIBILITY_ROUTES.tti);

  // 상시 면책은 동의와 관계없이 보인다
  await expect(
    page.getByText(FORTUNE_COMPATIBILITY_DISCLAIMER_TEXT, { exact: true })
  ).toBeVisible();

  const url = page.url();
  const storageBefore = await storageSnapshot(page);

  // 1990년 말띠, 1991년 양띠 = 육합
  const first = { year: 1990, month: 5, day: 15 };
  const second = { year: 1991, month: 5, day: 15 };
  const firstKey: FortuneTtiKeyType = 'horse';
  const secondKey: FortuneTtiKeyType = 'goat';
  expect(getTtiKeyByYear(first.year)).toBe(firstKey);
  expect(getTtiKeyByYear(second.year)).toBe(secondKey);

  // 첫 번째 사람 다음 단계에서 "다시 입력"으로 처음으로 돌아갈 수 있다
  await submitBirth(page, '다음 사람 입력', first);
  await expect(stepHeading(page, SECOND_STEP)).toBeVisible();
  await expect(
    page.getByText(`첫 번째 사람: ${TTI_NAME[firstKey]}`, { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: '다시 입력', exact: true }).click();
  await expect(stepHeading(page, FIRST_STEP)).toBeVisible();
  await expect(page.getByLabel('연도', { exact: true })).toHaveValue('');

  await enterBoth(page, first, second);

  const result = resultRegion(page);
  await expect(result).toBeVisible();
  const relation = resolveFortuneCompatibilityTti(firstKey, secondKey);
  const copy = resolveFortuneCompatibilityTtiCopy(
    firstKey,
    secondKey,
    FORTUNE_COMPATIBILITY_TTI_RELATION_COPY,
    FORTUNE_COMPATIBILITY_TTI_SAME_COPY
  );

  // 입력 순서대로 이름, 관계 이름
  await expect(
    result.getByText(TTI_NAME[firstKey], { exact: true })
  ).toBeVisible();
  await expect(
    result.getByText(TTI_NAME[secondKey], { exact: true })
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      level: 3,
      name: FORTUNE_COMPATIBILITY_TTI_RELATION_NAMES[relation.relation],
      exact: true,
    })
  ).toBeVisible();

  // 등급 세 칸이 모두 보이고 해당 칸만 "이 결과"
  const grades = result.getByRole('list', { name: '궁합 등급', exact: true });
  await expect(grades.getByRole('listitem')).toHaveCount(3);
  const current = grades.getByRole('listitem').filter({ hasText: '이 결과' });
  await expect(current).toHaveCount(1);
  await expect(current).toContainText(
    FORTUNE_COMPATIBILITY_GRADE_NAMES[relation.grade]
  );

  // 요약, 잘 맞는 점 2개, 조율하면 좋은 점 2개
  await expect(
    result.getByText(copy.summary.join(' '), { exact: true })
  ).toBeVisible();
  for (const text of [...copy.strengths, ...copy.adjustments]) {
    await expect(result.getByText(text, { exact: true })).toBeVisible();
  }
  await expect(result.getByText(/\d+\s*(점|%)/)).toHaveCount(0);

  // 하단 고지(같은 페이지)
  await expect(
    page.getByText(FORTUNE_COMPATIBILITY_RESULT_NOTICE, { exact: true })
  ).toBeVisible();

  // 입력은 URL·저장소에 남지 않는다
  expect(page.url()).toBe(url);
  expect(await storageSnapshot(page)).toEqual(storageBefore);

  // 같은 입력은 같은 결과
  const firstText = await result.textContent();
  await page.getByRole('button', { name: '다시 입력', exact: true }).click();
  await expect(stepHeading(page, FIRST_STEP)).toBeVisible();
  await expect(page.getByLabel('연도', { exact: true })).toHaveValue('');
  await enterBoth(page, first, second);
  await expect(resultRegion(page)).toBeVisible();
  expect(await resultRegion(page).textContent()).toBe(firstText);

  // 새로고침하면 결과가 사라지고 입력은 비어 있다(동의는 같은 탭에서 유지)
  await page.reload();
  await expect(stepHeading(page, FIRST_STEP)).toBeVisible();
  await expect(resultRegion(page)).toHaveCount(0);
  await expect(page.getByLabel('연도', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('월', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('일', { exact: true })).toHaveValue('');
  expect(pageErrors).toEqual([]);
});

test('AC-1: 1~2월생은 입춘 기준 안내와 띠별 운세 링크가 나오고, 입춘 당일 시각 모름은 후보를 골라 바로 다음으로 가며 다른 후보로 바꿀 수 있다', async ({
  page,
}) => {
  await openGranted(page, FORTUNE_COMPATIBILITY_ROUTES.tti);

  // 입춘 다음 날이 아닌 1~2월(입춘 전 2월 10일은 입춘 뒤라 그해 띠): 안내 줄만 있고 후보 바꾸기는 없다
  await enterBoth(
    page,
    { year: 1990, month: 2, day: 10 },
    { year: 1991, month: 5, day: 15 }
  );
  const result = resultRegion(page);
  await expect(result).toBeVisible();
  await expect(
    result.getByText(FORTUNE_CALC_BASIS_TTI, { exact: true })
  ).toBeVisible();
  await expect(
    result.getByRole('link', { name: '띠별 운세', exact: true })
  ).toHaveAttribute('href', FORTUNE_ROUTES.tti);
  await expect(
    result.getByRole('button', { name: '다른 후보로 보기', exact: true })
  ).toHaveCount(0);

  // 입춘 당일: 시각 질문 → 시각 모름 → 후보 선택 즉시 다음 단계
  const lichun = getSolarTermTime(1990, 2);
  if (!lichun) throw new Error('입춘 표 없음');
  const afterKey = getTtiKeyByYear(1990);
  const beforeKey = getTtiKeyByYear(1989);
  await result.getByRole('button', { name: '다시 입력', exact: true }).click();
  await expect(stepHeading(page, FIRST_STEP)).toBeVisible();
  await submitBirth(page, '다음 사람 입력', {
    year: 1990,
    month: lichun.month,
    day: lichun.day,
  });
  await chooseCandidate(page, `${TTI_NAME[afterKey]}로 보기`);
  await expect(stepHeading(page, SECOND_STEP)).toBeVisible();
  await submitBirth(page, '궁합 보기', { year: 1991, month: 5, day: 15 });

  const shown = resultRegion(page);
  await expect(shown).toBeVisible();
  const unknownLine = (name: string) =>
    `${FORTUNE_TIME_UNKNOWN_NOTICE} 첫 번째 사람은 ${name}로 보고 있습니다.`;
  await expect(
    shown.getByText(unknownLine(TTI_NAME[afterKey]), { exact: true })
  ).toBeVisible();
  const swap = shown.getByRole('button', {
    name: '다른 후보로 보기',
    exact: true,
  });
  await expect(swap).toHaveCount(1);
  const afterRelation = resolveFortuneCompatibilityTti(afterKey, 'goat');
  await expect(
    shown.getByRole('heading', {
      level: 3,
      name: FORTUNE_COMPATIBILITY_TTI_RELATION_NAMES[afterRelation.relation],
      exact: true,
    })
  ).toBeVisible();

  await swap.click();
  await expect(
    shown.getByText(unknownLine(TTI_NAME[beforeKey]), { exact: true })
  ).toBeVisible();
  await expect(
    shown.getByText(TTI_NAME[beforeKey], { exact: true }).first()
  ).toBeVisible();
  const beforeRelation = resolveFortuneCompatibilityTti(beforeKey, 'goat');
  await expect(
    shown.getByRole('heading', {
      level: 3,
      name: FORTUNE_COMPATIBILITY_TTI_RELATION_NAMES[beforeRelation.relation],
      exact: true,
    })
  ).toBeVisible();
});

// ---------- AC-2 ----------

test('AC-2: 별자리 궁합은 두 별자리·원소·원소 관계·등급·설명이 나오고, 별자리가 바뀌는 날은 시각 모름으로 두 결과를 볼 수 있다', async ({
  page,
}) => {
  const { pageErrors } = watchPageErrors(page);
  await openGranted(page, FORTUNE_COMPATIBILITY_ROUTES.starSign);

  // 5월 15일 황소자리(흙), 3월 1일 물고기자리(물) = 보완
  const firstKey: FortuneStarSignKeyType = 'taurus';
  const secondKey: FortuneStarSignKeyType = 'pisces';
  await enterBoth(
    page,
    { year: 1990, month: 5, day: 15 },
    { year: 1991, month: 3, day: 1 }
  );

  const result = resultRegion(page);
  await expect(result).toBeVisible();
  const relation = resolveFortuneCompatibilityStarSign(firstKey, secondKey);
  const copy = resolveFortuneCompatibilityStarSignCopy(
    firstKey,
    secondKey,
    FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_COPY,
    FORTUNE_COMPATIBILITY_STAR_SIGN_SAME_COPY
  );
  await expect(
    result.getByText(STAR_NAME[firstKey], { exact: true })
  ).toBeVisible();
  await expect(
    result.getByText(STAR_NAME[secondKey], { exact: true })
  ).toBeVisible();
  for (const key of [firstKey, secondKey]) {
    await expect(
      result.getByText(
        FORTUNE_COMPATIBILITY_ELEMENT_NAMES[
          FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS[key]
        ],
        { exact: true }
      )
    ).toBeVisible();
  }
  await expect(
    result.getByRole('heading', {
      level: 3,
      name: FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_NAMES[relation.relation],
      exact: true,
    })
  ).toBeVisible();
  const current = result
    .getByRole('list', { name: '궁합 등급', exact: true })
    .getByRole('listitem')
    .filter({ hasText: '이 결과' });
  await expect(current).toHaveCount(1);
  await expect(current).toContainText(
    FORTUNE_COMPATIBILITY_GRADE_NAMES[relation.grade]
  );
  await expect(
    result.getByText(copy.summary.join(' '), { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText(FORTUNE_COMPATIBILITY_RESULT_NOTICE, { exact: true })
  ).toBeVisible();
  // 별자리 궁합에는 1~2월 띠 안내가 없다
  await expect(result.getByText(FORTUNE_CALC_BASIS_TTI)).toHaveCount(0);

  // 별자리가 바뀌는 날(곡우, 황소자리 시작): 시각 모름 → 후보 선택 즉시 다음 → 다른 후보로 보기
  const term = getSolarTermTime(1990, 7);
  if (!term) throw new Error('절기 표 없음');
  await result.getByRole('button', { name: '다시 입력', exact: true }).click();
  await expect(stepHeading(page, FIRST_STEP)).toBeVisible();
  await submitBirth(page, '다음 사람 입력', {
    year: 1990,
    month: term.month,
    day: term.day,
  });
  await chooseCandidate(page, `${STAR_NAME.taurus}로 보기`);
  await expect(stepHeading(page, SECOND_STEP)).toBeVisible();
  await submitBirth(page, '궁합 보기', { year: 1991, month: 3, day: 1 });

  const shown = resultRegion(page);
  await expect(shown).toBeVisible();
  const line = (name: string) =>
    `${FORTUNE_TIME_UNKNOWN_NOTICE} 첫 번째 사람은 ${name}로 보고 있습니다.`;
  await expect(
    shown.getByText(line(STAR_NAME.taurus), { exact: true })
  ).toBeVisible();
  await shown
    .getByRole('button', { name: '다른 후보로 보기', exact: true })
    .click();
  await expect(
    shown.getByText(line(STAR_NAME.aries), { exact: true })
  ).toBeVisible();
  const swapped = resolveFortuneCompatibilityStarSign('aries', secondKey);
  await expect(
    shown.getByRole('heading', {
      level: 3,
      name: FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_NAMES[swapped.relation],
      exact: true,
    })
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

// ---------- 공통 ----------

test('공통: 세 페이지가 정상 응답하고 h1 하나, 메타가 있으며 320px에서 가로 스크롤이 없다', async ({
  page,
}) => {
  const { pageErrors, hydration } = watchPageErrors(page);
  await page.setViewportSize({ width: 320, height: 700 });

  const pages = [
    [FORTUNE_COMPATIBILITY_ROUTES.hub, FORTUNE_COMPATIBILITY_HUB_SEO],
    [FORTUNE_COMPATIBILITY_ROUTES.tti, FORTUNE_COMPATIBILITY_TTI_SEO],
    [
      FORTUNE_COMPATIBILITY_ROUTES.starSign,
      FORTUNE_COMPATIBILITY_STAR_SIGN_SEO,
    ],
  ] as const;

  const expectNoHorizontalScroll = async (label: string) => {
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow, `${label} 가로 넘침`).toBeLessThanOrEqual(0);
  };

  for (const [path, seo] of pages) {
    await open(page, path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      seo.heading
    );
    expect(await page.title()).toContain(seo.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      seo.description
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${path}$`)
    );
    await expectNoHorizontalScroll(path);
  }

  // 가장 긴 이름 두 개(쌍둥이자리, 물고기자리)로 결과 화면
  await open(page, FORTUNE_COMPATIBILITY_ROUTES.starSign);
  await grantConsent(page);
  await expectNoHorizontalScroll('동의 뒤 첫 단계');
  await enterBoth(
    page,
    { year: 1990, month: 6, day: 5 },
    { year: 1991, month: 3, day: 1 }
  );
  await expect(resultRegion(page)).toBeVisible();
  await expect(
    resultRegion(page).getByText(STAR_NAME.gemini, { exact: true })
  ).toBeVisible();
  await expect(
    resultRegion(page).getByText(STAR_NAME.pisces, { exact: true })
  ).toBeVisible();
  await expectNoHorizontalScroll('별자리 결과');

  expect(pageErrors).toEqual([]);
  expect(hydration).toEqual([]);
});
