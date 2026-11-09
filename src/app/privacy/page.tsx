import type { Metadata } from 'next';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import {
  buildMetadata,
  canonicalUrl,
  generateOgImageUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';

const baseMeta = buildMetadata({
  title: '개인정보처리방침',
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
        `개인정보처리방침 - ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
        '이용자의 개인정보 보호 원칙과 수집·이용·보관·파기 정책을 안내합니다.',
        '개인정보처리방침'
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        `개인정보처리방침 - ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
        '이용자의 개인정보 보호 원칙과 수집·이용·보관·파기 정책을 안내합니다.',
        '개인정보처리방침'
      ),
    ],
  },
};

export default function PrivacyPolicyPage() {
  const EFFECTIVE_DATE = '2026-11-09' as const;
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
          <h2 className="font-medium text-foreground">1. 수집 항목 및 방법</h2>
          <p>
            본 서비스는 회원가입/로그인이 없으며, 이름·연락처 등 개인정보를
            이용자로부터 직접 입력받지 않습니다. 서비스 이용 과정에서 다음
            정보가 자동으로 처리될 수 있습니다.
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              접속 정보: IP 주소, 브라우저/기기 정보, 접속 시각 등 (호스팅
              제공사의 서버 접속 로그)
            </li>
            <li>
              오류·보안 보고: 브라우저가 전송하는 보안 정책(CSP) 위반 보고. 서버
              로그에만 기록됩니다.
            </li>
            <li>
              광고 정보: 광고에 동의한 경우에 한해 광고 사업자가 광고 식별자,
              쿠키, 리퍼러 등을 수집할 수 있습니다.
            </li>
          </ul>
          <p className="mt-2">
            법령상 요구되거나 서비스 제공에 필요한 경우를 제외하고 민감정보는
            수집하지 않습니다. 로또 회차·당첨 번호 등 공개 결과 데이터는 개인
            식별 정보가 없는 공공성 정보로, 서버 측 스케줄 잡(크론)이 주기적으로
            수집·검증해 내부 데이터베이스(Supabase)에 저장하며, 이용자 정보와
            연결되지 않습니다.
          </p>
          <p className="mt-2">
            타로 서비스에서 입력한 질문은 서버로 전송하거나 저장하지 않습니다.
            입력한 질문은 카드 선택과 해석에 쓰이지 않으며, 위기 안내가 필요한지
            확인하는 데만 이 기기에서 쓰입니다. 선택한 분야와 3장 타로 결과도
            저장하지 않습니다.
          </p>
          <p className="mt-2">
            운세 서비스에서 입력한 생년월일과 태어난 시각은 서버로 전송하거나
            저장하지 않으며, 이용자의 브라우저 메모리에서만 사용합니다. 페이지를
            벗어나거나 새로고침하면 사라집니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            2. 브라우저 저장소 사용
          </h2>
          <p>
            본 서비스는 쿠키를 직접 설정하지 않으며, 아래 항목을 이용자의
            브라우저 저장소에 보관합니다. 이 정보는 서버로 전송되지 않고
            이용자의 기기에만 남습니다.
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>쿠키 동의 선택 상태 (localStorage)</li>
            <li>
              나의 번호: 이용자가 저장한 번호와 라벨, 즐겨찾기 (localStorage)
            </li>
            <li>
              오늘의 타로: 날짜·카드 번호·정/역방향만 이 기기(localStorage)에
              저장합니다. 저장된 값은 다음 날 방문 시 자동으로 삭제되며,
              브라우저 설정에서도 삭제할 수 있습니다.
            </li>
            <li>연령 확인 여부 (sessionStorage, 탭을 닫으면 삭제)</li>
            <li>
              운세 이용 동의: 동의 여부, 동의한 안내문 버전, 동의 시각만 이
              탭(sessionStorage)에 저장하며 탭을 닫으면 삭제됩니다. 생년월일은
              저장하지 않습니다.
            </li>
            <li>화면 표시 속도를 위한 임시 캐시 (localStorage)</li>
          </ul>
          <p className="mt-2">
            브라우저 설정에서 사이트 데이터를 삭제하면 위 정보가 모두 지워지며,
            삭제된 나의 번호는 복구할 수 없습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">3. 이용 목적</h2>
          <p>
            서비스 제공 및 운영, 오류 분석, 보안/부정 이용 방지, 광고
            게재(동의한 경우), 법적 의무 이행을 위해 활용됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">4. 처리의 법적 근거</h2>
          <p>
            (1) 이용자 동의(광고 등 비필수 기능), (2) 법적 의무의 준수, (3)
            정당한 이익(서비스 보안, 오류 분석). 광고 등 비필수 목적은 이용자의
            사전 동의가 있는 경우에만 실행됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">5. 보관 기간 및 파기</h2>
          <p>
            서버 접속 로그 등은 수집 목적이 달성되면 지체 없이 파기하며, 관련
            법령이 정한 보관 기간이 있는 경우 그 기간 동안 보관합니다. 전자적
            파일은 복구할 수 없는 방법으로 삭제합니다. 브라우저 저장소의 정보는
            이용자의 기기에 있으므로 이용자가 직접 삭제할 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            6. 외부 서비스 이용 및 처리위탁
          </h2>
          <p>서비스 운영을 위해 다음 외부 서비스를 이용합니다.</p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              Vercel: 웹 호스팅 및 서버 접속 로그 처리. 국외(미국 등)에서 처리될
              수 있습니다.
            </li>
            <li>
              Supabase: 데이터베이스. 공개된 로또 당첨 결과와 통계 데이터만
              저장하며 이용자 개인정보는 저장하지 않습니다. 국외에서 처리될 수
              있습니다.
            </li>
            <li>
              카카오 애드핏: 광고 게재. 쿠키 동의 시에만 광고 스크립트를
              불러옵니다.
            </li>
            <li>
              jsDelivr(CDN): 웹폰트 제공. 폰트를 불러올 때 이용자의 IP 주소 등이
              CDN 사업자에게 전달될 수 있으며, 쿠키 동의 여부와 관계없이
              불러옵니다.
            </li>
          </ul>
          <p className="mt-2">
            각 사업자의 정책이 함께 적용되며, 이용자의 개인정보를 위 목적 외로
            제3자에게 판매하거나 제공하지 않습니다.
          </p>
        </section>
        <section>
          <h2 id="cookies-consent" className="font-medium text-foreground">
            7. 쿠키 및 동의 관리
          </h2>
          <p>
            비필수(광고 등) 쿠키와 관련 스크립트는 이용자의 사전 동의가 있는
            경우에만 활성화되며, 동의 거부 시 광고 스크립트는 불러오지 않습니다.
            동의는 서비스 내 &quot;쿠키 설정&quot; 배너 또는 푸터의 설정 버튼을
            통해 언제든지 변경·철회할 수 있습니다. 브라우저 설정으로도 쿠키를
            차단할 수 있으나 일부 기능이 제한될 수 있습니다. 광고 사업자가
            설정하는 쿠키에는 해당 사업자의 정책이 적용됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            8. 이용자 권리 및 행사 방법
          </h2>
          <p>
            이용자는 개인정보 열람/정정/삭제/처리정지 및 동의 철회를 요청할 수
            있으며, 본인 확인 후 원칙적으로 30일 이내 처리합니다. 서비스는
            이용자를 식별하는 정보를 서버에 저장하지 않으므로 대부분의 정보는
            이용자가 브라우저에서 직접 삭제할 수 있습니다. 법령상 예외 또는
            기술적 제한이 있는 경우 지연·불가 사유를 안내합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">9. 보안 조치</h2>
          <p>
            암호화 전송(HTTPS), 접근 통제, 최소 권한 원칙 등 합리적 보호 조치를
            적용합니다. 다만 인터넷 환경 특성상 완전한 보안은 보장되지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">10. 어린이의 개인정보</h2>
          <p>
            본 서비스는 어린이를 주된 대상으로 제공하지 않습니다. 운세 서비스는
            만 14세 이상이 이용할 수 있으며, 로또 등 연령 제한이 있는 기능은 각
            기능의 안내를 따릅니다. 로또 관련 기능은 만 19세 이상에게만 제공되며
            연령 확인 절차를 통해 접근이 제한됩니다. 법정 대리인의 동의 없이
            어린이의 개인정보가 수집된 것으로 확인되면 지체 없이 삭제 조치를
            취합니다.
          </p>
          <p className="mt-2">
            운세 서비스는 만 14세 이상 이용자를 대상으로 합니다. 이용 전 만 14세
            이상인지 확인하는 절차를 거치며, 생년월일을 입력하면 이용자의
            브라우저 안에서 만 나이를 한 번 더 확인합니다. 이 확인에 쓴
            생년월일과 확인 결과는 저장하지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            11. 개인정보 보호책임자 및 문의
          </h2>
          <p>개인정보 보호책임자: 서비스 운영자</p>
          <p className="break-all">문의: contact.tskim@gmail.com</p>
          <p>
            텔레그램:{' '}
            <a
              href="https://t.me/PickleEight"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              {process.env.NEXT_PUBLIC_SITE_NAME}
            </a>
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">12. 방침 변경</h2>
          <p>
            본 방침은 서비스 개선 또는 법령 변경에 따라 갱신될 수 있으며, 중요
            변경 시 공지합니다.
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
