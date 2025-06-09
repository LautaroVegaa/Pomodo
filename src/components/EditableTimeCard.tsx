
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";

interface EditableTimeCardProps {
  label: string;
  value: number;
  maxValue: number;
  bgColor: string;
  onSave: (newValue: number) => void;
}

export const EditableTimeCard: React.FC<EditableTimeCardProps> = ({
  label,
  value,
  maxValue,
  bgColor,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const handleSave = () => {
    const newValue = parseInt(tempValue);
    if (newValue >= 1 && newValue <= maxValue) {
      onSave(newValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempValue(value.toString());
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className={`${bgColor} cursor-pointer transition-all hover:shadow-md`}>
        <CardContent className="text-center p-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Select value={tempValue} onValueChange={setTempValue}>
              <SelectTrigger className="w-20 bg-white dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxValue }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm font-medium dark:text-white">min</span>
          </div>
          <div className="flex justify-center space-x-2">
            <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`${bgColor} cursor-pointer transition-all hover:shadow-md hover:scale-105`}
      onClick={() => setIsEditing(true)}
    >
      <CardContent className="text-center p-4">
        <p className="font-semibold dark:text-white">{value} min</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Click to edit</p>
      </CardContent>
    </Card>
  );
};
