import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';
import { Metadata } from 'next';

const baseMeta = buildMetadata({
  title: '개인정보처리방침 - ' + (process.env.NEXT_PUBLIC_SITE_NAME as string),
  description:
    '이용자의 개인정보 보호 원칙과 수집·이용·보관·파기 정책을 안내합니다.',
  pathname: '/privacy',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '개인정보처리방침 - ' + (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '이용자의 개인정보 보호 원칙과 수집·이용·보관·파기 정책을 안내합니다.',
        '개인정보처리방침'
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '개인정보처리방침 - ' + (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '이용자의 개인정보 보호 원칙과 수집·이용·보관·파기 정책을 안내합니다.',
        '개인정보처리방침'
      ),
    ],
  },
};

export function PrivacyPolicyPage() {
  const EFFECTIVE_DATE = '2025-08-18' as const;
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '개인정보처리방침', item: canonicalUrl('/privacy') },
  ]);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <h1 className="text-2xl font-semibold">개인정보처리방침</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        시행일: {EFFECTIVE_DATE}
      </p>
      <div className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
        <section>
          <h2 className="font-medium text-foreground">1. 수집 항목</h2>
          <p>
            서비스 이용 과정에서 다음 정보가 수집될 수 있습니다: 기기/브라우저
            정보, 접속 로그, 이용 이벤트, 오류 로그, 쿠키/유사 기술 식별자.
            법령상 요구되거나 서비스 제공에 필요한 경우를 제외하고 민감정보는
            수집하지 않습니다. 로또 회차·당첨 번호 등 공개 결과 데이터는 개인
            식별 정보가 포함되지 않은 공공성 정보로서 별도 저장될 수 있으며,
            이용자 계정 정보와 직접 연결되지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">2. 수집 방법</h2>
          <p>
            웹/앱 상호작용을 통한 자동 수집, 이용자 입력, 분석/광고
            도구(SDK/스크립트) 연동을 통해 수집됩니다. 로또 공개 결과 데이터는
            서버 측 스케줄 잡(크론)에 의해 주기적으로 수집·검증 후 내부
            데이터베이스(Firestore)에 저장되며, 클라이언트는 외부 제공처에 직접
            요청하지 않고 내부 API를 통해서만 조회합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">3. 이용 목적</h2>
          <p>
            서비스 제공 및 운영, 품질 개선, 오류 분석, 통계/이용 행태 분석,
            맞춤형 콘텐츠/광고 제공, 보안/부정 이용 방지, 법적 의무 이행을 위해
            활용됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">4. 보관 기간</h2>
          <p>
            목적 달성 시 지체 없이 파기하며, 관련 법령이 정한 기간 동안 보관할
            수 있습니다. 보관 기간은 도구 제공사의 정책 및 내부 정책에 따릅니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            5. 제3자 제공 및 처리위탁
          </h2>
          <p>
            분석/광고/호스팅 파트너에게 비식별 또는 가명처리된 정보가 제공되거나
            처리 위탁될 수 있습니다. 제3자의 정책이 함께 적용될 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">6. 쿠키, 분석 및 광고</h2>
          <p>
            서비스는 쿠키/로컬스토리지/유사 기술을 사용하며, Firebase Analytics
            등 분석 도구와 광고 네트워크(예: AdFit, AdSense, 제휴 링크)를 사용할
            수 있습니다. 브라우저 설정에서 쿠키를 차단할 수 있으나 일부 기능이
            제한될 수 있습니다. 로또 데이터 조회는 비필수 스크립트와 무관하게
            서버 측 캐시/DB를 통해 제공되며, 이용자 브라우저에서 제3자(로또
            제공처)로 직접 호출이 이루어지지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">7. 이용자 권리</h2>
          <p>
            이용자는 개인정보 열람/정정/삭제/처리정지 등을 요청할 수 있습니다.
            법령에 따른 예외가 있을 수 있으며, 신원 확인이 필요할 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">8. 국제 이전</h2>
          <p>
            클라우드 서비스/분석 도구 사용으로 인해 정보가 국외로 이전될 수
            있습니다. 해당 국가의 관련 법령 및 적절한 보호조치를 준수합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">9. 보안 조치</h2>
          <p>
            접근 통제, 암호화 전송, 최소 권한, 로그 모니터링 등 합리적 보호
            조치를 적용합니다. 다만 인터넷 환경 특성상 완전한 보안은 보장되지
            않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">10. 어린이의 개인정보</h2>
          <p>
            본 서비스는 전반적으로 어린이를 대상으로 제공되지 않습니다. 특히
            연령 제한 기능(예: 로또 관련 기능)은 만 19세 이상에게만 제공되며,
            연령 확인 절차(예: 성인 확인 모달 등)를 통해 접근이 제한됩니다. 다만
            일반적인 게임/랜덤 추첨 등 비연령제한 기능은 관련 법령이 허용하는
            범위 내에서 이용할 수 있습니다. 법정 대리인의 동의 없이 어린이의
            개인정보가 수집된 것으로 확인되면 지체 없이 삭제 조치를 취합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">11. 방침 변경</h2>
          <p>
            본 방침은 서비스 개선 또는 법령 변경에 따라 갱신될 수 있으며, 중요
            변경 시 공지합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">12. 처리의 법적 근거</h2>
          <p>
            개인정보 처리는 다음 법적 근거에 따라 이루어집니다: (1) 이용자 동의,
            (2) 계약의 체결 및 이행을 위한 필요, (3) 법적 의무의 준수, (4)
            정당한 이익(서비스 보안, 품질 개선, 통계 분석 등). 개인화 광고/분석
            등 비필수 목적은 이용자의 사전 동의가 있는 경우에만 실행됩니다.
          </p>
        </section>
        <section>
          <h2 id="cookies-consent" className="font-medium text-foreground">
            13. 쿠키 및 동의 관리
          </h2>
          <p>
            서비스는 필수/기능/분석/광고 범주의 쿠키·유사 기술을 사용할 수
            있습니다. 비필수(기능/분석/광고) 쿠키와 관련 스크립트는 이용자의
            사전 동의가 있는 경우에만 활성화되며, 동의 거부 시 비필수 쿠키는
            저장·수집·전송되지 않습니다. 동의는 서비스 내 &quot;쿠키 설정&quot;
            배너 또는 푸터의 설정 버튼을 통해 언제든지 변경·철회할 수 있습니다.
            브라우저 설정으로도 쿠키를 차단할 수 있으나 일부 기능이 제한될 수
            있습니다. 일부 제3자(분석/광고/제휴)의 쿠키에는 해당 제공업체의
            정책이 함께 적용됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            14. 권리 행사 방법 및 기한
          </h2>
          <p>
            이용자는 열람/정정/삭제/처리정지/동의철회를 요청할 수 있으며, 본인
            확인 후 원칙적으로 30일 이내 처리합니다. 단, 법령상 예외 또는 기술적
            제한이 있는 경우 지연·불가 사유를 안내합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">15. 후원 및 제휴 처리</h2>
          <p>
            후원은 전적으로 선택 사항이며, 서비스 핵심 기능 이용과 무관합니다.
            후원/결제가 도입되는 경우 결제 대행사 등 필요한 범위 내에서
            개인정보가 처리·제공될 수 있으며, 수집 항목과 목적, 보관 기간을 별도
            고지합니다. 제휴 링크 이용 시 제3자의 추적 파라미터/쿠키가 적용될 수
            있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            16. 광고 식별자 및 추적 정보
          </h2>
          <p>
            광고 노출/성과 측정을 위해 광고 ID, 리퍼러, 캠페인 파라미터 등이
            수집될 수 있습니다. 개인화 광고는 동의 기반으로만 집행되며, 동의
            거부 시 비개인화 광고 또는 광고 미표시가 적용될 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">17. 크레딧 관련 처리</h2>
          <p>
            크레딧 보상·소비 운영을 위해 광고 가시성·노출 시간, 보상/쿨다운
            이벤트, 버튼 클릭 등 서비스 이용 이벤트가 처리될 수 있습니다. 개인화
            광고·분석 등 비필수 목적은 이용자의 사전 동의 시에만 실행되며, 동의
            거부 시 관련 쿠키/스크립트는 저장·수집·전송되지 않습니다.
          </p>
          <p className="mt-2">
            데이터 보관 기간과 보호조치는 본 방침과 도구 제공사 정책을 따릅니다.
            상세한 크레딧 운영 기준은{' '}
            <a href="/credits-policy" className="underline">
              크레딧 정책
            </a>
            에서 확인할 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">18. 문의</h2>
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
          [알림] 본 문서는 일반 정보 제공이며 법률 자문이 아닙니다.
          서비스/비즈니스에 맞춘 법률 검토를 권장합니다.
        </p>
      </div>
    </div>
  );
}
