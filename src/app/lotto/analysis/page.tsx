import { LottoAnalysisComponent } from './components';
// import type { Metadata } from 'next';
// import { generateOgImageUrl } from '@/utils';

// export const metadata: Metadata = {
//   title: '로또 분석 - 당첨번호 통계·빈도·패턴 시각화 | Pickle Eight',
//   description:
//     '회차별 당첨 번호, 출현 빈도, 구간·패턴 통계를 시각화로 확인하세요.',
//   keywords: ['로또', '분석', '통계', '빈도', '패턴', '시각화', '당첨번호'],
//   openGraph: {
//     title: '로또 분석 - 당첨번호 통계·빈도·패턴 시각화 | Pickle Eight',
//     description:
//       '회차별 당첨 번호, 출현 빈도, 구간·패턴 통계를 시각화로 확인하세요.',
//     url: process.env.NEXT_PUBLIC_SITE_URL + '/lotto/analysis',
//     siteName: process.env.NEXT_PUBLIC_SITE_NAME,
//     locale: 'ko_KR',
//     type: 'website',
//     images: [
//       generateOgImageUrl(
//         '로또 분석 - 당첨번호 통계·빈도·패턴 시각화 | Pickle Eight',
//         '회차별 당첨 번호, 출현 빈도, 구간·패턴 통계를 시각화로 확인하세요.',
//         '로또 분석'
//       ),
//     ],
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: '로또 분석 - 당첨번호 통계·빈도·패턴 시각화 | Pickle Eight',
//     description:
//       '회차별 당첨 번호, 출현 빈도, 구간·패턴 통계를 시각화로 확인하세요.',
//     images: [
//       generateOgImageUrl(
//         '로또 분석 - 당첨번호 통계·빈도·패턴 시각화 | Pickle Eight',
//         '회차별 당첨 번호, 출현 빈도, 구간·패턴 통계를 시각화로 확인하세요.',
//         '로또 분석'
//       ),
//     ],
//   },
//   alternates: {
//     canonical: process.env.NEXT_PUBLIC_SITE_URL + '/lotto/analysis',
//   },
// };

export default function LottoAnalysisPage() {
  return <LottoAnalysisComponent />;
}
