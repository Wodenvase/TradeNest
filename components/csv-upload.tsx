"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Bot,
  Zap,
  FileText,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { HuggingFaceAPI, InventoryItem } from '@/lib/huggingface-api';
import { inventoryManager } from '@/lib/inventory-store';

interface CSVUploadProps {
  onUploadComplete?: (items: InventoryItem[]) => void;
}

export function CSVUpload({ onUploadComplete }: CSVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<InventoryItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setUploadedFile(file);
    await processCSVFile(file);
  };

  const processCSVFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setCurrentStep('Reading CSV file...');

    try {
      // Step 1: Read CSV file
      setUploadProgress(10);
      const csvText = await file.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Step 2: Parse CSV data
      setCurrentStep('Parsing CSV data...');
      setUploadProgress(20);
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const csvData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.toLowerCase()] = values[index] || '';
        });
        return row;
      });

      console.log('Parsed CSV data:', csvData);

      // Step 3: Analyze with Hugging Face AI
      setCurrentStep('🤖 Analyzing products with Hugging Face AI...');
      setUploadProgress(30);
      toast.info('🤖 Hugging Face AI analyzing your inventory data...');

      const analyzedItems = await HuggingFaceAPI.analyzeCSVData(csvData);
      
      // Step 4: Update progress during analysis
      setCurrentStep('🔍 AI classification and market analysis in progress...');
      setUploadProgress(70);

      // Step 5: Sync with inventory store
      setCurrentStep('📊 Synchronizing data across all components...');
      setUploadProgress(90);
      
      // Update the global inventory store
      inventoryManager.addItems(analyzedItems);
      
      // Step 6: Complete
      setCurrentStep('✅ Upload and analysis complete!');
      setUploadProgress(100);

      setAnalysisResults(analyzedItems);
      setShowResults(true);
      
      toast.success(`✅ Successfully analyzed ${analyzedItems.length} products with Hugging Face AI!`);
      
      if (onUploadComplete) {
        onUploadComplete(analyzedItems);
      }

    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error(`Failed to process CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentStep('❌ Upload failed');
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setCurrentStep('');
      }, 3000);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const downloadSampleCSV = () => {
    const sampleData = `name,sku,availability,warehouse,country,description
Wireless Bluetooth Headphones,WBH-001,150,UK-LON-01,United Kingdom,Premium noise-cancelling headphones
Smart Home Camera,SHC-002,75,DE-BER-01,Germany,4K security camera with AI detection
Organic Cotton T-Shirt,OCT-003,200,FR-PAR-01,France,Sustainable fashion apparel
Fitness Tracker,FT-004,120,US-NYC-01,United States,Advanced health monitoring device
Gaming Laptop,GL-005,45,CA-TOR-01,Canada,High-performance gaming computer`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-inventory.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Sample CSV downloaded');
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setAnalysisResults([]);
    setShowResults(false);
    setUploadProgress(0);
    setCurrentStep('');
  };

  return (
    <div className="space-y-6">
      {/* Upload Interface */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span>Hugging Face AI CSV Analyzer</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </CardTitle>
          <CardDescription>
            Upload your inventory CSV for intelligent analysis with Hugging Face AI. Real-time synchronization across all components.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!uploadedFile && !showResults && (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={triggerFileUpload}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
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
                <span className="font-medium">Processing with Hugging Face AI...</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-3" />
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Bot className="w-4 h-4" />
                <span>{currentStep}</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className={`flex items-center space-x-1 ${uploadProgress >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle className="w-3 h-3" />
                  <span>Parse CSV</span>
                </div>
                <div className={`flex items-center space-x-1 ${uploadProgress >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle className="w-3 h-3" />
                  <span>AI Analysis</span>
                </div>
                <div className={`flex items-center space-x-1 ${uploadProgress >= 80 ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle className="w-3 h-3" />
                  <span>Sync Data</span>
                </div>
                <div className={`flex items-center space-x-1 ${uploadProgress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle className="w-3 h-3" />
                  <span>Complete</span>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {showResults && analysisResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Analysis Complete</span>
                </h3>
                <Button variant="outline" size="sm" onClick={resetUpload}>
                  Upload New File
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisResults.length}</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">Products Analyzed</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisResults.filter(item => item.aiClassified).length}
                  </div>
                  <div className="text-sm text-green-800 dark:text-green-200">AI Classified</div>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analysisResults.filter(item => item.status === 'low-stock').length}
                  </div>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">Low Stock</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((analysisResults.filter(item => item.aiClassified).length / analysisResults.length) * 100)}%
                  </div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">Success Rate</div>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Real-time Synchronization Complete</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your inventory data has been synchronized across Dashboard, Billing, Compliance, and all other components. 
                      All data is now updated with Hugging Face AI analysis results.
                    </p>
                  </div>
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
            <span>CSV Format Guide</span>
          </CardTitle>
          <CardDescription>Required and optional columns for optimal AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Required Columns:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span><code>name</code> - Product name</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span><code>sku</code> - Stock keeping unit</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span><code>availability</code> - Stock quantity</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Optional Columns:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center space-x-2">
                  <AlertCircle className="w-3 h-3 text-blue-500" />
                  <span><code>warehouse</code> - Warehouse location</span>
                </li>
                <li className="flex items-center space-x-2">
                  <AlertCircle className="w-3 h-3 text-blue-500" />
                  <span><code>country</code> - Country location</span>
                </li>
                <li className="flex items-center space-x-2">
                  <AlertCircle className="w-3 h-3 text-blue-500" />
                  <span><code>description</code> - Product description</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}