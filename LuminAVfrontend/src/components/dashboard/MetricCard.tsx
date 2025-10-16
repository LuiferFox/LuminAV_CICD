import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className
}) => {
  return (
    <Card className={cn("gradient-card shadow-card transition-smooth hover:shadow-energy", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend !== undefined && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-sm",
                trend >= 0 ? "text-success" : "text-destructive"
              )}>
                <span>{trend >= 0 ? '+' : ''}{trend}%</span>
                <span className="text-muted-foreground">vs mes anterior</span>
              </div>
            )}
          </div>
          <div className="p-3 gradient-primary rounded-full shadow-energy">
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};