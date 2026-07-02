import React from 'react';
import { icons } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  name: keyof typeof icons;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const Icon = ({ name, className, ...props }: IconProps) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    // You can render a fallback icon or null
    return null;
  }

  return <LucideIcon className={cn('transition-all', className)} {...props} />;
};

export default Icon;
