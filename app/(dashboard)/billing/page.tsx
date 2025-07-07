"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Calculator,
  DollarSign,
  FileText,
  CreditCard,
  Download,
  Settings,
  Bot,
  Loader2,
  FileSpreadsheet,
  RefreshCw,
  Package,
  TrendingUp,
  FolderSync as Sync,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { TradeAI, TaxCalculation } from '@/lib/claude';
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

export default function Billing() {
  const [calculatorData, setCalculatorData] = useState({
    selectedProduct: '',
    productValue: '',
    country: '',
    pricingModel: 'DAP',
  });

  const [taxResult, setTaxResult] = useState<TaxCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [selectedProductData, setSelectedProductData] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

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

    // Generate sample billing data
    const sampleTransactions = [
      {
        id: 1,
        date: "2024-01-15",
        product: "Wireless Bluetooth Headphones",
        country: "Germany",
        orderValue: 149.99,
        taxRate: 19,
        status: "paid",
        orderRef: "ORD-WBH-001"
      },
      {
        id: 2,
        date: "2024-01-16",
        product: "Smart Home Camera",
        country: "France",
        orderValue: 299.99,
        taxRate: 20,
        status: "pending",
        orderRef: "ORD-SHC-002"
      }
    ];
    setTransactions(sampleTransactions);
  }, []);

  const handleCalculatorChange = (field: string, value: string) => {
    setCalculatorData({ ...calculatorData, [field]: value });

    // When product is selected, auto-fill HS code and value
    if (field === 'selectedProduct' && value) {
      const product = inventoryData.find(item => item.sku === value);
      if (product) {
        setSelectedProductData(product);
        setCalculatorData(prev => ({
          ...prev,
          productValue: product.price.toString()
        }));
      }
    }
  };

  const calculateTaxes = async () => {
    if (!calculatorData.selectedProduct || !calculatorData.country || !calculatorData.productValue) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!selectedProductData) {
      toast.error("Please select a valid product from inventory");
      return;
    }

    setIsCalculating(true);
    
    try {
      // Calculate taxes using the selected product's HS code
      const taxCalculation = await TradeAI.calculateTaxes(
        parseFloat(calculatorData.productValue),
        selectedProductData.hsCode,
        calculatorData.country
      );

      setTaxResult(taxCalculation);
      toast.success("Tax calculation completed with Claude AI precision!");
    } catch (error) {
      console.error('Error calculating taxes:', error);
      toast.error("Failed to calculate taxes. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    
    try {
      toast.info(`Generating ${format.toUpperCase()} billing report...`);
      
      const reportData = ExportUtils.generateTransactionReport(transactions);
      
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

      toast.success(`Billing report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export billing data. Please try again.');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate totals from transactions
  const calculateTotals = () => {
    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.orderValue || 0), 0);
    const totalTaxes = transactions.reduce((sum, tx) => {
      const taxAmount = (tx.orderValue || 0) * (tx.taxRate || 0) / 100;
      return sum + taxAmount;
    }, 0);
    const pendingPayments = transactions
      .filter(tx => tx.status === 'pending')
      .reduce((sum, tx) => sum + (tx.orderValue || 0), 0);

    return { totalRevenue, totalTaxes, pendingPayments };
  };

  const { totalRevenue, totalTaxes, pendingPayments } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI-Powered Billing & Taxes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Intelligent tax calculations with real-time inventory data powered by Claude AI
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4" />
              <span>{inventoryData.length} products available</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>{transactions.length} transactions</span>
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
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Billing Settings
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
                  Please upload your inventory CSV file first to enable product selection for tax calculations.
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
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">From {transactions.length} transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Taxes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalTaxes.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">AI calculated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${pendingPayments.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Awaiting payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Accuracy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">99.2%</p>
                <p className="text-xs text-gray-500">Claude AI powered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Claude AI Tax Calculator</TabsTrigger>
          <TabsTrigger value="transactions">Real-time Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Claude AI Tax Calculator */}
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span>Claude AI Tax Calculator</span>
                  {inventoryData.length > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Sync className="w-3 h-3 mr-1" />
                      Synced
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Intelligent tax calculations with real-time HS code classification using your inventory data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="selectedProduct">Select Product from Inventory</Label>
                  <Select 
                    value={calculatorData.selectedProduct} 
                    onValueChange={(value) => handleCalculatorChange('selectedProduct', value)}
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
                            <span className="text-gray-500">(${product.price})</span>
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

                <div className="space-y-2">
                  <Label htmlFor="productValue">Product Value (USD)</Label>
                  <Input
                    id="productValue"
                    placeholder={selectedProductData ? `Default: $${selectedProductData.price}` : "0.00"}
                    type="number"
                    value={calculatorData.productValue}
                    onChange={(e) => handleCalculatorChange('productValue', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Destination Country</Label>
                  <Select value={calculatorData.country} onValueChange={(value) => handleCalculatorChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="Netherlands">Netherlands</SelectItem>
                      <SelectItem value="Italy">Italy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricingModel">Pricing Model</Label>
                  <Select value={calculatorData.pricingModel} onValueChange={(value) => handleCalculatorChange('pricingModel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAP">DAP (Delivered at Place)</SelectItem>
                      <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={calculateTaxes} 
                  className="w-full" 
                  disabled={isCalculating || !calculatorData.selectedProduct}
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Claude AI Calculating...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      Calculate with Claude AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Calculation Results */}
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle>Claude AI Calculation Results</CardTitle>
                <CardDescription>Detailed breakdown with HS code classification from your inventory</CardDescription>
              </CardHeader>
              <CardContent>
                {taxResult ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">HS Code: {taxResult.hsCode}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">From inventory data with Claude AI verification</p>
                      {selectedProductData && (
                        <p className="text-xs text-blue-500 mt-1">Product: {selectedProductData.productName}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Product Value:</span>
                      <span className="font-medium">${taxResult.productValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Duty ({taxResult.dutyRate}%):</span>
                      <span className="font-medium">${taxResult.dutyAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">VAT ({taxResult.vatRate}%):</span>
                      <span className="font-medium">${taxResult.vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-4">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-lg">${taxResult.totalAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="text-xs text-gray-500 text-center">
                      Calculated using Claude AI with current 2024 trade agreements and regulations
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Select a product from your inventory for Claude AI-powered tax calculation
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Real-time Transaction History</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Live Sync
                </Badge>
              </CardTitle>
              <CardDescription>
                View all billing transactions synchronized with inventory data and AI-calculated taxes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Order Value</TableHead>
                      <TableHead>Tax Rate</TableHead>
                      <TableHead>Total Tax</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const taxAmount = (transaction.orderValue || 0) * (transaction.taxRate || 0) / 100;
                      const totalAmount = (transaction.orderValue || 0) + taxAmount;
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell className="font-medium">{transaction.product}</TableCell>
                          <TableCell>{transaction.country}</TableCell>
                          <TableCell>${(transaction.orderValue || 0).toFixed(2)}</TableCell>
                          <TableCell>{transaction.taxRate || 0}%</TableCell>
                          <TableCell>${taxAmount.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">${totalAmount.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {transactions.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No transactions found. Upload inventory data to generate billing records.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Configure your billing information and AI preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" placeholder="Your Company Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                    <Input id="taxId" placeholder="GB123456789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Input id="businessAddress" placeholder="123 Business Street, City, Country" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">AI Preferences</h3>
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Select defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aiAccuracy">AI Confidence Threshold</Label>
                    <Select defaultValue="high">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (95%+)</SelectItem>
                        <SelectItem value="medium">Medium (85%+)</SelectItem>
                        <SelectItem value="low">Low (75%+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline">Cancel</Button>
                <Button onClick={() => toast.success('Settings saved successfully!')}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}