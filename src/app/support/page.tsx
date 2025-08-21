// import React from 'react';
// import type { Metadata } from 'next';
// import {
//   buildMetadata,
//   canonicalUrl,
//   jsonLdBreadcrumb,
//   jsonLdWebSite,
// } from '@/lib';
// import { JsonLd } from '@/components';

// export const metadata: Metadata = buildMetadata({
//   title: 'Support',
//   description:
//     'Support Pickle Eight. Help us maintain random pickers, lotto tools, and quizzes. One-time or recurring options available.',
//   pathname: '/support',
// });

// function SupportCard(props: { title: string; href: string; subtitle: string }) {
//   return (
//     <a
//       href={props.href}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-neutral-900"
//     >
//       <h3 className="text-base font-semibold">{props.title}</h3>
//       <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
//         {props.subtitle}
//       </p>
//     </a>
//   );
// }

// export default function Page() {
//   const crumbs = jsonLdBreadcrumb([
//     { name: 'Home', item: canonicalUrl('/') },
//     { name: 'Support', item: canonicalUrl('/support') },
//   ]);

//   return (
//     <main className="container mx-auto max-w-3xl px-4 py-10">
//       <JsonLd data={[jsonLdWebSite(), crumbs]} />
//       <header className="mb-8">
//         <h1 className="text-2xl font-bold">Support</h1>
//         <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
//           If our tools help your day, consider supporting development and
//           hosting.
//         </p>
//       </header>

//       <section className="grid gap-4 sm:grid-cols-2">
//         <SupportCard
//           title="Toss"
//           href="https://toss.me/your-handle"
//           subtitle="Quick domestic transfer. One-time tip."
//         />
//         <SupportCard
//           title="KakaoPay"
//           href="https://qr.kakaopay.com/your-code"
//           subtitle="Easy transfer via KakaoPay QR."
//         />
//         <SupportCard
//           title="Buy Me a Coffee"
//           href="https://www.buymeacoffee.com/yourid"
//           subtitle="International small donations."
//         />
//         <SupportCard
//           title="Coupang Partners"
//           href="https://link.coupang.com/a/bbbbb"
//           subtitle="Affiliate link disclosure below."
//         />
//       </section>

//       <section className="mt-10 space-y-3 text-sm text-gray-600 dark:text-gray-400">
//         <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
//           Legal & Notices
//         </h2>
//         <p>
//           This page is operated by a sole proprietorship. For receipts or
//           inquiries, please refer to the contact information in the Terms page.
//         </p>
//         <p>
//           Affiliate disclosure: As an affiliate, we may earn from qualifying
//           purchases via provided links. This does not affect your price.
//         </p>
//         <p>
//           Donations are generally non-refundable. If you made a mistake, contact
//           us promptly and we will try to assist.
//         </p>
//       </section>
//     </main>
//   );
// }

export default function SupportPage() {
  return (
    <main>
      <h1>Support</h1>
    </main>
  );
}
