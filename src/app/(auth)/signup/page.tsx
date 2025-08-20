// import { Metadata } from 'next';
// import { generateOgImageUrl } from '@/utils';

// export const metadata: Metadata = {
//   title: '회원가입 - Pickle Eight',
//   description:
//     '간단한 회원가입으로 추첨 결과 저장, 즐겨찾기, 맞춤 기능을 이용하세요.',
//   keywords: [
//     '회원가입',
//     '가입',
//     '계정 생성',
//     '사용자',
//     'pickle eight',
//     '사인업',
//   ],
//   openGraph: {
//     title: '회원가입 - Pickle Eight',
//     description:
//       '간단한 회원가입으로 추첨 결과 저장, 즐겨찾기, 맞춤 기능을 이용하세요.',
//     url: process.env.NEXT_PUBLIC_SITE_URL + '/signup',
//     siteName: process.env.NEXT_PUBLIC_SITE_NAME,
//     locale: 'ko_KR',
//     type: 'website',
//     images: [
//       generateOgImageUrl(
//         '회원가입 - Pickle Eight',
//         '간단한 회원가입으로 추첨 결과 저장, 즐겨찾기, 맞춤 기능을 이용하세요.',
//         '회원가입'
//       ),
//     ],
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: '회원가입 - Pickle Eight',
//     description:
//       '간단한 회원가입으로 추첨 결과 저장, 즐겨찾기, 맞춤 기능을 이용하세요.',
//     images: [
//       generateOgImageUrl(
//         '회원가입 - Pickle Eight',
//         '간단한 회원가입으로 추첨 결과 저장, 즐겨찾기, 맞춤 기능을 이용하세요.',
//         '회원가입'
//       ),
//     ],
//   },
//   alternates: {
//     canonical: process.env.NEXT_PUBLIC_SITE_URL + '/signup',
//   },
// };

export default function SignupPage() {
  return (
    <div>
      <h1>회원가입</h1>
    </div>
  );
}
