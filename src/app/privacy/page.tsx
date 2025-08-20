import { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';

export const metadata: Metadata = {
  title: '개인정보처리방침 - Pickle Eight',
  description:
    '이용자의 개인정보 보호 원칙과 수집·이용·보관·파기 정책을 안내합니다.',
  keywords: ['개인정보처리방침', '개인정보', '보안', '정책', 'pickle eight'],
  openGraph: {
    title: '개인정보처리방침 - Pickle Eight',
    description:
      '이용자의 개인정보 보호 원칙과 수집·이용·보관·파기 정책을 안내합니다.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/privacy',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '개인정보처리방침 - Pickle Eight',
        '이용자의 개인정보 보호 원칙과 수집·이용·보관·파기 정책을 안내합니다.',
        '개인정보처리방침'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '개인정보처리방침 - Pickle Eight',
    description:
      '이용자의 개인정보 보호 원칙과 수집·이용·보관·파기 정책을 안내합니다.',
    images: [
      generateOgImageUrl(
        '개인정보처리방침 - Pickle Eight',
        '이용자의 개인정보 보호 원칙과 수집·이용·보관·파기 정책을 안내합니다.',
        '개인정보처리방침'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  const EFFECTIVE_DATE = '2025-08-18' as const;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
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
            수집하지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">2. 수집 방법</h2>
          <p>
            웹/앱 상호작용을 통한 자동 수집, 이용자 입력, 분석/광고
            도구(SDK/스크립트) 연동을 통해 수집됩니다.
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
            제한될 수 있습니다.
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
            서비스는 어린이를 대상으로 하지 않습니다. 법정 대리인의 동의 없이
            어린이 정보가 수집된 것으로 확인되면 지체 없이 삭제합니다.
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
          <h2 className="font-medium text-foreground">12. 문의</h2>
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
          [알림] 본 문서는 일반 정보 제공이며 법률 자문이 아닙니다.
          서비스/비즈니스에 맞춘 법률 검토를 권장합니다.
        </p>
      </div>
    </div>
  );
}
