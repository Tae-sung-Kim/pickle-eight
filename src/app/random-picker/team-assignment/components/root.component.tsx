'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCapture, useNameManager } from '@/hooks';
import {
  NameInputComponent,
  NameBadgeComponent,
  TitleWrapperComponent,
} from '@/components';
import { cn } from '@/lib';
import { generateTeams } from '@/utils/team-assignment.util';
import TeamResultListComponent from './result-list.component';
import TeamCountInputComponent from './count-input.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants';

/**
 * 팀 배정 페이지
 */
export function TeamAssignmentComponent() {
  const { names, addName, removeName } = useNameManager();
  const [teamCount, setTeamCount] = useState<number>(2);
  const [teams, setTeams] = useState<string[][]>([]);
  const [nameInput, setNameInput] = useState<string>('');

  const { onCapture } = useCapture();
  const resultRef = useRef<HTMLDivElement>(null);

  /** 참가자 추가 */
  const handleAddName = (): void => {
    if (nameInput.trim() && addName(nameInput.trim())) {
      setNameInput('');
    }
  };

  /** 팀 배정 실행 */
  const handleGenerateTeams = (): void => {
    generateTeams({
      names,
      teamCount,
      setTeams,
    });
  };

  /** 결과 공유 */
  const handleShare = () => {
    onCapture(resultRef as React.RefObject<HTMLElement>, {
      fileName: 'result.png',
      shareTitle: '팀 배정 결과',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto h-fit p-4"
    >
      {/* 타이틀/설명: 카드 바깥, 최상단 */}
      <TitleWrapperComponent
        type={MENU_GROUP_NAME_ENUM.RANDOM_PICKER}
        title="팀 배정기"
        description="참가자 명단을 입력하고, 원하는 팀 개수를 설정한 뒤 팀 배정 버튼을 누르세요"
      />
      <div
        className="w-full rounded-2xl border border-border bg-white/70 backdrop-blur p-8 space-y-8 shadow-sm ring-1 ring-black/5"
        ref={resultRef}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-4">
          {/* 왼쪽: 참가자 추가 + n명 + 입력창 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">참가자 추가</h3>
              <span className="text-sm text-muted-foreground">
                {names.length}명 추가됨
              </span>
            </div>
            <NameInputComponent
              value={nameInput}
              onChange={setNameInput}
              placeholder="이름 입력 후 엔터 또는 추가 버튼"
              onAdd={handleAddName}
              isIcon
              className="w-full"
            />
            {names.length > 0 && (
              <div className="mt-3">
                <NameBadgeComponent list={names} onRemove={removeName} />
              </div>
            )}
          </div>
          {/* 오른쪽: 팀 개수 설정 */}
          <div>
            <TeamCountInputComponent
              value={teamCount}
              onChange={setTeamCount}
            />
          </div>
        </div>
        {/* 팀 배정 버튼 */}
        <div className="w-full grid grid-cols-2 gap-4">
          <Button
            onClick={handleGenerateTeams}
            disabled={names.length < teamCount}
            size="lg"
            className={cn(
              'w-full max-w-md mx-auto py-4 text-base font-bold',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'shadow-sm hover:shadow',
              names.length < teamCount && 'opacity-70'
            )}
          >
            <Sparkles className="mr-2 h-5 w-5" />팀 배정하기
          </Button>

          <Button
            onClick={handleShare}
            disabled={!teams.length}
            size="lg"
            variant="outline"
            className={cn('w-full max-w-md mx-auto py-4 text-base font-bold')}
          >
            <Share2 className="mr-2 h-5 w-5" />
            공유하기
          </Button>
        </div>
        {/* 결과 출력 */}
        {teams.length > 0 && <TeamResultListComponent teams={teams} />}
      </div>
    </motion.div>
  );
}

export default TeamAssignmentComponent;
