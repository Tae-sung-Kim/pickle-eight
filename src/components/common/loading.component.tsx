'use client';
import { Loader2 } from 'lucide-react';
import { useLoadingStore } from '@/stores/loading.store';

export function LoadingComponent() {
  const { isLoading } = useLoadingStore();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
      <Loader2 className="h-16 w-16 animate-spin text-white" />
    </div>
  );
}
