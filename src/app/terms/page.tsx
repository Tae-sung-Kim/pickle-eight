import type { Metadata } from 'next';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';

const baseMeta = buildMetadata({
  title: `이용약관 - ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
  description: '서비스 이용 조건, 권리와 의무, 책임 제한 등 약관을 확인하세요.',
  pathname: '/terms',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        `이용약관 - ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
        '서비스 이용 조건, 권리와 의무, 책임 제한 등 약관을 확인하세요.',
        '이용약관'
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        `이용약관 - ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
        '서비스 이용 조건, 권리와 의무, 책임 제한 등 약관을 확인하세요.',
        '이용약관'
      ),
    ],
  },
};

export default function TermsPage() {
  const EFFECTIVE_DATE = '2026-10-29' as const;
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
            본 서비스는 로또 관련 정보 조회, 통계/분석, 번호 생성, 번호 저장 및
            당첨 확인 등 오락적 기능을 제공합니다. 본 서비스는 정보 제공
            목적이며, 당첨 또는 수익을 보장하지 않습니다. 본 서비스의 정보 및
            번호 생성 결과는 투자·재정·법률 자문이 아닙니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            2. 연령 및 책임 있는 이용
          </h2>
          <p>
            대한민국 법령에 따라 만 19세 미만의 복권 구매/참여는 금지됩니다. 본
            서비스는 로또 관련 기능에 대해 연령 확인 절차를 제공하며, 이용자는
            관련 법령 및 약관을 준수해야 합니다. 과도한 구매/베팅을 지양하고
            책임 있게 이용하시기 바랍니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            3. 데이터 출처 및 정확성
          </h2>
          <p>
            로또 회차/당첨 결과 데이터는 동행복권 등 공개된 출처의 정보를
            기반으로 서버 측 스케줄 잡(크론)을 통해 주기적으로 수집·검증한 뒤
            내부 데이터베이스(Supabase)에 저장됩니다. 클라이언트는 외부 제공처에
            직접 요청하지 않고 내부 API를 통해서만 조회합니다. 수집은 각 출처의
            이용약관과 호출 제한을 준수하는 범위에서 이루어지며, 과도한 트래픽을
            피하기 위해 주기적 동기화와 내부 캐시/DB를 사용합니다.
          </p>
          <p className="mt-2">
            데이터는 변경/지연/오류가 있을 수 있으며, 정확성·적시성·완전성은
            보장되지 않습니다. 실제 결과와 차이가 있을 수 있으므로 원 출처의
            최신 정보를 확인해야 합니다. 출처의 변경/중단/지연은 당사가 통제할
            수 없습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">4. 비제휴·비보증 고지</h2>
          <p>
            본 서비스는 정부기관/공공기관/복권 운영사 등과 제휴·후원·승인을 받은
            공식 서비스가 아닙니다. 표기된 상표·로고·명칭은 각 소유자의
            자산이며, 식별·설명 목적으로만 사용합니다. 해당 정보의 권리는 각
            소유자에게 귀속됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            5. 나의 번호 등 저장 데이터
          </h2>
          <p>
            이용자가 저장한 번호와 설정은 서버로 전송되지 않고 이용자의 브라우저
            저장소(localStorage)에만 보관됩니다. 브라우저 데이터를 삭제하거나
            다른 기기/브라우저로 접속하면 저장한 번호를 볼 수 없으며, 당사는
            이를 복구할 수 없습니다. 저장한 번호는 저장 시점을 기준으로 아직
            추첨되지 않은 회차(판매 마감 이후에는 다음 회차)부터 당첨 결과와
            비교되며, 표시되는 결과는 참고용입니다. 실제 당첨 여부와 당첨금
            수령은 공식 판매처의 확인을 따라야 합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">6. 광고 및 쿠키</h2>
          <p>
            서비스에는 광고(예: 카카오 애드핏)가 게재될 수 있으며, 광고 이용은
            자발적이어야 합니다. 핵심 기능 접근을 광고 시청으로 강제하지
            않습니다. 광고 등 비필수 기능은 이용자의 동의가 있는 경우에만
            실행되며, 자세한 내용은 개인정보처리방침을 따릅니다. 광고에 포함된
            제3자의 쿠키/정책이 적용될 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">7. 금지 행위</h2>
          <p>
            다음 행위는 금지됩니다: 불법적 이용, 자동화된 과도한 요청/스크래핑,
            서비스 방해, 저작권/상표권 침해, 타인의 개인정보 침해 등.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">8. 지식재산권</h2>
          <p>
            서비스 및 제공되는 콘텐츠의 권리는 각 권리자에게 귀속됩니다. 별도
            허락 없는 복제/배포/2차적 저작물 작성은 금지됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            9. 책임 제한 및 제3자 서비스
          </h2>
          <p>
            본 서비스 이용으로 인한 손실(직접/간접/부수적 손해 포함)에 대해
            당사는 법이 허용하는 범위 내에서 책임을 부담하지 않으며, 모든 결정과
            책임은 이용자에게 있습니다. 호스팅(Vercel), 데이터베이스(Supabase),
            광고 네트워크 등 제3자 서비스의 장애·변경으로 인한 손해에 대해서도
            법이 허용하는 범위 내에서 책임을 지지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">10. 면책 및 보상</h2>
          <p>
            이용자가 약관 위반 또는 불법행위로 인해 제3자와의 분쟁·청구가 발생한
            경우, 이용자는 당사에 발생한 합리적 손해와 비용(변호사 비용 포함)을
            배상해야 할 수 있습니다. 이는 법령이 허용하는 범위 내에서
            적용됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            11. 서비스 변경 및 중단
          </h2>
          <p>
            당사는 서비스의 전부 또는 일부를 변경·중단할 수 있습니다. 필요 시
            사전 공지하며, 불가피한 경우 사후 공지될 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">12. 약관 변경</h2>
          <p>
            본 약관은 사전 고지 후 변경될 수 있습니다. 변경 후에도 서비스를 계속
            이용하면 변경 사항에 동의한 것으로 간주됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            13. 준거법 및 분쟁 해결
          </h2>
          <p>
            본 약관은 대한민국 법률에 따릅니다. 분쟁은 관할 법원에서 해결합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">14. 분리가능성</h2>
          <p>
            본 약관의 일부 조항이 무효·집행 불능으로 판단되더라도, 나머지 조항의
            유효성에는 영향을 미치지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">15. 문의</h2>
          <p className="break-all">문의: contact.tskim@gmail.com</p>
          <p>
            텔레그램:{' '}
            <a
              href="https://t.me/PickleEight"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {process.env.NEXT_PUBLIC_SITE_NAME}
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
