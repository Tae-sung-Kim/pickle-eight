import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/services';
import { EmojiTranslationRequestSchema } from '@/schemas';

export type EmojiQuizProblem = {
  emojis: string;
  category: string;
  answer: string;
  hint?: string;
};
export type EmojiQuizGrade = {
  correct: boolean;
  score: number;
  feedback: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = EmojiTranslationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    if (parsed.data.action === 'generate') {
      const category = parsed.data.category ?? '랜덤';
      const prompt = `너는 한국어 이모지 퀴즈 출제자야. 아래 형식으로 한 문제를 만들어줘. JSON만 출력해.
필수 조건(공통):
- 카테고리: ${category}
- 이모지만으로 표현 (2~6개)
- 정답은 한국어 텍스트(영화/음식/사물/개념 등)
- 실제로 통용되는 명칭/작품/표현만 사용(신조어/조어/가상 금지). 가능하면 표제형/공식 표기 사용.
- 문장형 감탄/명령 금지. 보통명사/작품명/관용구 등 널리 쓰이는 표현 사용.
- 힌트는 정답을 간접적으로 설명하되, 이모지와 의미적으로 일관되어야 함.
- 최근 생성과 중복되는 정답/패턴을 피하고 참신하게 구성. 다양성 토큰: nonce=${Date.now()}.
카테고리별 추가 규칙:
- 영화: 실제 영화 제목만. 이모지는 영화의 핵심 요소(배경, 인물 관계, 테마, 상징)와 제목의 핵심 명사/키워드를 직접 연상시키는 아이콘을 포함해야 함.
  예: '해리포터와 불의 잔'이라면 잔/컵/트로피류와 불/화염 이모지 중 최소 1개 이상 포함. 시리즈 공통 요소(모자/안경/막대 등)만으로는 금지.
  영화와 무관한 직업/에피소드(예: 피자 배달, 택배 등) 암시는 금지.
- 음식: 실제 요리/음식 명칭만. 재료/조리/지역 등 합리적 요소 사용.
- 일상: 일반 보통명사/개념/관용구/사자성어 등. 개인 감탄/명령/유행어 금지.
출력(JSON): {"emojis": "😀🍕…", "category": "카테고리", "answer": "정답", "hint": "선택"}`;

      async function judgeCoherence(p: EmojiQuizProblem): Promise<boolean> {
        const judgePrompt = `다음 이모지 퀴즈의 일관성을 0~1로 평가하세요.
- 이모지: ${p.emojis}
- 카테고리: ${p.category}
- 정답: ${p.answer}
- 힌트: ${p.hint ?? ''}
판정 기준:
- 이모지 조합이 정답을 합리적으로 연상시키는가?
- 힌트가 이모지와 정답 모두와 의미적으로 일치하는가?
출력(JSON): {"score": 0|1, "reason": "짧은 근거"}`;
        const content = await callOpenAI({
          messages: [
            { role: 'system', content: '너는 엄격한 일관성 판정기야.' },
            { role: 'user', content: judgePrompt },
          ],
          max_tokens: 80,
          temperature: 0,
          json: true,
        });
        const cleaned = content.replace(/```json|```/g, '').trim();
        try {
          const out = JSON.parse(cleaned) as { score?: number };
          return out.score === 1;
        } catch {
          return false;
        }
      }

      async function verifyAnswerAuthenticity(
        category: string,
        answer: string
      ): Promise<{ ok: boolean; canonical?: string }> {
        const vPrompt = `다음 정답이 지정된 카테고리에 대해 실제로 통용되는 명칭/표제/작품/음식/표현인지 판별하세요.
카테고리별 판정 기준:
- 영화: 실제 개봉/발매된 영화 제목이어야 함(번역 제목 포함 허용). 팬메이드/가상의 제목 금지.
- 음식: 실제로 통용되는 음식/요리명이어야 함. 조어 금지.
- 일상: 일반적으로 통용되는 보통명사/개념 또는 널리 쓰이는 관용구/사자성어/관용표현 허용. 개인적 감탄/명령/유행어는 금지.
- 랜덤: 위 범주 중 하나로 합당하게 분류 가능한 통용 명칭 또는 넔리 쓰이는 관용구/사자성어 허용. 개인적 감탄/명령/유행어 금지.
요구사항:
- 통용되지 않으면 ok=false.
- 통용되면 대표 표기(표제형/정식명칭)를 canonical에 제시.
출력(JSON): {"ok": true|false, "canonical": "대표 표기 또는 빈 문자열"}
입력: 카테고리=${category}, 정답=${answer}`;
        const content = await callOpenAI({
          messages: [
            { role: 'system', content: '너는 한국어 지식/표제 검증기야.' },
            { role: 'user', content: vPrompt },
          ],
          max_tokens: 80,
          temperature: 0,
          json: true,
        });
        const cleaned = content.replace(/```json|```/g, '').trim();
        try {
          const out = JSON.parse(cleaned) as {
            ok?: boolean;
            canonical?: string;
          };
          const ok = !!out.ok;
          const canonical = (out.canonical ?? '').trim();
          return { ok, canonical: canonical || undefined };
        } catch {
          return { ok: false };
        }
      }

      async function verifyMovieHint(
        answer: string,
        hint: string | undefined
      ): Promise<boolean> {
        if (!hint) return true;
        const vPrompt = `다음 힌트가 특정 영화 제목(정답)에 대해 사실과 부합하는지 판단하세요.
요구사항:
- 힌트가 그 영화의 설정/주제/인물관계/상징 등 핵심 요소를 올바르게 표현해야 함.
- 영화와 무관한 직업/에피소드(예: 피자 배달 소년) 등을 암시하면 부합하지 않음.
출력(JSON): {"ok": true|false}
입력: 정답영화=${answer}, 힌트=${hint}`;
        const content = await callOpenAI({
          messages: [
            { role: 'system', content: '너는 사실 검증가야.' },
            { role: 'user', content: vPrompt },
          ],
          max_tokens: 40,
          temperature: 0,
          json: true,
        });
        const cleaned = content.replace(/```json|```/g, '').trim();
        try {
          const out = JSON.parse(cleaned) as { ok?: boolean };
          return !!out.ok;
        } catch {
          return false;
        }
      }

      async function enforceMovieTitleKeywordCoverage(
        answer: string,
        emojis: string
      ): Promise<boolean> {
        const vPrompt = `영화 제목의 핵심 키워드가 이모지에 반영됐는지 판정하세요.
규칙:
- 제목에서 핵심 명사/상징 1~3개 추출.
- 이모지가 그 키워드와 직접적으로 매칭되는 아이콘을 최소 1개 이상 포함해야 함(가능하면 2개).
- 시리즈 공통 상징(안경/마법 모자/마법봉 등)만으로는 인정하지 않음.
출력(JSON): {"ok": true|false}
입력: 제목=${answer}, 이모지=${emojis}`;
        const content = await callOpenAI({
          messages: [
            {
              role: 'system',
              content: '너는 키워드-이모지 커버리지 판정기야.',
            },
            { role: 'user', content: vPrompt },
          ],
          max_tokens: 120,
          temperature: 0,
          json: true,
        });
        const cleaned = content.replace(/```json|```/g, '').trim();
        try {
          const out = JSON.parse(cleaned) as { ok?: boolean };
          return !!out.ok;
        } catch {
          return false;
        }
      }

      let attempts = 0;
      while (attempts < 6) {
        const content = await callOpenAI({
          messages: [
            {
              role: 'system',
              content:
                '너는 창의적인 이모지 퀴즈 출제자야. 반드시 JSON만 반환.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 200,
          temperature: 0.4,
          json: true,
          presence_penalty: 0.1,
          frequency_penalty: 0.3,
        });
        const cleaned = content.replace(/```json|```/g, '').trim();
        const out = JSON.parse(cleaned) as EmojiQuizProblem;
        if (!out?.emojis || !out?.answer) {
          attempts += 1;
          continue;
        }
        // 1) 일관성 판정
        const coherent = await judgeCoherence(out);
        if (!coherent) {
          attempts += 1;
          continue;
        }
        // 2) 모든 카테고리에 대해 사실성 검증
        const ver = await verifyAnswerAuthenticity(out.category, out.answer);
        if (!ver.ok) {
          attempts += 1;
          continue;
        }
        if (ver.canonical) out.answer = ver.canonical;
        // 3) 영화일 때 힌트가 사실과 부합하는지 검증
        if (out.category === '영화') {
          const okHint = await verifyMovieHint(out.answer, out.hint);
          if (!okHint) {
            attempts += 1;
            continue;
          }
          const okCoverage = await enforceMovieTitleKeywordCoverage(
            out.answer,
            out.emojis
          );
          if (!okCoverage) {
            attempts += 1;
            continue;
          }
        }
        return NextResponse.json(out satisfies EmojiQuizProblem);
        attempts += 1;
      }
      throw new Error(
        '일관성 있는 이모지 문제 생성에 실패했습니다. 다시 시도해주세요.'
      );
    }

    // grade
    const { emojis, answer, userGuess } = parsed.data;
    const prompt = `다음 이모지 퀴즈의 정답 여부를 판정해줘. 의미상 동일/매우 유사하면 정답. JSON만 출력.
- 이모지: ${emojis}
- 정답: ${answer}
- 사용자 답: ${userGuess}
출력(JSON): {"correct": boolean, "score": 0|1, "feedback": string }`;
    const content = await callOpenAI({
      messages: [
        { role: 'system', content: '너는 간결한 채점기야. 항상 JSON만 반환.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.2,
      json: true,
    });
    const cleaned = content.replace(/```json|```/g, '').trim();
    const out = JSON.parse(cleaned) as {
      correct: boolean;
      score: number;
      feedback: string;
    };
    const result: EmojiQuizGrade = {
      correct: !!out.correct,
      score: out.score === 1 ? 1 : 0,
      feedback:
        out.feedback ??
        (out.correct ? '정답입니다.' : '아까워요! 다시 시도해보세요.'),
    };
    return NextResponse.json(result satisfies EmojiQuizGrade);
  } catch (e) {
    const err = e as Error;
    return NextResponse.json(
      { error: err.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
