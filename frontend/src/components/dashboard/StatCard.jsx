import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  delay = 0,
  href,
}) => {
  const CardContent = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-white border border-[#F0F0F0] shadow-sm transition-all duration-300 hover:shadow-md animate-slide-up',
        href && 'cursor-pointer hover:border-primary/30',
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        minHeight: '140px',
        padding: '24px'
      }}
    >
      <div className="relative flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[13px] font-medium text-[#6B7280]">{title}</p>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-auto">
          <p className="font-display text-[32px] font-bold text-foreground leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="mt-2 text-[13px] text-[#6B7280]">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{CardContent}</Link>;
  }

  return CardContent;
};

export default StatCard;
