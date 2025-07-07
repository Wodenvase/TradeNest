"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Download, Eye, Plus, CheckCircle, Clock, AlertCircle, Bot, Loader2, FileSpreadsheet, RefreshCw, Package, Shield, FolderSync as Sync } from 'lucide-react';
import { toast } from 'sonner';
import { TradeAI, ComplianceDocument } from '@/lib/claude';
import { ExportUtils } from '@/lib/export-utils';

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

export default function Compliance() {
  const [formData, setFormData] = useState({
    documentType: '',
    destination: '',
    incoterm: '',
    orderValue: '',
    currency: 'USD',
    description: '',
    selectedProduct: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<ComplianceDocument | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [selectedProductData, setSelectedProductData] = useState<InventoryItem | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    // Load inventory data from localStorage
    const loadInventoryData = () => {
      try {
        const storedData = localStorage.getItem('inventory-data');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setInventoryData(parsedData);
        }
      } catch (error) {
        console.error('Error loading inventory data:', error);
      }
    };

    loadInventoryData();

    // Generate sample compliance documents
    const sampleDocuments = [
      {
        id: 1,
        type: "Commercial Invoice",
        destination: "Germany",
        orderRef: "ORD-2024-001",
        status: "completed",
        createdDate: "2024-01-15",
        complianceRisk: "low",
        productName: "Wireless Bluetooth Headphones"
      },
      {
        id: 2,
        type: "Certificate of Origin",
        destination: "France",
        orderRef: "ORD-2024-002",
        status: "pending",
        createdDate: "2024-01-16",
        complianceRisk: "medium",
        productName: "Smart Home Camera"
      }
    ];
    setDocuments(sampleDocuments);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    // When product is selected, auto-fill HS code and other details
    if (field === 'selectedProduct' && value) {
      const product = inventoryData.find(item => item.sku === value);
      if (product) {
        setSelectedProductData(product);
        setFormData(prev => ({
          ...prev,
          description: product.productName
        }));
      }
    }
  };

  const handleGenerateDocument = async () => {
    if (!formData.documentType || !formData.destination || !formData.selectedProduct) {
      toast.error("Please fill in required fields");
      return;
    }

    if (!selectedProductData) {
      toast.error("Please select a valid product from inventory");
      return;
    }

    setIsGenerating(true);
    
    try {
      const productDetails = {
        name: selectedProductData.productName,
        description: formData.description,
        category: selectedProductData.category,
        hsCode: selectedProductData.hsCode,
        price: selectedProductData.price,
        sku: selectedProductData.sku,
        incoterm: formData.incoterm,
        currency: formData.currency,
      };

      const document = await TradeAI.generateComplianceDocument(
        formData.documentType,
        productDetails,
        formData.destination,
        parseFloat(formData.orderValue) || selectedProductData.price
      );

      setGeneratedDocument(document);
      toast.success("Document generated successfully with Claude AI!");
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error("Failed to generate document. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    
    try {
      toast.info(`Generating ${format.toUpperCase()} compliance report...`);
      
      const reportData = ExportUtils.generateComplianceReport(documents);
      
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

      toast.success(`Compliance report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export compliance data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const refreshData = () => {
    // Reload inventory data
    const storedData = localStorage.getItem('inventory-data');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setInventoryData(parsedData);
      toast.success('Inventory data synced successfully');
    } else {
      toast.info('No inventory data found. Please upload inventory CSV first.');
    }
  };

  const handleDownloadDocument = () => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedDocument.type.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Document downloaded successfully');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "error":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge variant="secondary" className={colors[risk as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        <Shield className="w-3 h-3 mr-1" />
        {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Compliance & Documentation</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate intelligent trade documents with AI-powered compliance and inventory synchronization
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4" />
              <span>{inventoryData.length} products available</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>{documents.length} documents</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
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
          <Button variant="outline" size="sm" onClick={refreshData}>
            <Sync className="w-4 h-4 mr-2" />
            Sync Inventory
          </Button>
        </div>
      </div>

      {/* Inventory Sync Status */}
      {inventoryData.length === 0 && (
        <Card className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">No Inventory Data Found</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please upload your inventory CSV file first to enable product selection for compliance documents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Overview Cards with Real-time Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
                <p className="text-xs text-gray-500">Real-time sync</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Generated</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documents.filter(doc => doc.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-500">Claude AI powered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processing</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documents.filter(doc => doc.status === 'pending').length}
                </p>
                <p className="text-xs text-gray-500">In progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Products Available</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventoryData.length}</p>
                <p className="text-xs text-gray-500">From inventory</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claude AI Document Generator */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span>Claude AI Document Generator</span>
              {inventoryData.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Sync className="w-3 h-3 mr-1" />
                  Synced
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Generate compliant trade documents with Claude AI using your inventory data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select value={formData.documentType} onValueChange={(value) => handleInputChange('documentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial-invoice">Commercial Invoice</SelectItem>
                    <SelectItem value="lut">Letter of Undertaking (LUT)</SelectItem>
                    <SelectItem value="import-export">Import/Export Declaration</SelectItem>
                    <SelectItem value="certificate-origin">Certificate of Origin</SelectItem>
                    <SelectItem value="packing-list">Packing List</SelectItem>
                    <SelectItem value="bill-of-lading">Bill of Lading</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination Country</Label>
                <Select value={formData.destination} onValueChange={(value) => handleInputChange('destination', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="Netherlands">Netherlands</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selectedProduct">Select Product from Inventory</Label>
              <Select 
                value={formData.selectedProduct} 
                onValueChange={(value) => handleInputChange('selectedProduct', value)}
                disabled={inventoryData.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={inventoryData.length === 0 ? "No inventory data available" : "Choose a product"} />
                </SelectTrigger>
                <SelectContent>
                  {inventoryData.map((product) => (
                    <SelectItem key={product.sku} value={product.sku}>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs">{product.sku}</span>
                        <span>-</span>
                        <span>{product.productName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {inventoryData.length === 0 && (
                <p className="text-xs text-red-500">Upload inventory CSV to enable product selection</p>
              )}
            </div>

            {/* Product Details Display */}
            {selectedProductData && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Selected Product Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-blue-600">SKU:</span> {selectedProductData.sku}</div>
                  <div><span className="text-blue-600">HS Code:</span> {selectedProductData.hsCode}</div>
                  <div><span className="text-blue-600">Category:</span> {selectedProductData.category}</div>
                  <div><span className="text-blue-600">Price:</span> ${selectedProductData.price}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incoterm">Incoterm</Label>
                <Select value={formData.incoterm} onValueChange={(value) => handleInputChange('incoterm', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select incoterm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dap">DAP (Delivered at Place)</SelectItem>
                    <SelectItem value="ddp">DDP (Delivered Duty Paid)</SelectItem>
                    <SelectItem value="fob">FOB (Free on Board)</SelectItem>
                    <SelectItem value="cif">CIF (Cost, Insurance, Freight)</SelectItem>
                    <SelectItem value="exw">EXW (Ex Works)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderValue">Order Value</Label>
                <Input
                  id="orderValue"
                  placeholder={selectedProductData ? `Default: $${selectedProductData.price}` : "0.00"}
                  type="number"
                  value={formData.orderValue}
                  onChange={(e) => handleInputChange('orderValue', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Details</Label>
              <Textarea
                id="description"
                placeholder="Additional product details, special requirements, or notes..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleGenerateDocument} 
              className="w-full" 
              disabled={isGenerating || !formData.selectedProduct}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claude AI Generating Document...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2" />
                  Generate with Claude AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Document Preview */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle>Claude AI Generated Document</CardTitle>
            <CardDescription>Preview your Claude AI-generated compliance document</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedDocument ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-200">{generatedDocument.type}</h3>
                  <p className="text-sm text-green-600 dark:text-green-300">Generated with Claude AI compliance verification</p>
                  {selectedProductData && (
                    <p className="text-xs text-green-500 mt-1">Product: {selectedProductData.productName} (SKU: {selectedProductData.sku})</p>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded border text-sm">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {generatedDocument.content}
                  </pre>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Requirements:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {generatedDocument.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1" onClick={handleDownloadDocument}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Full Preview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Select a product and generate a document to see Claude AI-powered preview
                </p>
                <Button variant="outline" disabled>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Documents Table with Real-time Data */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Document Management</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <RefreshCw className="w-3 h-3 mr-1" />
              Live Sync
            </Badge>
          </CardTitle>
          <CardDescription>Track and manage your AI-generated trade documents with inventory synchronization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Order Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Compliance Risk</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.type}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{doc.productName}</div>
                        <div className="text-xs text-gray-500">From inventory sync</div>
                      </div>
                    </TableCell>
                    <TableCell>{doc.destination}</TableCell>
                    <TableCell className="font-mono text-sm">{doc.orderRef}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>{getRiskBadge(doc.complianceRisk || 'low')}</TableCell>
                    <TableCell>{doc.createdDate}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled={doc.status !== 'completed'}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {documents.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No compliance documents found. Generate your first document above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}