import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types/shared';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_CONFIG = {
  pending: { 
    label: 'Pendente', 
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
  },
  confirmed: { 
    label: 'Confirmado', 
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
  },
  preparing: { 
    label: 'Preparando', 
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
  },
  ready: { 
    label: 'Pronto', 
    className: 'bg-green-100 text-green-800 hover:bg-green-200' 
  },
  in_delivery: { 
    label: 'Em Entrega', 
    className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' 
  },
  delivered: { 
    label: 'Entregue', 
    className: 'bg-green-100 text-green-800 hover:bg-green-200' 
  },
  cancelled: { 
    label: 'Cancelado', 
    className: 'bg-red-100 text-red-800 hover:bg-red-200' 
  }
};

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  
  return (
    <Badge className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
} 