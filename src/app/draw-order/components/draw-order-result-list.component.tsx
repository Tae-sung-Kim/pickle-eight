import { DrawOrderParticipantType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Gift, User } from 'lucide-react';

type Props = {
  participants: DrawOrderParticipantType[];
};

export const DrawOrderResultListComponent = ({ participants }: Props) => {
  const hasResults = participants.some((p) => p.drawnItem);

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Gift className="w-4 h-4 mr-2 text-primary" />
          추첨 결과
        </h3>
      </div>

      {hasResults ? (
        <ul className="divide-y divide-gray-100">
          <AnimatePresence>
            {participants.map(
              (p, idx) =>
                p.drawnItem && (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-3">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            #{idx + 1}번 참가자
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-primary mr-2">
                          {p.drawnItem}
                        </span>
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  </motion.li>
                )
            )}
          </AnimatePresence>
        </ul>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Gift className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">
            아직 추첨이 완료되지 않았습니다.
            <br />
            뽑기 버튼을 눌러 추첨을 시작하세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default DrawOrderResultListComponent;
