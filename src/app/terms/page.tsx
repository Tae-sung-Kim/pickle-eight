import { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';
import { JsonLdComponent } from '@/components';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib';

const baseMeta = buildMetadata({
  title: '이용약관 - Pickle Eight',
  description: '서비스 이용 조건, 권리와 의무, 책임 제한 등 약관을 확인하세요.',
  pathname: '/terms',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '이용약관 - Pickle Eight',
        '서비스 이용 조건, 권리와 의무, 책임 제한 등 약관을 확인하세요.',
        '이용약관'
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '이용약관 - Pickle Eight',
        '서비스 이용 조건, 권리와 의무, 책임 제한 등 약관을 확인하세요.',
        '이용약관'
      ),
    ],
  },
};

export default function TermsPage() {
  const EFFECTIVE_DATE = '2025-08-18' as const;
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '이용약관', item: canonicalUrl('/terms') },
  ]);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <h1 className="text-2xl font-semibold">이용약관</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        시행일: {EFFECTIVE_DATE}
      </p>
      <div className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
        <section>
          <h2 className="font-medium text-foreground">1. 서비스 개요</h2>
          <p>
            본 서비스는 로또 관련 정보 조회, 통계/분석, 번호 생성 등 오락적
            기능을 제공합니다. 본 서비스는 정보 제공 목적이며, 당첨 또는 수익을
            보장하지 않습니다. 본 서비스의 정보 및 번호 생성 결과는
            투자·재정·법률 자문이 아니며, 과도한 구매/베팅을 지양하고 책임 있는
            이용을 권장합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">2. 연령 및 준수</h2>
          <p>
            대한민국 법령에 따라 만 19세 미만의 복권 구매/참여는 금지됩니다.
            이용자는 관련 법령 및 약관을 준수해야 합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            3. 데이터 출처 및 정확성
          </h2>
          <p>
            데이터는 공개 정보를 기반으로 제공되며, 변경/지연/오류가 있을 수
            있습니다. 실제 결과와 차이가 발생할 수 있으며, 데이터의
            정확성·적시성·완전성은 보장되지 않습니다. 로또 회차/당첨 결과
            데이터는 서버 측 스케줄 잡(크론)을 통해 수집·검증 후 내부
            데이터베이스(Firestore)에 저장되며, 클라이언트는 외부 제공처로 직접
            호출하지 않고 내부 API를 통해서만 조회합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">4. 책임 제한</h2>
          <p>
            본 서비스 이용으로 인한 손실(직접/간접/부수적 손해 포함)에 대해
            당사는 법이 허용하는 범위 내에서 책임을 부담하지 않습니다. 모든
            결정과 책임은 이용자에게 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">5. 광고 및 제휴</h2>
          <p>
            본 서비스에는 광고 또는 제휴 링크가 포함될 수 있습니다. 광고 이용은
            자발적이어야 하며, 광고 네트워크 정책을 준수합니다. 제휴 링크 이용
            시 제3자의 쿠키/정책이 적용될 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">6. 금지 행위</h2>
          <p>
            다음 행위는 금지됩니다: 불법적 이용, 자동화된 과도한 요청/스크래핑,
            서비스 방해, 저작권/상표권 침해, 타인의 개인정보 침해 등.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">7. 지식재산권</h2>
          <p>
            서비스 및 제공되는 콘텐츠의 권리는 각 권리자에게 귀속됩니다. 별도
            허락 없는 복제/배포/2차적 저작물 작성은 금지됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            8. 서비스 변경 및 중단
          </h2>
          <p>
            당사는 서비스의 전부 또는 일부를 변경·중단할 수 있습니다. 필요 시
            사전 공지하며, 불가피한 경우 사후 공지될 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">9. 약관 변경</h2>
          <p>
            본 약관은 사전 고지 후 변경될 수 있습니다. 변경 후에도 서비스를 계속
            이용하면 변경 사항에 동의한 것으로 간주됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            10. 준거법 및 분쟁 해결
          </h2>
          <p>
            본 약관은 대한민국 법률에 따릅니다. 분쟁은 관할 법원에서 해결합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            11. 데이터 출처 및 API 사용
          </h2>
          <p>
            본 서비스는 공공 웹사이트/공개 API 등 외부 데이터 소스를 참조할 수
            있습니다. 데이터 호출은 각 소스의 이용약관·로봇 배제 정책·호출
            제한(Rate Limit)을 준수하며, 상업적 이용 가능 범위를 확인하여
            운영합니다. 당사는 데이터 출처의 변경/중단/지연에 대해 통제하지
            않으며, 필요한 경우 캐싱/백오프/요청 제한을 적용합니다.
          </p>
          <p className="mt-2">
            특정 소스(예: 동행복권 웹사이트/공개 인터페이스)를 통해 제공되는
            정보는 해당 소유者の 권리에 귀속됩니다. 당사는 비제휴·비공식 정보를
            안내 목적으로 표기하며, 이용자는 원 출처의 최신 정보와 약관을
            확인해야 합니다. 본 서비스는 서버 측에서만 외부 데이터를 수집하며
            클라이언트에서 직접 스크래핑/호출을 수행하지 않습니다. 과도한 트래픽
            유발을 피하기 위해 주기적 동기화 및 내부 캐시/DB를 사용합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            12. 비제휴·비보증 고지
          </h2>
          <p>
            본 서비스는 정부기관/공공기관/복권 운영사 등과 제휴·후원·승인을 받은
            공식 서비스가 아닙니다. 표기된 상표·로고·명칭은 각 소유자의
            자산이며, 식별·설명 목적의 사용입니다. 제3자 데이터/서비스의
            정확성·가용성·지속성에 대해 당사는 보증하지 않습니다. 타인의
            상표·로고·디자인을 혼동을 초래할 방식으로 사용하지 않으며, 출처
            표기를 통해 비제휴 사실을 명확히 합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            13. 광고·수익화 및 쿠키
          </h2>
          <p>
            서비스는 광고(배너/네이티브/제휴 링크 등)를 게재할 수 있으며, 광고는
            자발적 이용을 전제로 합니다. 핵심 기능 접근을 광고 시청으로 강제하지
            않습니다. 광고/개인화·분석 등 비필수 기능은 이용자의 동의에 따라
            실행되며, 자세한 내용은 개인정보처리방침을 따릅니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            14. 상업적 이용 및 수익화
          </h2>
          <p>
            본 서비스는 광고 게재, 제휴(파트너스 링크 포함), 후원 등을 통해
            상업적으로 운영될 수 있습니다. 광고·제휴는 자발적 이용을 전제로
            하며, 핵심 기능 접근을 광고 시청으로 강제하지 않습니다. 광고/분석 등
            비필수 기능은 이용자의 동의가 있는 경우에만 실행됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            15. 연령 제한 및 책임 있는 이용
          </h2>
          <p>
            본 서비스는 성인 대상 기능에 대해 연령 확인 및 동의 배너를
            제공합니다 (2. 연령 및 준수 참조). 과도한 이용을 지양하고 책임 있는
            사용을 권장합니다. 자세한 면책은 4. 책임 제한을 참조하세요.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            16. 제3자 서비스 장애 및 면책
          </h2>
          <p>
            호스팅, 분석, 광고, 결제/제휴 등 제3자 서비스(예: Firebase, Vercel,
            광고·제휴 네트워크)의 장애·변경으로 인한 손해에 대하여 당사는 법이
            허용하는 범위 내에서 책임을 지지 않습니다. 이용자는 제3자 정책을
            함께 준수해야 합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">17. 후원/기부 정책</h2>
          <p>
            후원은 전적으로 선택 사항이며, 서비스 핵심 기능 이용과 독립적입니다.
            후원/결제 기능을 도입하는 경우 결제 대행사 정책을 준수하며, 관련
            고지(수집 항목, 목적, 보관 기간 등)를 별도로 제공합니다. 후원 여부가
            서비스 품질·결과에 영향을 미치지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">18. 면책 및 보상</h2>
          <p>
            이용자가 약관 위반 또는 불법행위로 인해 제3자와의 분쟁·청구가 발생한
            경우, 이용자는 당사에 발생한 합리적 손해와 비용(변호사 비용 포함)을
            배상해야 할 수 있습니다. 이는 법령이 허용하는 범위 내에서
            적용됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">19. 분리가능성</h2>
          <p>
            본 약관의 일부 조항이 무효·집행 불능으로 판단되더라도, 나머지 조항의
            유효성에는 영향을 미치지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            20. 크레딧 정책 및 부정 이용
          </h2>
          <p>
            서비스 내 크레딧의 획득·사용은 별도의{' '}
            <a href="/credits-policy" className="underline">
              크레딧 정책
            </a>
            을 따릅니다. 보상은 광고 가시성, 노출 시간, 쿨다운 등 요건 충족
            시에만 지급됩니다.
          </p>
          <p className="mt-2">
            자동화 도구 사용, 비정상 트래픽 생성, 가시성 요건 우회 등 부정
            행위가 확인될 경우 보상 취소·회수, 이용 제한 등의 조치가 적용될 수
            있습니다. 관련 데이터 처리 및 동의에 관한 사항은{' '}
            <a href="/privacy" className="underline">
              개인정보처리방침
            </a>
            을 참조하세요.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">21. 문의</h2>
          <p className="break-all">문의: contact.tskim@gmail.com</p>
          <p>
            텔레그램:{' '}
            <a
              href="https://t.me/PickleEight"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              PickleEight
            </a>
          </p>
        </section>

        <p className="text-xs">
          [알림] 본 문서는 일반 정보 제공이며 법률 자문이 아닙니다. 사업 특성에
          맞춰 법률 검토를 권장합니다.
        </p>
      </div>
    </div>
  );
}
