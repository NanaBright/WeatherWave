import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { icons } from 'lucide-react';

interface WeatherCardProps {
  day: string;
  highTemp: number;
  lowTemp: number;
  iconName: keyof typeof icons;
  className?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ day, highTemp, lowTemp, iconName, className }) => {
  return (
    <Card variant="interactive" className={className}>
      <CardContent className="flex flex-col items-center justify-center p-4 text-center">
        <div className="text-lg font-semibold">{day}</div>
        <Icon name={iconName} size={48} className="my-2 text-primary" />
        <div className="flex gap-2">
          <span className="font-bold">{highTemp}°</span>
          <span className="text-muted-foreground">{lowTemp}°</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;

