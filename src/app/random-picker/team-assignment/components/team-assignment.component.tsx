'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCapture, useNameManager } from '@/hooks';
import { NameInputComponent } from '@/components';
import { cn } from '@/lib';
import { generateTeams } from '@/utils/team-assignment.util';
import NameBadgeComponent from '@/components/name-badge.component';
import TeamResultListComponent from './team-result-list.component';
import TeamCountInputComponent from './team-count-input.component';

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
      className="flex flex-col items-center justify-center py-10 px-6 bg-muted"
    >
      {/* 타이틀/설명: 카드 바깥, 최상단 */}
      <div className="mb-10 w-full flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2 text-primary">팀 배정</h1>
        <p className="text-muted-foreground text-base text-center max-w-xl">
          참가자 명단을 입력하고, 원하는 팀 개수를 설정한 뒤 <b>팀 배정하기</b>{' '}
          버튼을 누르세요.
          <br />
          참가자들은 무작위로 팀에 배정됩니다.
        </p>
      </div>
      <div
        className="w-full bg-surface-card rounded-2xl shadow-lg p-8 space-y-8 border border-border"
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
              'shadow-lg hover:shadow-xl',
              names.length < teamCount && 'opacity-70'
            )}
          >
            <Sparkles className="mr-2 h-5 w-5" />팀 배정하기
          </Button>

          <Button
            onClick={handleShare}
            disabled={!teams.length}
            size="lg"
            className={cn(
              'w-full max-w-md mx-auto py-4 text-base font-bold',
              'bg-primary/10 text-primary hover:bg-primary/20',
              'shadow-lg hover:shadow-xl',
              names.length < teamCount && 'opacity-70'
            )}
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
