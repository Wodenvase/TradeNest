"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MoreVertical,
  Maximize2,
  Minimize2,
  X,
  Settings,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface WidgetConfig {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'activity' | 'map' | 'custom';
  size: 'small' | 'medium' | 'large' | 'xlarge';
  position: { x: number; y: number };
  visible: boolean;
  refreshInterval?: number;
  data?: any;
}

interface DashboardWidgetProps {
  config: WidgetConfig;
  onResize?: (id: string, size: WidgetConfig['size']) => void;
  onRemove?: (id: string) => void;
  onRefresh?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  children: React.ReactNode;
  isResizing?: boolean;
  className?: string;
}

export function DashboardWidget({
  config,
  onResize,
  onRemove,
  onRefresh,
  onToggleVisibility,
  children,
  isResizing = false,
  className = '',
}: DashboardWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getSizeClasses = (size: WidgetConfig['size']) => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1 min-h-[200px]';
      case 'medium':
        return 'col-span-2 row-span-1 min-h-[250px]';
      case 'large':
        return 'col-span-2 row-span-2 min-h-[400px]';
      case 'xlarge':
        return 'col-span-3 row-span-2 min-h-[500px]';
      default:
        return 'col-span-1 row-span-1 min-h-[200px]';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh(config.id);
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleResize = (newSize: WidgetConfig['size']) => {
    if (onResize) {
      onResize(config.id, newSize);
    }
  };

  if (!config.visible) {
    return null;
  }

  return (
    <Card 
      className={`
        ${getSizeClasses(config.size)} 
        ${isExpanded ? 'fixed inset-4 z-50 shadow-2xl' : ''} 
        ${isResizing ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} 
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 
        transition-all duration-300 hover:shadow-lg group
        ${className}
      `}
    >
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
            {config.type === 'metric' && (
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleResize('small')}>
                  Small (1x1)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleResize('medium')}>
                  Medium (2x1)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleResize('large')}>
                  Large (2x2)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleResize('xlarge')}>
                  X-Large (3x2)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleVisibility?.(config.id)}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Widget
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRemove?.(config.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Widget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        {children}
      </CardContent>
    </Card>
  );
}

// Metric Widget Component
export function MetricWidget({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon,
  color = 'blue' 
}: {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: any;
  color?: string;
}) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        {Icon && <Icon className={`h-5 w-5 text-${color}-600`} />}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {change && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-sm ${getTrendColor()}`}>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Chart Widget Component
export function ChartWidget({ 
  title, 
  description, 
  children 
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 h-full">
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}

// Activity Widget Component
export function ActivityWidget({ 
  activities 
}: {
  activities: Array<{
    id: string;
    type: string;
    description: string;
    time: string;
    status: 'success' | 'warning' | 'error' | 'info';
  }>;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-white">Recent Activity</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Progress Widget Component
export function ProgressWidget({ 
  items 
}: {
  items: Array<{
    label: string;
    value: number;
    total: number;
    color?: string;
  }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-white">Progress Overview</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="font-medium">{item.value}/{item.total}</span>
            </div>
            <Progress 
              value={(item.value / item.total) * 100} 
              className="h-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
}