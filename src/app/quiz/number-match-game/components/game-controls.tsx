import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  matchCount: number;
  setMatchCount: (count: number) => void;
  mapSize: number;
  setMapSize: (size: number) => void;
  onStartGame: () => void;
  isGameActive: boolean;
}

const MAP_SIZE_OPTIONS: { [key: number]: number[] } = {
  2: [2, 4, 6, 8, 10],
  3: [3, 6, 9],
  4: [4, 8],
  5: [5, 10],
};

export function GameControls({
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
    // Reset map size to the smallest valid option for the new match count
    setMapSize(MAP_SIZE_OPTIONS[newMatchCount][0]);
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-6 shadow-md md:flex-row">
      <div className="flex items-center gap-2">
        <Label htmlFor="match-count">매칭 개수</Label>
        <Select
          value={String(matchCount)}
          onValueChange={handleMatchCountChange}
          disabled={isGameActive}
        >
          <SelectTrigger id="match-count" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2, 3, 4, 5].map((count) => (
              <SelectItem key={count} value={String(count)}>
                {count}개
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="map-size">맵 크기</Label>
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

      <Button onClick={onStartGame} size="lg">
        {isGameActive ? '다시하기' : '게임 시작'}
      </Button>
    </div>
  );
}

export default GameControls;
