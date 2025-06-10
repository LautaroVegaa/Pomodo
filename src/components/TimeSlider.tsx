
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface TimeSliderProps {
  label: string;
  value: number;
  maxValue: number;
  minValue?: number;
  bgColor: string;
  icon?: React.ReactNode;
  onChange: (value: number) => void;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  label,
  value,
  maxValue,
  minValue = 1,
  bgColor,
  icon,
  onChange
}) => {
  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  return (
    <Card className={`${bgColor} transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium text-sm dark:text-white">{label}</span>
          </div>
          <span className="text-lg font-bold dark:text-white">{value} min</span>
        </div>
        
        <div className="space-y-2">
          <Slider
            value={[value]}
            onValueChange={handleValueChange}
            max={maxValue}
            min={minValue}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{minValue} min</span>
            <span>{maxValue} min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
