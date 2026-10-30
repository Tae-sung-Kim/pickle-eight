import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * 404 Not Found Page Component
 * 사용자가 존재하지 않는 경로에 접근했을 때 보여주는 페이지입니다.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-bold tracking-tight text-muted-foreground/40 sm:text-7xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        주소가 잘못되었거나 페이지가 이동·삭제되었을 수 있어요.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">홈으로 이동</Link>
      </Button>
    </div>
  );
}
