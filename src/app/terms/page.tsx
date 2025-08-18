/**
 * TermsPage - Terms of Service
 * UI copy: Korean, Code: English
 */
export default function TermsPage() {
  const EFFECTIVE_DATE = '2025-08-18' as const;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
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
            보장하지 않습니다.
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
            정확성·적시성·완전성은 보장되지 않습니다.
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
          <h2 className="font-medium text-foreground">11. 문의</h2>
          <p>
            문의처: 서비스 내 문의 채널 또는 관리자 이메일(예:
            support@example.com).
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
