export interface ExportData {
  filename: string;
  data: any[];
  headers: string[];
  title?: string;
  subtitle?: string;
}

export class ExportUtils {
  static exportToCSV(data: ExportData): void {
    const { filename, data: rows, headers } = data;
    
    // Create CSV content with proper escaping
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas, quotes, and newlines
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `${filename}.csv`);
  }

  static exportToExcel(data: ExportData): void {
    const { filename, data: rows, headers, title, subtitle } = data;
    
    // Create Excel-compatible HTML table
    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <meta name="ProgId" content="Excel.Sheet">
        <meta name="Generator" content="TradeNest Export">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Data</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; font-size: 18px; font-weight: bold; }
          .subtitle { text-align: center; margin-bottom: 10px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>`;

    if (title) {
      htmlContent += `<div class="header">${title}</div>`;
    }
    if (subtitle) {
      htmlContent += `<div class="subtitle">${subtitle}</div>`;
    }

    htmlContent += `
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => 
              `<tr>${headers.map(h => `<td>${this.escapeHtml(String(row[h] || ''))}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
      </html>`;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    this.downloadFile(blob, `${filename}.xls`);
  }

  static exportToPDF(data: ExportData): void {
    const { filename, data: rows, headers, title, subtitle } = data;
    
    // Create a comprehensive HTML document for PDF conversion
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title || filename}</title>
        <meta charset="utf-8">
        <style>
          @page {
            size: A4 landscape;
            margin: 0.5in;
          }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .header h1 { 
            margin: 0; 
            color: #333; 
            font-size: 24px;
            font-weight: bold;
          }
          .header .subtitle { 
            margin: 5px 0 0 0; 
            color: #666; 
            font-size: 14px;
          }
          .header .generated { 
            margin: 10px 0 0 0; 
            color: #999; 
            font-size: 12px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          th { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: bold;
            padding: 12px 8px;
            text-align: left;
            border: 1px solid #5a67d8;
            font-size: 11px;
          }
          td { 
            padding: 10px 8px;
            border: 1px solid #e2e8f0;
            font-size: 10px;
          }
          tr:nth-child(even) { 
            background-color: #f8fafc; 
          }
          tr:hover { 
            background-color: #edf2f7; 
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            padding: 15px;
            background: #f7fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .stat-item {
            text-align: center;
          }
          .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #2d3748;
          }
          .stat-label {
            font-size: 12px;
            color: #718096;
            margin-top: 4px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title || 'TradeNest Export Report'}</h1>
          ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
          <div class="generated">Generated on: ${new Date().toLocaleString()}</div>
        </div>

        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${rows.length}</div>
            <div class="stat-label">Total Records</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${headers.length}</div>
            <div class="stat-label">Data Fields</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${new Date().toLocaleDateString()}</div>
            <div class="stat-label">Export Date</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>${headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map((row, index) => 
              `<tr>${headers.map(h => `<td>${this.escapeHtml(String(row[h] || ''))}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>TradeNest</strong> - AI-Powered Global Trade Platform</p>
          <p>This report contains ${rows.length} records exported from your TradeNest dashboard</p>
          <p>For support, visit tradenest.com or contact support@tradenest.com</p>
        </div>
      </body>
      </html>`;

    // Open in new window for printing/PDF save
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Add print button and auto-print functionality
      setTimeout(() => {
        const printButton = printWindow.document.createElement('button');
        printButton.innerHTML = '🖨️ Print / Save as PDF';
        printButton.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 1000;
          padding: 10px 20px;
          background: #4299e1;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        printButton.className = 'no-print';
        printButton.onclick = () => printWindow.print();
        printWindow.document.body.appendChild(printButton);
        
        // Auto-trigger print dialog
        printWindow.print();
      }, 500);
    }
  }

  private static downloadFile(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Enhanced report generators with better data formatting
  static generateDashboardReport(data: any): ExportData {
    const timestamp = new Date().toISOString().split('T')[0];
    
    return {
      filename: `dashboard-report-${timestamp}`,
      title: 'TradeNest Dashboard Analytics Report',
      subtitle: 'Comprehensive overview of trade operations and AI performance metrics',
      headers: [
        'Metric',
        'Current Value',
        'Previous Period',
        'Change (%)',
        'Trend',
        'AI Confidence',
        'Last Updated'
      ],
      data: [
        {
          'Metric': 'Total Orders',
          'Current Value': '2,847',
          'Previous Period': '2,540',
          'Change (%)': '+12.1%',
          'Trend': 'Increasing',
          'AI Confidence': '99.2%',
          'Last Updated': new Date().toLocaleString()
        },
        {
          'Metric': 'AI Classification Accuracy',
          'Current Value': `${data?.aiAccuracy || '99.1'}%`,
          'Previous Period': '97.8%',
          'Change (%)': '+1.3%',
          'Trend': 'Improving',
          'AI Confidence': '99.8%',
          'Last Updated': new Date().toLocaleString()
        },
        {
          'Metric': 'Compliance Rate',
          'Current Value': `${data?.complianceRate || '99.2'}%`,
          'Previous Period': '96.1%',
          'Change (%)': '+3.1%',
          'Trend': 'Improving',
          'AI Confidence': '98.5%',
          'Last Updated': new Date().toLocaleString()
        },
        {
          'Metric': 'Monthly Revenue',
          'Current Value': '$284,750',
          'Previous Period': '$241,200',
          'Change (%)': '+18.1%',
          'Trend': 'Strong Growth',
          'AI Confidence': '97.3%',
          'Last Updated': new Date().toLocaleString()
        },
        {
          'Metric': 'Active Shipments',
          'Current Value': '247',
          'Previous Period': '198',
          'Change (%)': '+24.7%',
          'Trend': 'Increasing',
          'AI Confidence': '99.5%',
          'Last Updated': new Date().toLocaleString()
        },
        {
          'Metric': 'Inventory Items Tracked',
          'Current Value': `${data?.totalItems || '1,234'}`,
          'Previous Period': '1,156',
          'Change (%)': '+6.7%',
          'Trend': 'Growing',
          'AI Confidence': '100%',
          'Last Updated': new Date().toLocaleString()
        }
      ]
    };
  }

  static generateInventoryReport(inventoryData: any[]): ExportData {
    const timestamp = new Date().toISOString().split('T')[0];
    
    return {
      filename: `inventory-report-${timestamp}`,
      title: 'TradeNest Inventory Management Report',
      subtitle: 'Complete inventory analysis with AI classification and market insights',
      headers: [
        'SKU',
        'Product Name',
        'Category',
        'Current Stock',
        'Stock Status',
        'HS Code',
        'Price',
        'Market Demand',
        'Warehouse Location',
        'AI Actions',
        'Last Updated'
      ],
      data: inventoryData.map(item => ({
        'SKU': item.sku || 'N/A',
        'Product Name': item.productName || item.name || 'Unknown Product',
        'Category': item.category || 'General',
        'Current Stock': item.availability || 0,
        'Stock Status': this.formatStockStatus(item.status),
        'HS Code': item.hsCode || item.hs_code || 'Pending',
        'Price': item.price ? `$${item.price}` : 'TBD',
        'Market Demand': this.formatMarketDemand(item.marketDemand || item.market_demand),
        'Warehouse Location': item.warehouse || 'N/A',
        'AI Actions': this.formatAIActions(item.aiActions || item.ai_actions),
        'Last Updated': new Date().toISOString()
      }))
    };
  }

  static generateTransactionReport(transactions: any[]): ExportData {
    const timestamp = new Date().toISOString().split('T')[0];
    
    return {
      filename: `billing-transactions-${timestamp}`,
      title: 'TradeNest Billing & Transaction Report',
      subtitle: 'Detailed financial transactions with AI-calculated taxes and duties',
      headers: [
        'Transaction Date',
        'Order Reference',
        'Product Name',
        'Destination Country',
        'Base Order Value',
        'Tax Rate (%)',
        'Tax Amount',
        'Duty Amount',
        'Total Amount',
        'Payment Status',
        'HS Code',
        'Trade Agreement',
        'Processing Time'
      ],
      data: transactions.map(tx => {
        const taxAmount = (tx.orderValue || 0) * (tx.taxRate || 0) / 100;
        const dutyAmount = (tx.orderValue || 0) * 0.025; // Estimated duty
        const totalAmount = (tx.orderValue || 0) + taxAmount + dutyAmount;
        
        return {
          'Transaction Date': tx.date || new Date().toLocaleDateString(),
          'Order Reference': tx.orderRef || tx.id || 'N/A',
          'Product Name': tx.product || 'Unknown Product',
          'Destination Country': tx.country || 'N/A',
          'Base Order Value': `$${(tx.orderValue || 0).toFixed(2)}`,
          'Tax Rate (%)': `${tx.taxRate || 0}%`,
          'Tax Amount': `$${taxAmount.toFixed(2)}`,
          'Duty Amount': `$${dutyAmount.toFixed(2)}`,
          'Total Amount': `$${totalAmount.toFixed(2)}`,
          'Payment Status': this.formatPaymentStatus(tx.status),
          'HS Code': tx.hsCode || 'TBD',
          'Trade Agreement': tx.tradeAgreement || 'Standard Rates',
          'Processing Time': tx.processingTime || '< 1 minute'
        };
      })
    };
  }

  static generateComplianceReport(documents: any[]): ExportData {
    const timestamp = new Date().toISOString().split('T')[0];
    
    return {
      filename: `compliance-documents-${timestamp}`,
      title: 'TradeNest Compliance & Documentation Report',
      subtitle: 'Trade document status and regulatory compliance tracking',
      headers: [
        'Document ID',
        'Document Type',
        'Product Name',
        'Destination Country',
        'Order Reference',
        'Generation Status',
        'Compliance Risk Level',
        'Created Date',
        'AI Generated',
        'Validation Status'
      ],
      data: documents.map(doc => ({
        'Document ID': doc.id || `DOC-${Date.now()}`,
        'Document Type': doc.type || 'Commercial Invoice',
        'Product Name': doc.productName || 'N/A',
        'Destination Country': doc.destination || 'N/A',
        'Order Reference': doc.orderRef || 'N/A',
        'Generation Status': this.formatDocumentStatus(doc.status),
        'Compliance Risk Level': this.formatComplianceRisk(doc.complianceRisk),
        'Created Date': doc.createdDate || new Date().toLocaleDateString(),
        'AI Generated': doc.aiGenerated ? 'Yes' : 'No',
        'Validation Status': doc.validated ? 'Validated' : 'Pending Review'
      }))
    };
  }

  static generateLogisticsReport(logisticsData: any[]): ExportData {
    const timestamp = new Date().toISOString().split('T')[0];
    
    return {
      filename: `logistics-report-${timestamp}`,
      title: 'TradeNest Logistics & Warehouse Report',
      subtitle: 'Comprehensive logistics data with warehouse and shipment tracking',
      headers: [
        'Warehouse ID',
        'Warehouse Name',
        'Address',
        'Coordinates',
        'SKU ID',
        'HS Code',
        'Product Description',
        'Quantity',
        'Shipment ID',
        'Shipment Status',
        'Origin',
        'Destination',
        'Carrier',
        'ETA',
        'Last Updated'
      ],
      data: logisticsData.map(item => ({
        'Warehouse ID': item.warehouse_id || 'N/A',
        'Warehouse Name': item.warehouse_name || 'Unknown Warehouse',
        'Address': item.address || 'Address not provided',
        'Coordinates': `${item.latitude || 0}, ${item.longitude || 0}`,
        'SKU ID': item.sku_id || 'N/A',
        'HS Code': item.hs_code || 'N/A',
        'Product Description': item.sku_description || 'No description',
        'Quantity': item.quantity || 0,
        'Shipment ID': item.shipment_id || 'N/A',
        'Shipment Status': this.formatShipmentStatus(item.shipment_status),
        'Origin': item.origin || 'Unknown',
        'Destination': item.destination || 'Unknown',
        'Carrier': item.carrier || 'Standard Carrier',
        'ETA': item.eta || 'TBD',
        'Last Updated': item.last_updated || new Date().toISOString()
      }))
    };
  }

  // Helper formatting methods
  private static formatStockStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'in-stock': 'In Stock ✅',
      'low-stock': 'Low Stock ⚠️',
      'out-of-stock': 'Out of Stock ❌'
    };
    return statusMap[status] || status;
  }

  private static formatMarketDemand(demand: string): string {
    const demandMap: { [key: string]: string } = {
      'high': 'High Demand 📈',
      'medium': 'Medium Demand 📊',
      'low': 'Low Demand 📉'
    };
    return demandMap[demand] || demand || 'Unknown';
  }

  private static formatAIActions(actions: string): string {
    const actionsMap: { [key: string]: string } = {
      'completed': 'AI Ready ✅',
      'pending': 'Processing ⏳',
      'failed': 'Failed ❌'
    };
    return actionsMap[actions] || actions || 'Pending';
  }

  private static formatComplianceRisk(risk: string): string {
    const riskMap: { [key: string]: string } = {
      'low': 'Low Risk 🟢',
      'medium': 'Medium Risk 🟡',
      'high': 'High Risk 🔴'
    };
    return riskMap[risk] || risk || 'Unknown';
  }

  private static formatPaymentStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'paid': 'Paid ✅',
      'pending': 'Pending ⏳',
      'overdue': 'Overdue ❌',
      'processing': 'Processing 🔄'
    };
    return statusMap[status] || status;
  }

  private static formatDocumentStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': 'Generated ✅',
      'pending': 'In Progress ⏳',
      'error': 'Failed ❌',
      'draft': 'Draft 📝'
    };
    return statusMap[status] || status;
  }

  private static formatShipmentStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'delivered': 'Delivered ✅',
      'in-transit': 'In Transit 🚛',
      'delayed': 'Delayed ⚠️',
      'processing': 'Processing 📦'
    };
    return statusMap[status] || status;
  }

  private static calculateDeliveryPerformance(shipment: any): string {
    if (shipment.status === 'delivered') {
      return shipment.onTime ? 'On Time ✅' : 'Late ⚠️';
    }
    return 'In Progress ⏳';
  }
}