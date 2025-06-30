import { DrawOrderParticipantType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, User } from 'lucide-react';

type Props = {
  participants: DrawOrderParticipantType[];
  currentTurn: number;
};

export const DrawOrderParticipantListComponent = ({
  participants,
  currentTurn,
}: Props) => (
  <div className="space-y-2">
    <AnimatePresence>
      {participants.map((p, idx) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: idx === currentTurn ? 1.02 : 1,
            zIndex: idx === currentTurn ? 10 : 1,
          }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            delay: idx * 0.03,
          }}
          className={`relative rounded-lg transition-all duration-200 ${
            idx === currentTurn
              ? 'ring-2 ring-primary/50 shadow-lg'
              : 'hover:bg-gray-50'
          }`}
        >
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              idx === currentTurn
                ? 'bg-gradient-to-r from-primary/5 to-primary/10'
                : 'bg-white border border-gray-100'
            }`}
          >
            <div
              className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
                idx === currentTurn
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {idx === currentTurn ? (
                <Trophy className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  idx === currentTurn ? 'text-primary' : 'text-gray-800'
                }`}
              >
                {p.name}
              </p>
              {p.drawnItem && (
                <p className="text-xs text-gray-500 truncate">{p.drawnItem}</p>
              )}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                idx === currentTurn
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              #{idx + 1}
            </span>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>

    {participants.length === 0 && (
      <div className="text-center py-6">
        <p className="text-gray-400 text-sm">
          참가자가 없습니다. 추가해주세요.
        </p>
      </div>
    )}
  </div>
);

export default DrawOrderParticipantListComponent;
