import { useDrawOrder } from '@/hooks';
import { Button } from '@/components/ui/button';
import { DrawOrderParticipantType, DrawOrderItemType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Gift, Sparkles, User } from 'lucide-react';
import DrawOrderResultListComponent from './draw-order-result-list.component';
import DrawOrderParticipantListComponent from './draw-order-participant-list.component';

export const DrawOrderComponent = ({
  participants: initialParticipants,
  items: initialItems,
}: {
  participants: string[];
  items: string[];
}) => {
  // string[] → 타입 변환
  const participants: DrawOrderParticipantType[] = initialParticipants.map(
    (name, idx) => ({
      id: `p${idx}`,
      name,
      hasDrawn: false,
    })
  );

  const items: DrawOrderItemType[] = initialItems.map((label, idx) => ({
    id: `i${idx}`,
    label,
    isDrawn: false,
  }));

  const { state, draw } = useDrawOrder({
    participants,
    items,
  });

  const {
    participants: stateParticipants,
    currentTurn,
    isDrawing,
    currentItem,
  } = state;
  const currentParticipant = stateParticipants[currentTurn];
  const allParticipantsDrawn = stateParticipants.every((p) => p.hasDrawn);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Current Turn Card */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          <Trophy className="w-8 h-8" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentParticipant?.id || 'waiting'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              {currentParticipant ? (
                <span className="text-primary">{currentParticipant.name}</span>
              ) : (
                '추첨이 완료되었습니다!'
              )}
            </h2>
            <p className="text-gray-600">
              {currentParticipant
                ? '님의 차례입니다!'
                : '모든 추첨이 완료되었습니다.'}
            </p>
          </motion.div>
        </AnimatePresence>

        {currentItem && (
          <motion.div
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Gift className="w-4 h-4 mr-1" />
            현재 상품: {currentItem.label}
          </motion.div>
        )}
      </motion.div>

      {/* Draw Button */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={allParticipantsDrawn ? () => window.location.reload() : draw}
          disabled={isDrawing}
          size="lg"
          className={`w-full py-6 text-lg font-semibold transition-all duration-200 ${
            isDrawing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
          }`}
        >
          {isDrawing ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              뽑는 중...
            </span>
          ) : allParticipantsDrawn ? (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              다시하기
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              {currentParticipant?.name}님 뽑기
            </span>
          )}
        </Button>
      </motion.div>

      {/* Results Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <DrawOrderResultListComponent participants={stateParticipants} />
      </motion.div>

      {/* Participants List */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-primary" />
          참가자 목록
        </h3>
        <DrawOrderParticipantListComponent
          participants={stateParticipants}
          currentTurn={currentParticipant ? currentTurn : -1}
        />
      </motion.div>
    </div>
  );
};

export default DrawOrderComponent;
