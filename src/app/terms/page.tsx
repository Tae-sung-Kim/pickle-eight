import { SectionTitle } from '@/components';

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <SectionTitle title="이용약관" />
      <section className="space-y-6 text-base leading-relaxed">
        <h2 className="font-semibold mt-4">1. 서비스의 목적</h2>
        <p>
          본 서비스는 이용자의 위치정보를 활용하여 날씨, 맛집 등 맞춤형 정보를
          제공합니다.
        </p>
        <h2 className="font-semibold mt-4">2. 위치정보의 이용</h2>
        <ul className="list-disc ml-5">
          <li>
            서비스 이용 시, 이용자의 동의 하에 위치정보를 일시적으로
            수집·이용합니다.
          </li>
          <li>
            위치정보는 서비스 제공 목적 외로 사용하지 않으며, 별도로 저장하지
            않습니다.
          </li>
        </ul>
        <h2 className="font-semibold mt-4">3. 이용자의 의무</h2>
        <p>
          이용자는 본 서비스 이용 시 관련 법령 및 본 약관을 준수해야 합니다.
        </p>
        <h2 className="font-semibold mt-4">4. 서비스의 변경 및 중단</h2>
        <p>
          사이트는 서비스의 일부 또는 전부를 사전 고지 없이 변경·중단할 수
          있습니다.
        </p>
        <h2 className="font-semibold mt-4">5. 면책조항</h2>
        <p>
          서비스에서 제공하는 정보(날씨, 맛집 등)는 참고용이며, 그 정확성이나
          신뢰성에 대해 보장하지 않습니다.
        </p>
        <h2 className="font-semibold mt-4">6. 기타</h2>
        <p>본 약관은 관련 법령 및 회사 정책에 따라 변경될 수 있습니다.</p>
      </section>
    </main>
  );
}
