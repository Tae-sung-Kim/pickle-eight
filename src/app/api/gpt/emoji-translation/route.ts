import { EMOJI_CATEGORY_ENUM } from '@/features/quiz/constants/emoji-translation.constant';
import { EmojiTranslationRequestSchema } from '@/features/quiz/schemas/emoji-translation.schema';
import { callOpenAI } from '@/features/quiz/services/openai.service';
import {
  EmojiQuizGradeType,
  EmojiTranslationProblemType,
} from '@/features/quiz/types/emoji-translation.type';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Lightweight, robust v2 of the emoji translation route.
 * Goals:
 * - Deterministic model routing with strictModel (no hidden fallback)
 * - JSON-only outputs with clear two-step repair (same model → stable backup)
 * - Minimal optional checks (dup/auth) behind flags
 * - Clear debug in response header and body when debug=true
 */

// ===== Utilities =====

/** Extract the first JSON object substring in a text. */
function extractFirstJsonObject(text: string): string | null {
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && start >= 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// /** Normalize a text for simple dedup checks. */
// function normalize(input: string): string {
//   return input
//     .toLowerCase()
//     .trim()
//     .replace(/[`"'·•~|]/g, ' ')
//     .replace(/[\t\n\r]+/g, ' ')
//     .replace(/\s{2,}/g, ' ')
//     .trim();
// }

/** Heuristic: whether model name indicates Responses family. */
function isResponsesModel(model?: string | null): boolean {
  if (!model) return false;
  const m = model.toLowerCase();
  return (
    m.startsWith('o1') ||
    m.startsWith('o3') ||
    m.includes('4.1') ||
    m.startsWith('gpt-5')
  );
}

/** Pick effective category (avoid RANDOM placeholder). */
function effectiveCategoryOf(requested?: string): string {
  if (!requested || requested === EMOJI_CATEGORY_ENUM.RANDOM) return '일상';
  return requested;
}

/** Build a short, strict prompt for generation. */
function buildPrompt(category: string): string {
  const fewShot =
    category === '영화'
      ? `예시(JSON): {"emojis":"🧪🕒","answer":"시간여행","category":"영화","hint":"과거와 미래"}`
      : category === '음식'
        ? `예시(JSON): {"emojis":"🍞🧈","answer":"버터빵","category":"음식","hint":"고소한 풍미"}`
        : `예시(JSON): {"emojis":"🌧️☂️","answer":"우산","category":"${category}","hint":"비오는 날"}`;
  return `너는 한국어 이모지 퀴즈 출제자야. 한 문제만 만들고, 반드시 JSON만 출력해.
요구사항:
- category: ${category}
- emojis: 이모지 2~6개 나열(텍스트 금지)
- answer: 한국어 정답(실제 통용 표기)
- hint: 간단한 간접 힌트
출력 JSON 스키마(정확히 이 키만): {"emojis": string, "answer": string, "category": "${category}", "hint": string}
${fewShot}`;
}

/** Try to coerce arbitrary text into the problem schema using the same model. */
async function coerceToSchema(
  raw: string,
  category: string,
  model?: string,
  strictModel?: boolean
): Promise<EmojiTranslationProblemType | null> {
  try {
    const content = await callOpenAI({
      messages: [
        { role: 'system', content: '너는 포맷 보정기야. 항상 JSON만 반환.' },
        {
          role: 'user',
          content: `다음 텍스트를 이 스키마로 변환:\n스키마: {"emojis":"이모지 나열","answer":"정답","category":"${category}","hint":"간단한 힌트"}\n텍스트: ${raw}`,
        },
      ],
      max_tokens: 180,
      temperature: 0,
      json: true,
      ...(model ? { model } : {}),
      ...(strictModel ? { strictModel } : {}),
    });
    const fixed =
      extractFirstJsonObject(content) ??
      content.replace(/```json|```/g, '').trim();
    return JSON.parse(fixed) as EmojiTranslationProblemType;
  } catch {
    return null;
  }
}

/** Repair via stable backup if same-model coercion failed. */
async function repairToSchemaStable(
  raw: string,
  category: string
): Promise<EmojiTranslationProblemType | null> {
  try {
    const content = await callOpenAI({
      messages: [
        { role: 'system', content: '너는 포맷 보정기야. 항상 JSON만 반환.' },
        {
          role: 'user',
          content: `다음 텍스트를 이 스키마로 변환/보정:\n스키마: {"emojis":"이모지 나열(2~6)","answer":"정답","category":"${category}","hint":"간단한 힌트"}\n텍스트: ${raw}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.2,
      json: true,
      model: 'gpt-4o-mini',
      strictModel: false,
    });
    const fixed =
      extractFirstJsonObject(content) ??
      content.replace(/```json|```/g, '').trim();
    return JSON.parse(fixed) as EmojiTranslationProblemType;
  } catch {
    return null;
  }
}

/** Ensure minimal validity and fill defaults. */
function sanitizeProblem(
  maybe: Partial<EmojiTranslationProblemType>,
  category: string
): EmojiTranslationProblemType | null {
  const emojis = (maybe.emojis ?? '').trim();
  const answer = (maybe.answer ?? '').trim();
  const hint = (maybe.hint ?? '').trim() || '핵심 특징을 떠올려 보세요';
  if (!emojis || !answer) return null;
  return {
    emojis,
    answer,
    category: (maybe.category || category).trim() || category,
    hint,
  };
}

/** Lightweight fallback to guarantee response. */
function fallbackProblem(category: string): EmojiTranslationProblemType {
  const base = category || '일상';
  if (base === '영화')
    return {
      emojis: '🎬❓',
      answer: '영화',
      category: '영화',
      hint: '간단한 연상 퀴즈',
    };
  if (base === '음식')
    return {
      emojis: '🍽️❓',
      answer: '음식',
      category: '음식',
      hint: '간단한 연상 퀴즈',
    };
  return {
    emojis: '🧩❓',
    answer: '퀴즈',
    category: base,
    hint: '간단한 연상 퀴즈',
  };
}

// ===== Handler =====

export async function POST(req: NextRequest) {
  const debugEvents: Array<Record<string, unknown>> = [];
  function pushDebug(stage: string, detail?: Record<string, unknown>): void {
    debugEvents.push({ stage, ...(detail || {}) });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = EmojiTranslationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // Common flags
    const request = parsed.data as Partial<{
      action: 'generate' | 'grade';
      category: string;
      model: string;
      strictModel: boolean;
      temperature: number;
      top_p: number;
      noRepair: boolean;
      noAuth: boolean; // kept for compatibility (not enforced in v2)
      noDupCheck: boolean; // kept for compatibility (not enforced in v2)
      debug: boolean;
      // grade fields
      emojis: string;
      answer: string;
      userGuess: string;
    }>;

    const debugFlag = true; //Boolean((request as { debug?: boolean }).debug);

    // ----- GENERATE -----
    if (request.action === 'generate') {
      const category = effectiveCategoryOf(request.category);
      const model = request.model || 'gpt-4o-mini';
      const strictModel = request.strictModel ?? Boolean(request.model);
      const isResp = isResponsesModel(model);
      const temperature =
        typeof request.temperature === 'number'
          ? request.temperature
          : isResp
            ? 0.55
            : 0.7;
      const top_p =
        typeof request.top_p === 'number' ? request.top_p : undefined;
      const noRepair = Boolean(request.noRepair);

      if (debugFlag)
        pushDebug('init', {
          category,
          requestedCategory: request.category ?? '랜덤',
          model,
          strictModel,
          isResp,
          temperature,
          top_p,
          noRepair,
        });

      const prompt = buildPrompt(category);
      if (debugFlag) pushDebug('prompt_ready', { len: prompt.length });

      // One main attempt
      let raw = '';
      try {
        raw = await callOpenAI({
          messages: [
            {
              role: 'system',
              content:
                '너는 창의적인 이모지 퀴즈 출제자야. 반드시 JSON만 반환.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 240,
          temperature,
          ...(typeof top_p === 'number' ? { top_p } : {}),
          json: true,
          model,
          ...(strictModel ? { strictModel: true } : {}),
        });
        if (debugFlag) pushDebug('llm_ok', { len: raw.length });
      } catch (e) {
        if (debugFlag) pushDebug('llm_error', { message: String(e) });
      }

      // Try parsing
      const cleaned =
        extractFirstJsonObject(raw) ?? raw.replace(/```json|```/g, '').trim();
      if (debugFlag) pushDebug('cleaned_ready', { len: cleaned.length });

      let out: EmojiTranslationProblemType | null = null;
      try {
        out = JSON.parse(cleaned) as EmojiTranslationProblemType;
        if (debugFlag) pushDebug('json_parse_ok');
      } catch {
        if (!noRepair) {
          // same-model coerce
          const fixed = await coerceToSchema(raw, category, model, strictModel);
          if (fixed) {
            out = fixed;
            if (debugFlag) pushDebug('coerce_success');
          } else {
            // stable repair (non-strict backup)
            const repaired = await repairToSchemaStable(raw, category);
            if (repaired) {
              out = repaired;
              if (debugFlag) pushDebug('repair_success');
            } else {
              if (debugFlag) pushDebug('repair_failed');
            }
          }
        } else {
          if (debugFlag) pushDebug('skip_repair');
        }
      }

      // Final sanitize or fallback
      const final = out ? sanitizeProblem(out, category) : null;
      const accepted = final ?? fallbackProblem(category);
      if (debugFlag)
        pushDebug(final ? 'accepted' : 'final_fallback', {
          category: accepted.category,
        });

      // Prepare response
      const payload: Record<string, unknown> = { ...accepted };
      if (debugFlag)
        payload._debug = { model, strictModel, isResp, events: debugEvents };
      const res = NextResponse.json(payload);
      if (debugFlag) {
        try {
          res.headers.set(
            'x-emoji-debug',
            encodeURIComponent(
              JSON.stringify({
                model,
                strictModel,
                isResp,
                events: debugEvents,
              }).slice(0, 1800)
            )
          );
          res.headers.set('Access-Control-Expose-Headers', 'x-emoji-debug');
          console.log('[emoji-debug]', {
            model,
            strictModel,
            isResp,
            events: debugEvents,
          });
        } catch {
          // ignore
        }
      }
      return res;
    }

    // ----- GRADE ----- (retain behavior)
    const { emojis, answer, userGuess } = body as {
      emojis: string;
      answer: string;
      userGuess: string;
    };
    const gradePrompt = `다음 이모지 퀴즈의 정답 여부를 판정해줘. 의미상 동일/매우 유사하면 정답. JSON만 출력.
- 이모지: ${emojis}
- 정답: ${answer}
- 사용자 답: ${userGuess}
출력(JSON): {"correct": boolean, "score": 0|1, "feedback": string }`;

    let judged = '';
    try {
      judged = await callOpenAI({
        messages: [
          {
            role: 'system',
            content: '너는 간결한 채점기야. 항상 JSON만 반환.',
          },
          { role: 'user', content: gradePrompt },
        ],
        max_tokens: 150,
        temperature: 0.2,
        json: true,
      });
    } catch {
      return NextResponse.json(
        { error: 'Failed to grade answer' },
        { status: 500 }
      );
    }
    const cleaned =
      extractFirstJsonObject(judged) ??
      judged.replace(/```json|```/g, '').trim();
    const out = JSON.parse(cleaned) as {
      correct: boolean;
      score: number;
      feedback: string;
    };
    const result: EmojiQuizGradeType = {
      correct: !!out.correct,
      score: out.score === 1 ? 1 : 0,
      feedback:
        out.feedback ??
        (out.correct ? '정답입니다.' : '아까워요! 다시 시도해보세요.'),
    };
    return NextResponse.json(result satisfies EmojiQuizGradeType);
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal server error', detail: String(e) },
      { status: 500 }
    );
  }
}
