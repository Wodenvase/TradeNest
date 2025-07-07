"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Plane,
  Ship,
  Download,
  FileSpreadsheet,
  FileText,
  Navigation,
  Upload,
  Globe,
  Zap,
  TrendingUp,
  Activity,
  RefreshCw,
  Bot,
  Loader2,
  Eye,
  BarChart3,
} from 'lucide-react';
import { ExportUtils } from '@/lib/export-utils';
import { toast } from 'sonner';

interface LogisticsData {
  warehouse_id: string;
  warehouse_name: string;
  address: string;
  latitude: number;
  longitude: number;
  sku_id: string;
  hs_code: string;
  sku_description: string;
  quantity: number;
  shipment_id: string;
  shipment_status: string;
  origin: string;
  origin_latitude: number;
  origin_longitude: number;
  destination: string;
  destination_latitude: number;
  destination_longitude: number;
  carrier: string;
  eta: string;
  last_updated: string;
}

export default function Logistics() {
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logisticsData, setLogisticsData] = useState<LogisticsData[]>([]);
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
      const processedData: LogisticsData[] = csvData.map((row, index) => ({
        warehouse_id: row.warehouse_id || `WH-${index + 1}`,
        warehouse_name: row.warehouse_name || 'Unknown Warehouse',
        address: row.address || 'Address not provided',
        latitude: parseFloat(row.latitude) || 0,
        longitude: parseFloat(row.longitude) || 0,
        sku_id: row.sku_id || `SKU-${index + 1}`,
        hs_code: row.hs_code || '0000.00.00',
        sku_description: row.sku_description || 'Product description not available',
        quantity: parseInt(row.quantity) || 0,
        shipment_id: row.shipment_id || `SHP-${index + 1}`,
        shipment_status: row.shipment_status || 'pending',
        origin: row.origin || 'Unknown Origin',
        origin_latitude: parseFloat(row.origin_latitude) || 0,
        origin_longitude: parseFloat(row.origin_longitude) || 0,
        destination: row.destination || 'Unknown Destination',
        destination_latitude: parseFloat(row.destination_latitude) || 0,
        destination_longitude: parseFloat(row.destination_longitude) || 0,
        carrier: row.carrier || 'Standard Carrier',
        eta: row.eta || 'TBD',
        last_updated: row.last_updated || new Date().toISOString()
      }));

      // Step 4: Complete
      setUploadProgress(100);
      setLogisticsData(processedData);
      setShowData(true);
      
      toast.success(`Successfully processed ${processedData.length} logistics records!`);
      
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

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    
    try {
      toast.info(`Generating ${format.toUpperCase()} logistics report...`);
      
      const reportData = ExportUtils.generateLogisticsReport(logisticsData);
      
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

      toast.success(`Logistics report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export logistics data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const downloadSampleCSV = () => {
    const sampleData = `warehouse_id,warehouse_name,address,latitude,longitude,sku_id,hs_code,sku_description,quantity,shipment_id,shipment_status,origin,origin_latitude,origin_longitude,destination,destination_latitude,destination_longitude,carrier,eta,last_updated
WH-001,London Distribution Center,"123 Trade St, London, UK",51.5074,-0.1278,SKU-001,8518.30.00,Wireless Bluetooth Headphones,150,SHP-001,in-transit,London,51.5074,-0.1278,Berlin,52.5200,13.4050,DHL Express,2024-01-20 15:30,2024-01-15 14:22
WH-002,Berlin Warehouse,"456 Commerce Ave, Berlin, DE",52.5200,13.4050,SKU-002,8525.80.30,Smart Security Camera,75,SHP-002,delivered,Berlin,52.5200,13.4050,Paris,48.8566,2.3522,FedEx International,2024-01-18 12:00,2024-01-18 11:45
WH-003,Paris Hub,"789 Logistics Blvd, Paris, FR",48.8566,2.3522,SKU-003,6109.10.00,Organic Cotton T-Shirt,200,SHP-003,delayed,Paris,48.8566,2.3522,Toronto,43.6532,-79.3832,UPS Worldwide,2024-01-22 09:15,2024-01-19 08:30`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-logistics-data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Sample logistics CSV downloaded');
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
      case "in-transit":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Truck className="w-3 h-3 mr-1" />In Transit</Badge>;
      case "delayed":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Delayed</Badge>;
      case "processing":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCarrierIcon = (carrier: string) => {
    if (carrier.toLowerCase().includes('dhl')) return <Plane className="w-4 h-4 text-yellow-600" />;
    if (carrier.toLowerCase().includes('fedex')) return <Truck className="w-4 h-4 text-purple-600" />;
    if (carrier.toLowerCase().includes('ups')) return <Ship className="w-4 h-4 text-brown-600" />;
    return <Package className="w-4 h-4 text-gray-600" />;
  };

  const calculateStats = () => {
    if (logisticsData.length === 0) return { total: 0, delivered: 0, inTransit: 0, delayed: 0 };
    
    return {
      total: logisticsData.length,
      delivered: logisticsData.filter(item => item.shipment_status.toLowerCase() === 'delivered').length,
      inTransit: logisticsData.filter(item => item.shipment_status.toLowerCase() === 'in-transit').length,
      delayed: logisticsData.filter(item => item.shipment_status.toLowerCase() === 'delayed').length,
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Logistics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your logistics CSV data for comprehensive shipment tracking and warehouse management
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
            Upload Logistics CSV
          </Button>
        </div>
      </div>

      {/* CSV Upload Interface */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span>Logistics Data Upload</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Zap className="w-3 h-3 mr-1" />
              CSV Powered
            </Badge>
          </CardTitle>
          <CardDescription>
            Upload your logistics CSV file with warehouse, shipment, and tracking data for comprehensive analysis
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
                <h3 className="text-lg font-semibold mb-2">Upload Logistics CSV File</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Drag and drop your logistics CSV file here, or click to browse
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
                <span className="font-medium">Processing logistics data...</span>
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
          {showData && logisticsData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Data Loaded Successfully</span>
                </h3>
                <Button variant="outline" size="sm" onClick={() => {
                  setShowData(false);
                  setLogisticsData([]);
                }}>
                  Upload New File
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">Total Shipments</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                  <div className="text-sm text-green-800 dark:text-green-200">Delivered</div>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.inTransit}</div>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">In Transit</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.delayed}</div>
                  <div className="text-sm text-red-800 dark:text-red-200">Delayed</div>
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
          <CardDescription>Required columns for logistics data upload</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Warehouse Data:</h4>
              <ul className="space-y-1 text-sm">
                <li><code>warehouse_id</code> - Unique warehouse identifier</li>
                <li><code>warehouse_name</code> - Warehouse name</li>
                <li><code>address</code> - Full warehouse address</li>
                <li><code>latitude</code> - Warehouse latitude</li>
                <li><code>longitude</code> - Warehouse longitude</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Product Data:</h4>
              <ul className="space-y-1 text-sm">
                <li><code>sku_id</code> - Product SKU identifier</li>
                <li><code>hs_code</code> - Harmonized System code</li>
                <li><code>sku_description</code> - Product description</li>
                <li><code>quantity</code> - Available quantity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Shipment Data:</h4>
              <ul className="space-y-1 text-sm">
                <li><code>shipment_id</code> - Unique shipment ID</li>
                <li><code>shipment_status</code> - Current status</li>
                <li><code>origin</code> - Origin location</li>
                <li><code>destination</code> - Destination location</li>
                <li><code>carrier</code> - Shipping carrier</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Tracking Data:</h4>
              <ul className="space-y-1 text-sm">
                <li><code>origin_latitude</code> - Origin coordinates</li>
                <li><code>origin_longitude</code> - Origin coordinates</li>
                <li><code>destination_latitude</code> - Destination coordinates</li>
                <li><code>destination_longitude</code> - Destination coordinates</li>
                <li><code>eta</code> - Estimated time of arrival</li>
                <li><code>last_updated</code> - Last update timestamp</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logistics Data Table */}
      {showData && logisticsData.length > 0 && (
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Logistics Data Overview</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <RefreshCw className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive view of your uploaded logistics data with shipment tracking and warehouse information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logisticsData.slice(0, 10).map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="font-mono text-sm">{item.shipment_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.sku_description}</div>
                          <div className="text-xs text-gray-500">SKU: {item.sku_id}</div>
                          <div className="text-xs text-gray-500">HS: {item.hs_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.warehouse_name}</div>
                          <div className="text-xs text-gray-500">{item.warehouse_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{item.origin}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm">{item.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getCarrierIcon(item.carrier)}
                          <span className="text-sm">{item.carrier}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.shipment_status)}</TableCell>
                      <TableCell className="font-medium">{item.quantity}</TableCell>
                      <TableCell className="text-sm">{item.eta}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {logisticsData.length > 10 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing 10 of {logisticsData.length} records. Export data to view all records.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}