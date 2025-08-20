import { LottoSimulatorComponent } from './components';
// import type { Metadata } from 'next';
// import { generateOgImageUrl } from '@/utils';

// export const metadata: Metadata = {
//   title: '로또 시뮬레이터 - 가상 추첨·확률 체감 | Pickle Eight',
//   description:
//     '가상 추첨으로 당첨 확률과 분포를 체감해 보세요. 다양한 옵션으로 시뮬레이션이 가능합니다.',
//   keywords: ['로또', '시뮬레이터', '확률', '가상 추첨', '분포', '실험'],
//   openGraph: {
//     title: '로또 시뮬레이터 - 가상 추첨·확률 체감 | Pickle Eight',
//     description:
//       '가상 추첨으로 당첨 확률과 분포를 체감해 보세요. 다양한 옵션으로 시뮬레이션이 가능합니다.',
//     url: process.env.NEXT_PUBLIC_SITE_URL + '/lotto/simulator',
//     siteName: process.env.NEXT_PUBLIC_SITE_NAME,
//     locale: 'ko_KR',
//     type: 'website',
//     images: [
//       generateOgImageUrl(
//         '로또 시뮬레이터 - 가상 추첨·확률 체감 | Pickle Eight',
//         '가상 추첨으로 당첨 확률과 분포를 체감해 보세요. 다양한 옵션으로 시뮬레이션이 가능합니다.',
//         '로또 시뮬레이터'
//       ),
//     ],
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: '로또 시뮬레이터 - 가상 추첨·확률 체감 | Pickle Eight',
//     description:
//       '가상 추첨으로 당첨 확률과 분포를 체감해 보세요. 다양한 옵션으로 시뮬레이션이 가능합니다.',
//     images: [
//       generateOgImageUrl(
//         '로또 시뮬레이터 - 가상 추첨·확률 체감 | Pickle Eight',
//         '가상 추첨으로 당첨 확률과 분포를 체감해 보세요. 다양한 옵션으로 시뮬레이션이 가능합니다.',
//         '로또 시뮬레이터'
//       ),
//     ],
//   },
//   alternates: {
//     canonical: process.env.NEXT_PUBLIC_SITE_URL + '/lotto/simulator',
//   },
// };

export default function LottoSimulatorPage() {
  return <LottoSimulatorComponent />;
}
