import type { Metadata } from 'next';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import {
  FORTUNE_MAX_BIRTH,
  FORTUNE_MIN_BIRTH,
} from '@/features/fortune/constants/fortune-input.constant';
import {
  buildMetadata,
  canonicalUrl,
  generateOgImageUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';

const baseMeta = buildMetadata({
  title: '이용약관',
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
  const EFFECTIVE_DATE = '2026-11-25' as const;
  const fortuneBirthRange = `${FORTUNE_MIN_BIRTH.year}년부터 ${FORTUNE_MAX_BIRTH.year}년까지`;
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
          <p className="mt-2">
            또한 본 서비스는 카드 뽑기, 오늘의 카드 등 타로 기능을 오락과 자기
            성찰 목적으로 제공합니다.
          </p>
          <p className="mt-2">
            또한 본 서비스는 오늘의 운세, 띠별 운세, 별자리 운세, 사주 등 운세
            기능을 오락과 참고 목적으로 제공합니다.
          </p>
          <p className="mt-2">
            또한 본 서비스는 꿈 속 소재를 검색하고 민간에서 전해 온 풀이를 읽어
            볼 수 있는 꿈 해몽 기능을 오락과 자기 성찰 목적으로 제공합니다.
          </p>
          <p className="mt-2">
            또한 본 서비스는 점심, 저녁, 아침·브런치 가운데 끼니를 골라 메뉴를
            룰렛으로 무작위로 뽑아 보고 지도 검색 페이지로 이동할 수 있는 메뉴
            룰렛 기능을 오락 목적으로 제공합니다.
          </p>
          <p className="mt-2">
            또한 본 서비스는 사다리 타기, 돌림판, 제비뽑기(카드 한 장씩 열기)로
            결과를 무작위로 정해 볼 수 있는 운빨 뽑기 기능을 오락 목적으로
            제공합니다.
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
          <h2 className="font-medium text-foreground">6. 타로 서비스</h2>
          <p>
            타로 서비스는 오락과 자기 성찰을 목적으로 제공됩니다. 타로 결과는
            미래를 예측하거나 보장하지 않으며, 건강·법률·투자 등 중요한 결정은
            전문가와 상담하시기 바랍니다. 본 서비스는 특정 타로 덱 제작사나
            출판사와 제휴·후원 관계가 없습니다. 오늘의 카드는 날짜와 카드 정보만
            이용자의 기기(localStorage)를 기준으로 저장되므로, 다른 기기나
            브라우저에서는 다른 카드가 나올 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">7. 운세 서비스</h2>
          <p>
            운세 서비스는 오락과 참고를 목적으로 제공됩니다. 이용하려면 이용 전
            확인 화면에서 만 14세 이상임, 오락과 참고를 위한 서비스이며 결과를
            바탕으로 한 판단과 선택에 대한 책임은 이용자 본인에게 있음, 입력한
            생년월일이 서버로 전송되거나 저장되지 않음을 확인하고 동의해야
            합니다. 건강·법률·투자 등 중요한 결정은 전문가와 상담하시기
            바랍니다.
          </p>
          <p className="mt-2">
            운세 서비스는 만 14세 이상 이용자를 대상으로 하며, 만 14세 미만은
            이용할 수 없습니다. 이용 동의 상태는 이용자의 브라우저
            (sessionStorage)에만 저장되고 탭을 닫으면 삭제됩니다. 생년월일은
            저장하지 않으며, 자세한 내용은 개인정보처리방침을 따릅니다. 본
            서비스는 특정 운세·점술 서비스나 단체와 제휴·후원 관계가 없습니다.
          </p>
          <p className="mt-2">
            운세 서비스에서 지원하는 출생 연도는 {fortuneBirthRange}입니다.
          </p>
          <p className="mt-2">
            궁합 테스트는 운세 서비스의 일부로 오락과 참고를 목적으로
            제공됩니다. 궁합을 이용하려면 두 사람의 생년월일을 입력해야 하며,
            상대방의 정보를 입력하는 경우 입력하기 전에 상대방에게 궁합 확인에
            쓴다는 것을 알리고 동의를 받으셔야 합니다. 입력한 생년월일은 서버로
            전송되거나 저장되지 않습니다. 두 사람 중 한 사람이라도 만 14세
            미만이면 궁합을 이용하실 수 없습니다. 궁합 이용 동의는 이용자의
            브라우저 탭(sessionStorage)에만 저장되며 탭을 닫으면 지워집니다.
            궁합 결과는 두 사람의 관계나 앞으로의 일을 판단하는 근거가 아니며,
            결과를 바탕으로 한 판단과 선택은 이용자 본인에게 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">8. 꿈 해몽 서비스</h2>
          <p>
            꿈 해몽 서비스는 오락과 자기 성찰을 목적으로 제공됩니다. 풀이는
            민간에서 전해 온 해몽 관념을 바탕으로 이 서비스가 새로 작성한
            문장이며, 과학적으로 입증된 해석이 아닙니다. 꿈의 내용이 현실의 일을
            예측하거나 보장하지 않으며, 의학·법률·재정 등 전문적인 판단을 대신할
            수 없습니다. 풀이를 따르는 판단과 선택은 이용자 본인의 몫이므로,
            중요한 결정은 풀이에 의존하지 마시고 전문가와 상담하시기 바랍니다.
          </p>
          <p className="mt-2">
            꿈이 자주 반복되어 잠이나 일상생활이 힘들거나 마음이 많이 힘들다면
            혼자 견디지 마시고 수면 또는 정신건강 전문가나 서비스에 안내된 상담
            기관에 이야기해 보시기 바랍니다. 본 서비스는 특정 해몽서나 사이트,
            단체와 제휴·후원 관계가 없습니다. 꿈 해몽 서비스는 로또 등 복권
            기능과 연결되어 있지 않으며, 꿈의 내용이 당첨이나 번호와 관련이
            있다고 안내하지 않습니다. 검색칸에 입력한 글자는 서버로 전송되거나
            저장되지 않으며, 자세한 내용은 개인정보처리방침을 따릅니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">9. 뭐 먹지 서비스</h2>
          <p>
            뭐 먹지 서비스는 오락을 목적으로 제공됩니다. 이용자가 고른
            끼니(점심, 저녁, 아침·브런치)와 카테고리, 국물 조건 안에서 메뉴가
            같은 확률로 무작위로 정해지며, 뽑힌 메뉴는 특정 메뉴나 음식점을
            제안하거나 평가하는 것이 아닙니다. 메뉴 목록은 끼니마다 이 서비스가
            직접 작성한 것이며 외부 데이터를 사용하지 않습니다. 결과는 금전,
            상품, 포인트, 경품 등 어떤 보상과도 관련이 없습니다. 식사에 관한
            판단과 선택은 이용자 본인의 몫입니다.
          </p>
          <p className="mt-2">
            결과 화면의 지도 검색 링크(카카오맵, 네이버지도, 구글 지도)를 누르면
            해당 사업자가 운영하는 외부 사이트가 새 탭에서 열리며, 이때 검색어로
            뽑힌 메뉴 이름과, 이용자가 동네 이름을 적은 경우 그 동네 이름이
            전달됩니다. 본 서비스는 해당 사업자(카카오, 네이버, 구글)와
            제휴·후원 관계가 없습니다. 이동한 뒤에는 해당 사업자의 약관과 정책이
            적용되며, 검색 결과, 음식점의 위치·영업 여부·메뉴·가격 등 정보의
            정확성과 최신성은 해당 서비스를 기준으로 하고 본 서비스는 이를
            약속하지 않습니다. 지도 검색 결과가 이용자가 적은 동네의
            음식점인지는 해당 지도 서비스가 정하며, 본 서비스는 이를 확인하지
            않습니다. 뭐 먹지 서비스는 이용자의 위치 정보를 요청하지 않으며,
            고른 끼니와 조건, 적은 동네 이름, 뽑힌 결과를 서버로 전송하거나
            저장하지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">10. 운빨 뽑기 서비스</h2>
          <p>
            운빨 뽑기 서비스는 오락을 목적으로 제공됩니다. 사다리 타기와
            돌림판의 결과는 이용자가 시작 또는 돌리기를 누른 뒤 무작위로
            정해지고, 제비뽑기의 카드 배치는 이용자가 섞기를 누른 뒤 무작위로
            정해지며 카드를 열어야 항목이 표시됩니다. 결과는 추천이나 평가가
            아니고 어떤 결과도 보장하지 않습니다.
          </p>
          <p className="mt-2">
            결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 관련이 없으며, 본
            서비스는 결과에 보상을 붙이는 기능을 제공하지 않습니다.
          </p>
          <p className="mt-2">
            이용자가 입력한 이름과 항목은 서버로 전송하거나 저장하지 않고
            이용자의 브라우저 메모리에서만 사용하며, 페이지를 새로고침하거나
            닫으면 사라집니다. 연락처, 주소처럼 개인을 알아볼 수 있는 정보는
            입력하지 마십시오.
          </p>
          <p className="mt-2">
            운빨 뽑기 서비스는 다른 메뉴나 외부 사이트로 연결하는 링크를
            제공하지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            11. 손 없는 날 달력 서비스
          </h2>
          <p>
            손 없는 날 달력 서비스는 참고용으로 제공됩니다. 손 없는 날은 음력
            날짜의 끝자리로 정하는 민간 풍습이며 과학적으로 검증되지 않았습니다.
            달력에 표시되는 날짜는 음력 표를 바탕으로 계산한 참고용 결과이고,
            다른 달력이나 출처와 다를 수 있습니다.
          </p>
          <p className="mt-2">
            날짜를 고르고 결정하는 책임은 이용자에게 있으며, 본 서비스는 어떤
            결과도 보장하지 않습니다. 본 서비스는 이사, 예식, 개업 업체와 관계가
            없고 외부 사이트로 연결하는 링크를 제공하지 않습니다. 이 서비스에는
            입력받는 정보가 없습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">12. 광고 및 쿠키</h2>
          <p>
            서비스에는 광고(예: 카카오 애드핏)가 게재될 수 있으며, 광고 이용은
            자발적이어야 합니다. 핵심 기능 접근을 광고 시청으로 강제하지
            않습니다. 광고 등 비필수 기능은 이용자의 동의가 있는 경우에만
            실행되며, 자세한 내용은 개인정보처리방침을 따릅니다. 광고에 포함된
            제3자의 쿠키/정책이 적용될 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">13. 금지 행위</h2>
          <p>
            다음 행위는 금지됩니다: 불법적 이용, 자동화된 과도한 요청/스크래핑,
            서비스 방해, 저작권/상표권 침해, 타인의 개인정보 침해 등.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">14. 지식재산권</h2>
          <p>
            서비스 및 제공되는 콘텐츠의 권리는 각 권리자에게 귀속됩니다. 별도
            허락 없는 복제/배포/2차적 저작물 작성은 금지됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            15. 책임 제한 및 제3자 서비스
          </h2>
          <p>
            본 서비스 이용으로 인한 손실(직접/간접/부수적 손해 포함)에 대해
            당사는 법이 허용하는 범위 내에서 책임을 부담하지 않으며, 모든 결정과
            책임은 이용자에게 있습니다. 호스팅(Vercel), 데이터베이스(Supabase),
            광고 네트워크 등 제3자 서비스의 장애·변경으로 인한 손해에 대해서도
            법이 허용하는 범위 내에서 책임을 지지 않습니다. 뭐 먹지 서비스에서
            연결되는 지도 검색 페이지(카카오맵, 네이버지도, 구글 지도)의 내용,
            검색 결과, 음식점 정보의 정확성, 해당 서비스의 장애·변경으로 인한
            손해에 대해서도 같습니다.
          </p>
          <p className="mt-2">
            공유 기능으로 보내는 이미지와 링크는 이용자가 직접 고른 앱으로
            이용자가 보내는 것입니다. 다른 사람의 이름 등 정보가 들어간 이미지를
            공유할 때는 그 사람의 동의를 먼저 받아 주시기 바랍니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">16. 면책 및 보상</h2>
          <p>
            이용자가 약관 위반 또는 불법행위로 인해 제3자와의 분쟁·청구가 발생한
            경우, 이용자는 당사에 발생한 합리적 손해와 비용(변호사 비용 포함)을
            배상해야 할 수 있습니다. 이는 법령이 허용하는 범위 내에서
            적용됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            17. 서비스 변경 및 중단
          </h2>
          <p>
            당사는 서비스의 전부 또는 일부를 변경·중단할 수 있습니다. 필요 시
            사전 공지하며, 불가피한 경우 사후 공지될 수 있습니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">18. 약관 변경</h2>
          <p>
            본 약관은 사전 고지 후 변경될 수 있습니다. 변경 후에도 서비스를 계속
            이용하면 변경 사항에 동의한 것으로 간주됩니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">
            19. 준거법 및 분쟁 해결
          </h2>
          <p>
            본 약관은 대한민국 법률에 따릅니다. 분쟁은 관할 법원에서 해결합니다.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-foreground">20. 분리가능성</h2>
          <p>
            본 약관의 일부 조항이 무효·집행 불능으로 판단되더라도, 나머지 조항의
            유효성에는 영향을 미치지 않습니다.
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
              className="text-primary underline underline-offset-4"
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
