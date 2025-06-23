'use client';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

type CounterProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  buttonVariant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary';
  showValue?: boolean;
  label?: string;
  showSlider?: boolean;
  showInput?: boolean;
  sliderStep?: number;
  inputClassName?: string;
};

export function CounterComponent({
  value: propValue,
  min = 1,
  max = 10,
  step = 1,
  onChange,
  className,
  buttonVariant = 'outline',
  showValue = true,
  label,
  showSlider = true,
  showInput = true,
  sliderStep = 1,
  inputClassName = '',
}: CounterProps) {
  const [inputValue, setInputValue] = useState(propValue.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Sync input value when prop changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(propValue.toString());
    }
  }, [propValue, isFocused]);

  const handleDecrement = () => {
    const newValue = Math.max(min, propValue - step);
    if (newValue !== propValue) {
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, propValue + step);
    if (newValue !== propValue) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min) {
      setInputValue(min.toString());
      onChange(min);
    } else if (numValue > max) {
      setInputValue(max.toString());
      onChange(max);
    } else {
      setInputValue(numValue.toString());
    }
  };

  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className={cn('space-y-2 w-full', className)}>
      <div className="flex items-center gap-2">
        {label && (
          <span className="text-sm font-medium whitespace-nowrap">{label}</span>
        )}
        <Button
          type="button"
          variant={buttonVariant}
          size="icon"
          onClick={handleDecrement}
          disabled={propValue <= min}
          className="h-8 w-8 rounded-full shrink-0"
          aria-label="Decrease"
        >
          -
        </Button>

        {showInput ? (
          <Input
            type="number"
            min={min}
            max={max}
            step={step}
            value={isFocused ? inputValue : propValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleInputBlur}
            className={cn(
              'w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              inputClassName
            )}
            aria-label={label ? `${label} 입력` : '값 입력'}
          />
        ) : showValue ? (
          <span className="w-8 text-center text-sm font-medium">
            {propValue}
          </span>
        ) : null}

        <Button
          type="button"
          variant={buttonVariant}
          size="icon"
          onClick={handleIncrement}
          disabled={propValue >= max}
          className="h-8 w-8 rounded-full shrink-0"
          aria-label="Increase"
        >
          +
        </Button>
      </div>

      {showSlider && (
        <div className="px-2">
          <Slider
            value={[propValue]}
            min={min}
            max={max}
            step={sliderStep}
            onValueChange={handleSliderChange}
            aria-label={label ? `${label} 조절` : '값 조절'}
          />
        </div>
      )}
    </div>
  );
}

CounterComponent.displayName = 'CounterComponent';
export default CounterComponent;
