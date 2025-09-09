import { NextRequest, NextResponse } from 'next/server';

/**
 * TODO(reward-ads): 보상형 광고 콜백 일시 비활성화
 * 복구 시 아래 주석 블록의 기존 구현을 되돌리세요.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { ok: false, error: 'reward_ads_disabled' + '_' + req.url },
    { status: 410 }
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return GET(req);
}

/*
import { NextRequest, NextResponse } from 'next/server';

/**
 * Applixir RMS (Reward Management System) 콜백 엔드포인트
 *
 * 콜백 URL 파라미터:
 * - gameApiKey: Applixir API 키
 * - gameId: 게임 ID (내부적으로 사용)
 * - secretKey: 콜백 시크릿 키 (검증용)
 */
/*
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const secretKey =
      searchParams.get('secretKey') ?? searchParams.get('secret');
    const identifier =
      searchParams.get('gameId') ??
      searchParams.get('userId') ??
      searchParams.get('tid') ??
      undefined;

    // 환경 변수에서 설정값 가져오기
    const expectedSecretKey = process.env.APPLIXIR_CALLBACK_SECRET;

    // 기본 검증
    if (!secretKey) {
      console.error('Applixir callback: Missing secret');
      return NextResponse.json({ error: 'Missing secret' }, { status: 400 });
    }

    // 시크릿 키 검증
    if (secretKey !== expectedSecretKey) {
      console.error('Applixir callback: Invalid secret key');
      return NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 401 }
      );
    }

    // 로그 기록
    console.log('Applixir callback received:', {
      identifier,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip'),
      rawParams: Object.fromEntries(searchParams.entries()),
    });

    // TODO: 여기서 실제 크레딧 지급 로직 구현
    // 예시:
    // 1. gameId를 통해 사용자 식별
    // 2. 데이터베이스에서 사용자 크레딧 업데이트
    // 3. 중복 보상 방지 로직
    // 4. 일일 한도 확인

    // 현재는 로그만 기록하고 성공 응답
    return NextResponse.json(
      {
        success: true,
        message: 'Reward callback processed successfully',
        identifier,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Applixir callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST 메서드도 지원 (Applixir가 POST로 보낼 수도 있음)
export async function POST(request: NextRequest) {
  return GET(request);
}
*/
