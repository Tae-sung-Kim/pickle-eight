// import { Metadata } from 'next';
// import { generateOgImageUrl } from '@/utils';

// export const metadata: Metadata = {
//   title: '로그인 - Pickle Eight',
//   description:
//     'Pickle Eight 계정으로 로그인하여 즐겨찾기, 저장 목록, 맞춤 설정을 사용해 보세요.',
//   keywords: [
//     '로그인',
//     '계정',
//     '사용자',
//     '인증',
//     'pickle eight',
//     '사인인',
//     '접속',
//   ],
//   openGraph: {
//     title: '로그인 - Pickle Eight',
//     description:
//       'Pickle Eight 계정으로 로그인하여 즐겨찾기, 저장 목록, 맞춤 설정을 사용해 보세요.',
//     url: process.env.NEXT_PUBLIC_SITE_URL + '/login',
//     siteName: process.env.NEXT_PUBLIC_SITE_NAME,
//     locale: 'ko_KR',
//     type: 'website',
//     images: [
//       generateOgImageUrl(
//         '로그인 - Pickle Eight',
//         'Pickle Eight 계정으로 로그인하여 즐겨찾기, 저장 목록, 맞춤 설정을 사용해 보세요.',
//         '로그인'
//       ),
//     ],
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: '로그인 - Pickle Eight',
//     description:
//       'Pickle Eight 계정으로 로그인하여 즐겨찾기, 저장 목록, 맞춤 설정을 사용해 보세요.',
//     images: [
//       generateOgImageUrl(
//         '로그인 - Pickle Eight',
//         'Pickle Eight 계정으로 로그인하여 즐겨찾기, 저장 목록, 맞춤 설정을 사용해 보세요.',
//         '로그인'
//       ),
//     ],
//   },
//   alternates: {
//     canonical: process.env.NEXT_PUBLIC_SITE_URL + '/login',
//   },
// };

export default function LoginPage() {
  return (
    <div>
      <h1>로그인</h1>
    </div>
  );
}
