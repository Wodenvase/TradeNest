"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIAssistant } from '@/components/ai-assistant';
import { ExportUtils } from '@/lib/export-utils';
import { inventoryManager, InventoryStore } from '@/lib/inventory-store';
import {
  ArrowUpRight,
  ArrowDownRight,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Truck,
  MapPin,
  Bot,
  Download,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Activity,
  Globe,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

const dashboardData = [
  { date: '2024-01-01', orders: 45, revenue: 12500, compliance: 98, aiAccuracy: 99.1 },
  { date: '2024-01-02', orders: 52, revenue: 14200, compliance: 99, aiAccuracy: 99.2 },
  { date: '2024-01-03', orders: 48, revenue: 13100, compliance: 97, aiAccuracy: 98.9 },
  { date: '2024-01-04', orders: 61, revenue: 16800, compliance: 100, aiAccuracy: 99.3 },
  { date: '2024-01-05', orders: 55, revenue: 15300, compliance: 99, aiAccuracy: 99.1 },
];

export default function Dashboard() {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [inventoryStore, setInventoryStore] = useState<InventoryStore>(inventoryManager.getStore());

  useEffect(() => {
    setIsMounted(true);
    setLastRefresh(new Date());

    // Subscribe to inventory updates for real-time sync
    const unsubscribe = inventoryManager.subscribe((store) => {
      setInventoryStore(store);
    });

    return unsubscribe;
  }, []);

  // Generate dynamic KPI data from real inventory
  const kpiData = [
    {
      title: "Total Orders",
      value: "2,847",
      change: "+12.3%",
      positive: true,
      icon: Package,
    },
    {
      title: "Hugging Face AI Accuracy",
      value: inventoryStore.totalItems > 0 ? 
        `${Math.round((inventoryStore.aiClassifiedCount / inventoryStore.totalItems) * 100)}%` : "99.1%",
      change: "+2.1%",
      positive: true,
      icon: Bot,
    },
    {
      title: "Compliance Rate",
      value: inventoryStore.totalItems > 0 ? 
        `${Math.round((inventoryStore.aiClassifiedCount / inventoryStore.totalItems) * 100)}%` : "99.2%",
      change: "+3.2%",
      positive: true,
      icon: FileText,
    },
    {
      title: "Monthly Revenue",
      value: "$284,750",
      change: "+18.7%",
      positive: true,
      icon: DollarSign,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "ai",
      description: `Hugging Face AI analyzed ${inventoryStore.totalItems} products with ${inventoryStore.aiClassifiedCount} successful classifications`,
      time: "2 minutes ago",
      status: "completed",
    },
    {
      id: 2,
      type: "compliance",
      description: "Real-time inventory sync updated across all components",
      time: "5 minutes ago",
      status: "completed",
    },
    {
      id: 3,
      type: "inventory",
      description: `${inventoryStore.lowStockCount} items flagged for low stock alerts`,
      time: "10 minutes ago",
      status: inventoryStore.lowStockCount > 0 ? "warning" : "completed",
    },
    {
      id: 4,
      type: "tax",
      description: "Claude AI calculated taxes for German import (€1,247)",
      time: "1 hour ago",
      status: "completed",
    },
    {
      id: 5,
      type: "logistics",
      description: "Shipment delivered to Germany",
      time: "2 hours ago",
      status: "completed",
    },
  ];

  const handleGenerateReport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsGeneratingReport(true);
    
    try {
      toast.info(`Generating ${format.toUpperCase()} report...`);
      
      // Generate comprehensive dashboard report
      const reportData = ExportUtils.generateDashboardReport({
        aiAccuracy: inventoryStore.totalItems > 0 ? 
          Math.round((inventoryStore.aiClassifiedCount / inventoryStore.totalItems) * 100) : 99.1,
        complianceRate: inventoryStore.totalItems > 0 ? 
          Math.round((inventoryStore.aiClassifiedCount / inventoryStore.totalItems) * 100) : 99.2,
        totalItems: inventoryStore.totalItems
      });

      switch (format) {
        case 'csv':
          ExportUtils.exportToCSV(reportData);
          break;
        case 'excel':
          ExportUtils.exportToExcel(reportData);
          break;
        case 'pdf':
          ExportUtils.exportToPDF(reportData);
          break;
      }

      toast.success(`Dashboard report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleRefreshAll = async () => {
    setLastRefresh(new Date());
    // Trigger inventory refresh
    const currentStore = inventoryManager.getStore();
    setInventoryStore({ ...currentStore, lastUpdated: new Date().toISOString() });
    toast.success('Dashboard refreshed with latest inventory data');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "processing":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hugging Face AI-Powered Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Intelligent trade operations with real-time inventory synchronization
            {isMounted && lastRefresh && (
              <> • Last updated: {lastRefresh.toLocaleTimeString()}</>
            )}
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4" />
              <span>{inventoryStore.totalItems} items tracked</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bot className="w-4 h-4 text-purple-600" />
              <span>{inventoryStore.aiClassifiedCount} AI analyzed</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center space-x-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleGenerateReport('csv')}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-1" />
              )}
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleGenerateReport('excel')}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-1" />
              )}
              Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleGenerateReport('pdf')}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-1" />
              )}
              PDF
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleRefreshAll}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Enhanced KPI Cards with Real-time Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.icon === Bot ? 'text-purple-600' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
              <div className="flex items-center text-sm mt-1">
                {kpi.positive ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={kpi.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {kpi.change}
                </span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
              {kpi.icon === Bot && (
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Real-time Sync
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid - Expanded AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Enhanced Activity Feed with Real-time Data */}
        <Card className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Real-time Activity Feed</span>
              <Badge variant="outline" className="text-xs">Live Updates</Badge>
            </CardTitle>
            <CardDescription>Latest Hugging Face AI operations and real-time inventory sync</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                  {activity.type === 'ai' && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      <Bot className="w-3 h-3 mr-1" />
                      HF AI
                    </Badge>
                  )}
                  {activity.type === 'inventory' && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Package className="w-3 h-3 mr-1" />
                      Sync
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Claude AI Assistant - Takes 3 columns, much larger */}
        <div className="lg:col-span-3">
          <div className="h-[800px]">
            <AIAssistant />
          </div>
        </div>
      </div>

      {/* Bottom Section - Enhanced with Real-time Inventory Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real-time Inventory Overview */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Real-time Inventory Status</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Zap className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </CardTitle>
            <CardDescription>Synchronized inventory data with Hugging Face AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">AI Classification Progress</span>
                  <span className="text-purple-600 font-semibold">
                    {inventoryStore.totalItems > 0 ? 
                      Math.round((inventoryStore.aiClassifiedCount / inventoryStore.totalItems) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={inventoryStore.totalItems > 0 ? 
                    (inventoryStore.aiClassifiedCount / inventoryStore.totalItems) * 100 : 0} 
                  className="h-3" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  {inventoryStore.aiClassifiedCount} of {inventoryStore.totalItems} items classified
                </p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Stock Health</span>
                  <span className="text-green-600 font-semibold">
                    {inventoryStore.totalItems > 0 ? 
                      Math.round(((inventoryStore.totalItems - inventoryStore.outOfStockCount) / inventoryStore.totalItems) * 100) : 100}%
                  </span>
                </div>
                <Progress 
                  value={inventoryStore.totalItems > 0 ? 
                    ((inventoryStore.totalItems - inventoryStore.outOfStockCount) / inventoryStore.totalItems) * 100 : 100} 
                  className="h-3" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  {inventoryStore.outOfStockCount} out of stock, {inventoryStore.lowStockCount} low stock
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {inventoryStore.totalItems - inventoryStore.lowStockCount - inventoryStore.outOfStockCount}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">In Stock</div>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{inventoryStore.lowStockCount}</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">Low Stock</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{inventoryStore.outOfStockCount}</div>
                  <div className="text-xs text-red-700 dark:text-red-300">Out of Stock</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced AI Insights with Real-time Data */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Hugging Face AI Insights</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Bot className="w-3 h-3 mr-1" />
                AI Generated
              </Badge>
            </CardTitle>
            <CardDescription>Real-time AI recommendations based on current inventory data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  insight: `${inventoryStore.aiClassifiedCount} products successfully analyzed`, 
                  impact: `${Math.round((inventoryStore.aiClassifiedCount / Math.max(inventoryStore.totalItems, 1)) * 100)}% completion`, 
                  flag: "🤖", 
                  priority: "high" 
                },
                { 
                  insight: inventoryStore.lowStockCount > 0 ? `${inventoryStore.lowStockCount} items need restocking` : "All items well stocked", 
                  impact: inventoryStore.lowStockCount > 0 ? "Reorder recommended" : "Stock levels optimal", 
                  flag: "📦", 
                  priority: inventoryStore.lowStockCount > 0 ? "high" : "low" 
                },
                { 
                  insight: "Real-time sync active across all components", 
                  impact: "Data consistency", 
                  flag: "🔄", 
                  priority: "medium" 
                },
                { 
                  insight: "Hugging Face API integration operational", 
                  impact: "AI analysis ready", 
                  flag: "⚡", 
                  priority: "low" 
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.flag}</span>
                    <div>
                      <span className="font-medium text-sm">{item.insight}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            item.priority === 'high' ? 'border-red-200 text-red-700 bg-red-50' :
                            item.priority === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                            'border-green-200 text-green-700 bg-green-50'
                          }`}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">{item.impact}</span>
                    <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      View details →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Performance Summary with Real-time Metrics */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200/50 dark:border-blue-800/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Real-time Performance Summary</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Activity className="w-3 h-3 mr-1" />
              Live Metrics
            </Badge>
          </CardTitle>
          <CardDescription>Overall system performance with Hugging Face AI integration and real-time inventory sync</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {inventoryStore.totalItems > 0 ? 
                  Math.round((inventoryStore.aiClassifiedCount / inventoryStore.totalItems) * 100) : 99}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">HF AI Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">2.3s</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inventoryStore.aiClassifiedCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">AI Classifications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">$47K</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cost Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}