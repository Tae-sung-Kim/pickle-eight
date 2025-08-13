import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GameControlsProps {
  matchCount: number;
  setMatchCount: (count: number) => void;
  mapSize: number;
  setMapSize: (size: number) => void;
  onStartGame: () => void;
  isGameActive: boolean;
}

const MAP_SIZE_OPTIONS: { [key: number]: number[] } = {
  2: [6, 8, 10],
  3: [6, 9],
};

export function NumberMatchGameControlsComponent({
  matchCount,
  setMatchCount,
  mapSize,
  setMapSize,
  onStartGame,
  isGameActive,
}: GameControlsProps) {
  const handleMatchCountChange = (value: string) => {
    const newMatchCount = parseInt(value, 10);
    setMatchCount(newMatchCount);
    setMapSize(MAP_SIZE_OPTIONS[newMatchCount][0]);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-card p-4 shadow-md">
        <div className="flex items-center gap-2">
          <Label htmlFor="match-count" className="text-sm whitespace-nowrap">
            매칭 개수
          </Label>
          <Select
            value={String(matchCount)}
            onValueChange={handleMatchCountChange}
            disabled={isGameActive}
          >
            <SelectTrigger id="match-count" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 3].map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {count}개
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="map-size" className="text-sm whitespace-nowrap">
            맵 크기
          </Label>
          <Select
            value={String(mapSize)}
            onValueChange={(value) => setMapSize(parseInt(value, 10))}
            disabled={isGameActive}
          >
            <SelectTrigger id="map-size" className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MAP_SIZE_OPTIONS[matchCount].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} x {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onStartGame}
          variant="secondary"
          size="sm"
          className="whitespace-nowrap text-sm px-4"
        >
          {isGameActive ? '다시하기' : '게임 시작'}
        </Button>
      </div>
    </div>
  );
}

export default NumberMatchGameControlsComponent;
