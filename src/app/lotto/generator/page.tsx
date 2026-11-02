import type { Metadata } from 'next';
import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { LottoGeneratorComponent } from '@/features/lotto/generator/components/root.component';
import {
  buildMetadata,
  canonicalUrl,
  generateOgImageUrl,
  getOgTag,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';

const PATHNAME = `/${MENU_GROUP_NAME_ENUM.LOTTO}/generator`;
const TITLE = '로또 번호 생성기 - 무작위 생성부터 조건 설정까지';
const DESCRIPTION =
  '로또 번호를 무작위로 생성하거나, 합계·연속·홀짝·구간·고정/제외 번호·가중치 조건을 걸어 생성하세요. 참고용 조합이며 당첨을 보장하지 않습니다.';

const baseMeta = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  pathname: PATHNAME,
});

const ogImages = [
  generateOgImageUrl(
    TITLE,
    DESCRIPTION,
    '로또 번호 생성기',
    getOgTag({ label: '번호 생성기' })
  ),
];

export const metadata: Metadata = {
  ...baseMeta,
  keywords: ['로또', '번호 생성', '무작위', '제외번호', '패턴', '빈도', '조합'],
  openGraph: { ...baseMeta.openGraph, images: ogImages },
  twitter: { ...baseMeta.twitter, images: ogImages },
  alternates: { canonical: canonicalUrl(PATHNAME) },
};

export default function LottoGeneratorPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '로또 번호 생성기', item: canonicalUrl(PATHNAME) },
  ]);

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.LOTTO}>
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <JsonLdComponent
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '조건/가중치가 당첨을 보장하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '아니요. 조건과 가중치는 선호 조합을 만드는 도구이며 특정 당첨을 보장하지 않습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '생성기는 어떤 데이터를 참고하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '기본 생성은 데이터를 쓰지 않고 무작위로 뽑습니다. 고급 옵션의 가중치를 켜면 서버에 동기화된 로또 당첨 기록을 참고합니다.',
                },
              },
            ],
          },
        ]}
      />
      <div className="mx-auto max-w-5xl p-8">
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.LOTTO}
          title="로또 번호 생성기"
          description="무작위로 번호를 뽑거나 고급 옵션으로 조건을 정해 생성하세요. 참고용 조합이며 당첨을 보장하지 않습니다."
        />
        <LottoGeneratorComponent />
      </div>
    </ContentWrapperComponent>
  );
}
