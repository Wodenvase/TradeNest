"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Download,
  Upload,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle,
  Bot,
  Loader2,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Eye,
  BarChart3,
} from 'lucide-react';
import { ExportUtils } from '@/lib/export-utils';
import { toast } from 'sonner';

interface InventoryItem {
  sku: string;
  productName: string;
  category: string;
  availability: number;
  hsCode: string;
  price: number;
  marketDemand: string;
  warehouse: string;
  status: string;
  aiActions: string;
}

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [showData, setShowData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Read CSV file
      setUploadProgress(20);
      const csvText = await file.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Step 2: Parse CSV data
      setUploadProgress(50);
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const csvData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      // Step 3: Process and validate data
      setUploadProgress(80);
      const processedData: InventoryItem[] = csvData.map((row, index) => {
        const availability = parseInt(row.Availability || row.availability || '0');
        let status = 'in-stock';
        if (availability === 0) status = 'out-of-stock';
        else if (availability < 20) status = 'low-stock';

        return {
          sku: row.SKU || row.sku || `SKU-${index + 1}`,
          productName: row['Product Name'] || row.productName || row.name || 'Unknown Product',
          category: row.Category || row.category || 'General',
          availability: availability,
          hsCode: row['HS Code'] || row.hsCode || row.hs_code || '0000.00.00',
          price: parseFloat(row.Price || row.price || '0'),
          marketDemand: row['Market Demand'] || row.marketDemand || row.market_demand || 'medium',
          warehouse: row.Warehouse || row.warehouse || 'Main Warehouse',
          status: row.Status || row.status || status,
          aiActions: row['AI Actions'] || row.aiActions || 'pending'
        };
      });

      // Step 4: Complete
      setUploadProgress(100);
      setInventoryData(processedData);
      setShowData(true);
      
      // Store in localStorage for other components to access
      localStorage.setItem('inventory-data', JSON.stringify(processedData));
      
      toast.success(`Successfully processed ${processedData.length} inventory items!`);
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error(`Failed to process CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 3000);
    }
  };

  const filteredInventory = inventoryData.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    
    try {
      toast.info(`Generating ${format.toUpperCase()} inventory report...`);
      
      const reportData = ExportUtils.generateInventoryReport(filteredInventory);
      
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

      toast.success(`Inventory report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export inventory data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const downloadSampleCSV = () => {
    const sampleData = `SKU,Product Name,Category,Availability,HS Code,Price,Market Demand,Warehouse,Status,AI Actions
WBH-001,Wireless Bluetooth Headphones,Electronics,150,8518.30.00,149.99,high,UK-LON-01,in-stock,completed
SHC-002,Smart Home Camera,Electronics,75,8525.80.30,299.99,high,DE-BER-01,in-stock,completed
OCT-003,Organic Cotton T-Shirt,Textiles,200,6109.10.00,29.99,medium,FR-PAR-01,in-stock,pending
FT-004,Fitness Tracker,Electronics,120,9102.11.00,199.99,high,US-NYC-01,in-stock,completed
GL-005,Gaming Laptop,Electronics,45,8471.30.01,1299.99,high,CA-TOR-01,low-stock,completed`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-inventory.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Sample inventory CSV downloaded');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />In Stock</Badge>;
      case "low-stock":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Low Stock</Badge>;
      case "out-of-stock":
        return <Badge variant="destructive"><Package className="w-3 h-3 mr-1" />Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMarketDemandBadge = (demand: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge variant="secondary" className={colors[demand as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        <TrendingUp className="w-3 h-3 mr-1" />
        {demand.charAt(0).toUpperCase() + demand.slice(1)}
      </Badge>
    );
  };

  const getAIActionsBadge = (action: string) => {
    switch (action) {
      case "completed":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><Bot className="w-3 h-3 mr-1" />AI Ready</Badge>;
      case "pending":
        return <Badge variant="outline"><Loader2 className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const calculateStats = () => {
    if (inventoryData.length === 0) return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, aiCompleted: 0 };
    
    return {
      total: inventoryData.length,
      inStock: inventoryData.filter(item => item.status === 'in-stock').length,
      lowStock: inventoryData.filter(item => item.status === 'low-stock').length,
      outOfStock: inventoryData.filter(item => item.status === 'out-of-stock').length,
      aiCompleted: inventoryData.filter(item => item.aiActions === 'completed').length,
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI-Powered Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your inventory CSV for intelligent product analysis and real-time tracking
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
          {showData && (
            <div className="flex items-center space-x-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-1" />
                )}
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('excel')}
                disabled={isExporting}
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                )}
                Excel
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                PDF
              </Button>
            </div>
          )}
          <Button onClick={triggerFileUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Inventory CSV
          </Button>
        </div>
      </div>

      {/* CSV Upload Interface */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span>Inventory Data Upload</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <BarChart3 className="w-3 h-3 mr-1" />
              CSV Powered
            </Badge>
          </CardTitle>
          <CardDescription>
            Upload your inventory CSV file for comprehensive product analysis and AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showData && (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={triggerFileUpload}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-semibold mb-2">Upload Inventory CSV File</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Drag and drop your inventory CSV file here, or click to browse
                </p>
                <Button>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Choose CSV File
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                <span className="text-sm text-gray-500">or</span>
                <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
              </div>

              <div className="text-center">
                <Button variant="outline" onClick={downloadSampleCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample CSV
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Download a sample CSV file to see the expected format
                </p>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="font-medium">Processing inventory data...</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-3" />
              </div>
            </div>
          )}

          {/* Results Summary */}
          {showData && inventoryData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Data Loaded Successfully</span>
                </h3>
                <Button variant="outline" size="sm" onClick={() => {
                  setShowData(false);
                  setInventoryData([]);
                  localStorage.removeItem('inventory-data');
                }}>
                  Upload New File
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">Total SKUs</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
                  <div className="text-sm text-green-800 dark:text-green-200">In Stock</div>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">Low Stock</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
                  <div className="text-sm text-red-800 dark:text-red-200">Out of Stock</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.aiCompleted}</div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">AI Ready</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSV Format Guide */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span>CSV Format Requirements</span>
          </CardTitle>
          <CardDescription>Required columns for inventory data upload</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Required Columns:</h4>
              <ul className="space-y-1 text-sm">
                <li><code>SKU</code> - Stock keeping unit identifier</li>
                <li><code>Product Name</code> - Full product name</li>
                <li><code>Category</code> - Product category</li>
                <li><code>Availability</code> - Current stock quantity</li>
                <li><code>HS Code</code> - Harmonized System code</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Optional Columns:</h4>
              <ul className="space-y-1 text-sm">
                <li><code>Price</code> - Product price</li>
                <li><code>Market Demand</code> - high/medium/low</li>
                <li><code>Warehouse</code> - Warehouse location</li>
                <li><code>Status</code> - Stock status</li>
                <li><code>AI Actions</code> - AI processing status</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Data Table */}
      {showData && inventoryData.length > 0 && (
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Inventory Overview</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <RefreshCw className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive view of your uploaded inventory data with AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.from(new Set(inventoryData.map(item => item.category))).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>HS Code</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Market Demand</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AI Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.slice(0, 20).map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={item.availability < 20 ? "text-red-600 font-medium" : ""}>
                          {item.availability} units
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.hsCode}</TableCell>
                      <TableCell>
                        {item.price > 0 && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3 text-green-600" />
                            <span className="font-medium">${item.price}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getMarketDemandBadge(item.marketDemand)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{item.warehouse}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{getAIActionsBadge(item.aiActions)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredInventory.length > 20 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing 20 of {filteredInventory.length} records. Use filters or export to view all data.
                </p>
              </div>
            )}

            {filteredInventory.length === 0 && inventoryData.length > 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No items match your current filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}