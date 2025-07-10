'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNameManager } from '@/hooks';
import { NameInputComponent } from '@/components';
import { cn } from '@/lib/utils';
import { generateTeams } from '@/utils/team-assignment';
import NameBadgeComponent from '@/components/name-badge.component';
import { TeamCountInputComponent, TeamResultListComponent } from './components';

/**
 * 팀 배정 페이지
 */
export default function TeamAssignmentPage() {
  const { names, addName, removeName } = useNameManager();
  const [teamCount, setTeamCount] = useState<number>(2);
  const [teams, setTeams] = useState<string[][]>([]);
  const [nameInput, setNameInput] = useState<string>('');

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center py-10 px-2 bg-orange-50"
    >
      <div className="w-full bg-white rounded-2xl shadow-lg p-8 space-y-8">
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
        <div className="w-full flex justify-center">
          <Button
            onClick={handleGenerateTeams}
            disabled={names.length < teamCount}
            size="lg"
            className={cn(
              'w-full max-w-md mx-auto py-4 text-base font-bold',
              'bg-gradient-to-r from-indigo-500 to-purple-600',
              'hover:from-indigo-600 hover:to-purple-700',
              'shadow-lg hover:shadow-xl',
              names.length < teamCount && 'opacity-70'
            )}
          >
            <Sparkles className="mr-2 h-5 w-5" />팀 배정하기
          </Button>
        </div>
        {/* 결과 출력 */}
        {teams.length > 0 && <TeamResultListComponent teams={teams} />}
      </div>
    </motion.div>
  );
}
