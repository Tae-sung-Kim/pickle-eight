import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * @param values 두 개의 주사위 값 [number, number]
 * @param rolling 애니메이션 동작 여부
 */
export type DiceComponentPropsType = {
  values: [number, number];
  rolling: boolean;
};

export const DiceComponent = ({ values, rolling }: DiceComponentPropsType) => (
  <div className="flex gap-2">
    {values.map((value, idx) => (
      <div key={idx} className="relative">
        <Card
          className={cn(
            'flex items-center justify-center w-16 h-16 text-3xl font-bold transition-transform duration-300 relative',
            rolling && 'animate-bounce'
          )}
        >
          {value}
        </Card>
      </div>
    ))}
  </div>
);

export default DiceComponent;
