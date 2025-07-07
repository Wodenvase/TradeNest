"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Plus,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Grid3X3,
  BarChart3,
  Activity,
  Map,
  Table,
  Zap,
} from 'lucide-react';
import { WidgetConfig } from './dashboard-widget';

interface DashboardCustomizerProps {
  widgets: WidgetConfig[];
  onAddWidget: (widget: Partial<WidgetConfig>) => void;
  onToggleWidget: (id: string) => void;
  onResetLayout: () => void;
  onSaveLayout: () => void;
}

const WIDGET_TEMPLATES = [
  {
    id: 'orders-metric',
    title: 'Total Orders',
    type: 'metric' as const,
    icon: BarChart3,
    description: 'Track total order count and trends',
  },
  {
    id: 'revenue-metric',
    title: 'Revenue',
    type: 'metric' as const,
    icon: Zap,
    description: 'Monitor revenue metrics and growth',
  },
  {
    id: 'activity-feed',
    title: 'Activity Feed',
    type: 'activity' as const,
    icon: Activity,
    description: 'Recent system activities and events',
  },
  {
    id: 'compliance-chart',
    title: 'Compliance Overview',
    type: 'chart' as const,
    icon: BarChart3,
    description: 'Compliance metrics and progress',
  },
  {
    id: 'shipment-map',
    title: 'Shipment Map',
    type: 'map' as const,
    icon: Map,
    description: 'Global shipment tracking visualization',
  },
  {
    id: 'inventory-table',
    title: 'Inventory Status',
    type: 'table' as const,
    icon: Table,
    description: 'Current inventory levels and alerts',
  },
];

export function DashboardCustomizer({
  widgets,
  onAddWidget,
  onToggleWidget,
  onResetLayout,
  onSaveLayout,
}: DashboardCustomizerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newWidgetSize, setNewWidgetSize] = useState<WidgetConfig['size']>('medium');

  const handleAddWidget = () => {
    const template = WIDGET_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    const newWidget: Partial<WidgetConfig> = {
      id: `${template.id}-${Date.now()}`,
      title: template.title,
      type: template.type,
      size: newWidgetSize,
      position: { x: 0, y: 0 },
      visible: true,
    };

    onAddWidget(newWidget);
    setSelectedTemplate('');
  };

  const visibleWidgets = widgets.filter(w => w.visible);
  const hiddenWidgets = widgets.filter(w => !w.visible);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Customize Dashboard
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Dashboard Customization</SheetTitle>
          <SheetDescription>
            Add, remove, and configure your dashboard widgets to match your workflow.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Add New Widget */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add New Widget</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="widget-template">Widget Type</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a widget type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WIDGET_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center space-x-2">
                          <template.icon className="w-4 h-4" />
                          <span>{template.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="widget-size">Initial Size</Label>
                <Select value={newWidgetSize} onValueChange={(value: WidgetConfig['size']) => setNewWidgetSize(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1x1)</SelectItem>
                    <SelectItem value="medium">Medium (2x1)</SelectItem>
                    <SelectItem value="large">Large (2x2)</SelectItem>
                    <SelectItem value="xlarge">X-Large (3x2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAddWidget} 
                disabled={!selectedTemplate}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            </div>
          </div>

          {/* Current Widgets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Current Widgets</h3>
              <Badge variant="outline">{visibleWidgets.length} visible</Badge>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={widget.visible}
                        onCheckedChange={() => onToggleWidget(widget.id)}
                      />
                      {widget.visible ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{widget.title}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {widget.type} • {widget.size}
                      </p>
                    </div>
                  </div>
                  <Badge variant={widget.visible ? "default" : "secondary"}>
                    {widget.visible ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Layout Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={onResetLayout}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Layout
              </Button>
              <Button onClick={onSaveLayout}>
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </Button>
            </div>
          </div>

          {/* Layout Presets */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Layouts</h3>
            
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="justify-start">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Executive Overview
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics Focus
              </Button>
              <Button variant="outline" className="justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Operations Monitor
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Customization Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Drag widgets to reposition them</li>
              <li>• Use the widget menu to resize</li>
              <li>• Hide widgets you don't need</li>
              <li>• Save your layout for future sessions</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}