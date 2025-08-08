import { SectionTitle } from '@/components';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <SectionTitle title="개인정보처리방침" />
      <section className="space-y-6 text-base leading-relaxed">
        <p>
          본 서비스(이하 “사이트”)는 이용자의 위치정보 등 개인정보를 중요하게
          생각하며, 관련 법령을 준수합니다. 본 방침은 이용자가 제공하는
          위치정보의 수집, 이용, 보호에 관한 내용을 담고 있습니다.
        </p>
        <h2 className="font-semibold mt-4">
          1. 수집하는 개인정보 항목 및 방법
        </h2>
        <ul className="list-disc ml-5">
          <li>수집 항목: 위치정보(브라우저를 통한 현재 위치)</li>
          <li>
            수집 방법: 사용자가 위치정보 제공에 동의할 경우, 브라우저에서
            위치정보를 일시적으로 수집
          </li>
          1
        </ul>
        <h2 className="font-semibold mt-4">2. 개인정보의 수집 및 이용 목적</h2>
        <ul className="list-disc ml-5">
          <li>날씨 정보 제공</li>
          <li>주변 맛집 등 맞춤형 추천 서비스 제공</li>
        </ul>
        <h2 className="font-semibold mt-4">3. 개인정보의 보유 및 이용 기간</h2>
        <p>
          위치정보는 서비스 제공을 위해 일시적으로만 사용되며, 별도로 저장하지
          않습니다.
        </p>
        <h2 className="font-semibold mt-4">4. 개인정보의 제3자 제공</h2>
        <p>이용자의 위치정보를 제3자에게 제공하지 않습니다.</p>
        <h2 className="font-semibold mt-4">5. 이용자의 권리와 행사방법</h2>
        <p>
          이용자는 언제든지 위치정보 제공에 동의하지 않을 수 있으며, 동의 후에도
          철회할 수 있습니다.
        </p>
        <h2 className="font-semibold mt-4">6. 개인정보 보호책임자</h2>
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
        <h2 className="font-semibold mt-4">7. 기타</h2>
        <p>본 방침은 관련 법령 및 회사 정책에 따라 변경될 수 있습니다.</p>
      </section>
    </main>
  );
}
