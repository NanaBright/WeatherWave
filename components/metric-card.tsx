import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { type LucideProps } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  iconName: LucideProps['name'];
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, iconName, className }) => {
  return (
    <Card variant="glass" className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/80">{title}</CardTitle>
        <Icon name={iconName} className="h-4 w-4 text-white/60" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {value}
          {unit && <span className="text-sm font-normal text-white/80 ml-1">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
