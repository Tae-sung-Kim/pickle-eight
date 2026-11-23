import { describe, expect, it } from 'vitest';
import { LUCKY_DRAW_FAQ } from '@/features/lucky-draw/constants/lucky-draw-faq.constant';
import {
  LUCKY_DRAW_HUB_PATH,
  LUCKY_DRAW_TOOL_PATHS,
} from '@/features/lucky-draw/constants/lucky-draw-route.constant';
import { LUCKY_DRAW_SEO } from '@/features/lucky-draw/constants/lucky-draw-seo.constant';
import { getLuckyDrawJsonLd } from '@/features/lucky-draw/utils/lucky-draw-seo.util';

const KEYS = ['hub', 'ladder', 'roulette', 'lots'] as const;
const PATHS = {
  hub: LUCKY_DRAW_HUB_PATH,
  ladder: LUCKY_DRAW_TOOL_PATHS.ladder,
  roulette: LUCKY_DRAW_TOOL_PATHS.roulette,
  lots: LUCKY_DRAW_TOOL_PATHS.lots,
};

type CrumbType = { position: number; name: string; item: string };
type QuestionType = { name: string; acceptedAnswer: { text: string } };

describe('운빨 뽑기 SEO 상수', () => {
  it('제비뽑기 키워드: 카드 뽑기는 있고 순서·당번 키워드는 없다 (확인 19)', () => {
    const k = LUCKY_DRAW_SEO.lots.keywords;
    expect(k).toContain('제비뽑기');
    expect(k).toContain('카드 뽑기');
    for (const w of ['순서 정하기', '발표 순서 정하기', '당번 정하기']) {
      expect(k).not.toContain(w);
    }
  });
  it('당번 정하기는 사다리 키워드에 있다 (확인 19)', () => {
    expect(LUCKY_DRAW_SEO.ladder.keywords).toContain('당번 정하기');
  });
  it('제비뽑기 제목·설명·헤더는 카드 방식이고 공개 방식 문구가 없다', () => {
    const s = LUCKY_DRAW_SEO.lots;
    expect(`${s.title}${s.description}${s.headerDescription}`).toContain(
      '카드'
    );
    expect(`${s.title}${s.description}${s.headerDescription}`).not.toMatch(
      /결과 가리기|결과 보기|한 명씩/
    );
  });
  it('제비뽑기 FAQ는 카드 방식 질문 4개 (순서 정하기 포함)', () => {
    const q = LUCKY_DRAW_FAQ.lots.map((f) => f.question).join('|');
    expect(q).toContain('카드는 어떻게 섞이나요?');
    expect(q).toContain('다시 열 수 있나요?');
    expect(q).toContain('순서 정하기');
    const text = LUCKY_DRAW_FAQ.lots.map((f) => f.answer).join('|');
    expect(text).not.toMatch(/결과 가리기|결과 보기|한 명씩 열기/);
  });
  it('돌림판 FAQ는 칸 글자·강조 칸 가림과 바늘 추측 한계를 말한다', () => {
    const a = LUCKY_DRAW_FAQ.roulette.map((f) => f.answer).join('|');
    expect(a).toContain('칸 글자와 강조 칸');
    expect(a).toContain('바늘');
  });
  it('허브 FAQ 첫 답: 제비뽑기는 뒷면 카드를 한 장씩 연다', () => {
    const a = LUCKY_DRAW_FAQ.hub[0].answer;
    expect(a).toContain('제비뽑기는 뒷면 카드를 한 장씩 엽니다.');
    expect(a).toContain('사다리 타기는 한 명씩 열어 볼 수도 있습니다');
  });
});

describe('getLuckyDrawJsonLd', () => {
  it.each(KEYS)('%s: BreadcrumbList와 FAQPage 두 개', (k) => {
    const ld = getLuckyDrawJsonLd(k);
    expect(ld).toHaveLength(2);
    expect(ld[0]['@type']).toBe('BreadcrumbList');
    expect(ld[1]['@type']).toBe('FAQPage');
    expect(ld[0]['@context']).toBe('https://schema.org');
  });
  it.each(KEYS)('%s: 빵부스러기 단계와 위치', (k) => {
    const list = getLuckyDrawJsonLd(k)[0].itemListElement as CrumbType[];
    expect(list).toHaveLength(k === 'hub' ? 2 : 3);
    list.forEach((e, i) => {
      expect(e.position).toBe(i + 1);
      expect(e.item).toMatch(/^https?:\/\//);
    });
    expect(list[0].name).toBe('홈');
    expect(list[1].name).toBe('운빨 뽑기');
    expect(list[1].item.endsWith(LUCKY_DRAW_HUB_PATH)).toBe(true);
    if (k !== 'hub') {
      expect(list[2].name).toBe(LUCKY_DRAW_SEO[k].breadcrumbName);
      expect(list[2].item.endsWith(PATHS[k])).toBe(true);
    }
  });
  it.each(KEYS)('%s: FAQ가 화면 상수와 같다', (k) => {
    const main = getLuckyDrawJsonLd(k)[1].mainEntity as QuestionType[];
    expect(main).toHaveLength(LUCKY_DRAW_FAQ[k].length);
    main.forEach((q, i) => {
      expect(q.name).toBe(LUCKY_DRAW_FAQ[k][i].question);
      expect(q.acceptedAnswer.text).toBe(LUCKY_DRAW_FAQ[k][i].answer);
    });
  });
  it('JSON 직렬화가 가능하다', () => {
    for (const k of KEYS) {
      expect(() => JSON.stringify(getLuckyDrawJsonLd(k))).not.toThrow();
    }
  });
});
