'use client';

import { LottoDrawType } from '@/types';
import { LottoBallComponent } from '@/components';

export function LottoHistoryResultComponent({
  data,
}: {
  data: LottoDrawType[];
}) {
  return (
    <>
      {data && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">회차</th>
                <th className="px-3 py-2 text-left">추첨일</th>
                <th className="px-3 py-2 text-left">당첨번호</th>
                <th className="px-3 py-2 text-left">보너스</th>
                <th className="px-3 py-2 text-left">1등(명)</th>
              </tr>
            </thead>
            <tbody>
              {data
                .slice()
                .sort((a, b) => b.drawNumber - a.drawNumber)
                .map((d) => (
                  <tr key={d.drawNumber} className="border-t">
                    <td className="px-3 py-3">{d.drawNumber}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {d.drawDate}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {d.numbers.map((n, idx) => (
                          <LottoBallComponent key={n} number={n} index={idx} />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <LottoBallComponent
                        number={d.bonusNumber}
                        index={0}
                        isBonus
                      />
                    </td>
                    <td className="px-3 py-3">{d.firstWinCount ?? '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default LottoHistoryResultComponent;
