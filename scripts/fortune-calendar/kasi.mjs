// KASI(공공데이터포털) Open API 호출 보조. 인증키는 환경변수로만 받고 출력·기록하지 않는다.
// 이 파일은 .env 파일을 읽지 않는다.

export const KEY_ENV_NAME = 'DATA_GO_KR_API_KEY';
export const KASI_BASE_URL = 'https://apis.data.go.kr/B090041/openapi/service';
/** 개발 계정 일 한도(10,000건)보다 낮게 잡은 호출 상한. 재시도 포함 */
export const KASI_CALL_BUDGET = 9000;

export class KasiError extends Error {
  constructor(message, { retryable = false } = {}) {
    super(message);
    this.name = 'KasiError';
    this.retryable = retryable;
  }
}

/** 환경변수에서 키를 읽는다. 없으면 null. 인코딩 키(%XX)는 풀어서 쓴다 */
export function readApiKey(env = process.env) {
  const raw = env[KEY_ENV_NAME];
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  const key = raw.trim();
  if (/%[0-9A-Fa-f]{2}/.test(key)) {
    try {
      return decodeURIComponent(key);
    } catch {
      return key;
    }
  }
  return key;
}

export function printMissingKeyGuide() {
  console.error(
    `환경변수 ${KEY_ENV_NAME} 가 없습니다. 공공데이터포털 인증키를 이 환경변수로 넘겨 다시 실행하세요.`
  );
  console.error(
    '키는 채팅·문서·저장소·.env 파일에 적지 않고 실행하는 셸 세션에서만 지정합니다.'
  );
}

function decodeXmlText(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** 응답 XML -> { resultCode, resultMsg, totalCount, items: [{ 필드: 문자열 }] } */
export function parseKasiXml(xml) {
  const resultCode = /<resultCode>([^<]*)<\/resultCode>/.exec(xml)?.[1]?.trim();
  if (resultCode === undefined) {
    const reason = /<returnReasonCode>([^<]*)<\/returnReasonCode>/.exec(
      xml
    )?.[1];
    const authMsg = /<returnAuthMsg>([^<]*)<\/returnAuthMsg>/.exec(xml)?.[1];
    if (reason !== undefined || authMsg !== undefined) {
      throw new KasiError(
        `API 인증·호출 오류(코드 ${reason?.trim() ?? '?'}, ${authMsg?.trim() ?? '메시지 없음'})`
      );
    }
    throw new KasiError('응답 형식을 알 수 없습니다.', { retryable: true });
  }
  const resultMsg =
    /<resultMsg>([^<]*)<\/resultMsg>/.exec(xml)?.[1]?.trim() ?? '';
  if (resultCode !== '00') {
    throw new KasiError(`API 오류 코드 ${resultCode}: ${resultMsg}`);
  }
  const totalCount = Number(
    /<totalCount>([^<]*)<\/totalCount>/.exec(xml)?.[1] ?? 0
  );
  const items = [];
  for (const itemMatch of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const item = {};
    for (const fieldMatch of itemMatch[1].matchAll(
      /<([A-Za-z0-9_]+)>([^<]*)<\/\1>/g
    )) {
      item[fieldMatch[1]] = decodeXmlText(fieldMatch[2]);
    }
    items.push(item);
  }
  return { resultCode, resultMsg, totalCount, items };
}

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 호출 사이에 지연을 두고, 일시 오류(네트워크·5xx·429·알 수 없는 응답)는 재시도한다.
 * 키·요청 URL은 오류 메시지에 넣지 않는다.
 */
export function createKasiClient({
  key,
  fetchImpl = globalThis.fetch,
  delayMs = 150,
  maxAttempts = 4,
  retryBaseMs = 1000,
  timeoutMs = 20000,
  callBudget = KASI_CALL_BUDGET,
  sleep = defaultSleep,
}) {
  let callCount = 0;

  const scrub = (text) => {
    let result = String(text);
    for (const secret of [key, encodeURIComponent(key)]) {
      if (secret) result = result.split(secret).join('***');
    }
    return result;
  };

  async function request(service, operation, params) {
    const label = `${service}/${operation} ${JSON.stringify(params)}`;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      if (callCount >= callBudget) {
        throw new KasiError(
          `호출 횟수가 상한(${callBudget}회)에 도달해 중단합니다.`
        );
      }
      callCount += 1;
      try {
        await sleep(delayMs);
        const url = new URL(`${KASI_BASE_URL}/${service}/${operation}`);
        url.searchParams.set('ServiceKey', key);
        for (const [name, value] of Object.entries(params)) {
          url.searchParams.set(name, String(value));
        }
        const response = await fetchImpl(url, {
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok) {
          throw new KasiError(`HTTP ${response.status}`, {
            retryable: response.status >= 500 || response.status === 429,
          });
        }
        return parseKasiXml(await response.text());
      } catch (error) {
        const retryable = error instanceof KasiError ? error.retryable : true;
        if (!retryable || attempt === maxAttempts) {
          const reason =
            error instanceof KasiError
              ? error.message
              : `네트워크 오류(${error?.cause?.code ?? error?.name ?? 'unknown'})`;
          throw new KasiError(scrub(`${label} 실패: ${reason}`));
        }
        await sleep(retryBaseMs * 2 ** (attempt - 1));
      }
    }
    throw new KasiError(`${label} 실패`);
  }

  return {
    request,
    get callCount() {
      return callCount;
    },
  };
}
