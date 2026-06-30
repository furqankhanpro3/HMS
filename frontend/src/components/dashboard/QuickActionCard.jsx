import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
};

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  href,
  color = 'primary',
  delay = 0,
}) => {
  return (
    <Link
      to={href}
      className="group block animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div 
        className="relative overflow-hidden rounded-xl border border-[#F0F0F0] bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
        style={{
          minHeight: '160px',
          padding: '20px'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Icon */}
          <div
            className={cn(
              'inline-flex rounded-lg p-2.5 transition-all duration-300 w-fit',
              colorClasses[color]
            )}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px'
            }}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="mt-4 flex-1">
            <h3 className="font-semibold text-[15px] text-[#111827] leading-tight">
              {title}
            </h3>
            <p className="mt-2 text-[12px] text-[#6B7280] line-clamp-2 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default QuickActionCard;
