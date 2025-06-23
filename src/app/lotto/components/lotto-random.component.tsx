'use client';
import { Button } from '@/components/ui/button';

export default function LottoRandomComponent() {
  const handleRandomLottoNumber = () => {
    console.log('1111');
  };

  return (
    <Button variant="outline" onClick={handleRandomLottoNumber}>
      랜덤번호 생성11
    </Button>
  );
}
