import React from 'react';
import { cn } from '@/lib/utils';
import { BookingStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'green' | 'red' | 'yellow' | 'gray' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'orange', className }) => {
  const variantStyles = {
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    red: 'bg-rose-100 text-rose-800 border-rose-200',
    yellow: 'bg-amber-100 text-amber-800 border-amber-200',
    gray: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    outline: 'border border-zinc-300 text-zinc-700 bg-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  switch (status) {
    case 'APPROVED':
      return <Badge variant="green">Disetujui (ACC)</Badge>;
    case 'PENDING':
      return <Badge variant="yellow">Menunggu ACC</Badge>;
    case 'REJECTED':
      return <Badge variant="red">Ditolak</Badge>;
    case 'CANCELLED':
      return <Badge variant="gray">Dibatalkan</Badge>;
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
};

