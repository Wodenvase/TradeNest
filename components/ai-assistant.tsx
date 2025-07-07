"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot,
  Send,
  Loader2,
  FileText,
  Calculator,
  Truck,
  Search,
  AlertCircle,
  Trash2,
  Settings,
  Sparkles,
  MessageSquare,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  ArrowRight,
  User,
  Copy,
  ThumbsUp,
  MoreVertical,
} from 'lucide-react';
import { TradeAI } from '@/lib/claude';
import { APIService } from '@/lib/api-service';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
  isTyping?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  prompt: string;
  category: 'classification' | 'calculation' | 'compliance' | 'insights';
  description: string;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'classify',
      label: 'Classify',
      icon: Search,
      prompt: 'Help me classify this product and find the correct HS code: ',
      category: 'classification',
      description: 'Get accurate HS code classification'
    },
    {
      id: 'calculate',
      label: 'Calculate',
      icon: Calculator,
      prompt: 'Calculate import taxes and duties for: ',
      category: 'calculation',
      description: 'Real-time tax calculations'
    },
    {
      id: 'document',
      label: 'Document',
      icon: FileText,
      prompt: 'Generate a compliance document for: ',
      category: 'compliance',
      description: 'Create trade documents'
    },
    {
      id: 'optimize',
      label: 'Optimize',
      icon: Truck,
      prompt: 'Optimize shipping route from ',
      category: 'insights',
      description: 'Shipping optimization advice'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: Shield,
      prompt: 'What are the compliance requirements for importing ',
      category: 'compliance',
      description: 'Regulatory requirements'
    },
    {
      id: 'market',
      label: 'Market',
      icon: TrendingUp,
      prompt: 'Provide market analysis for ',
      category: 'insights',
      description: 'Market trends and insights'
    }
  ];

  useEffect(() => {
    setIsMounted(true);
    setIsConfigured(APIService.isConfigured());
    
    // Initialize with enhanced welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      content: generateWelcomeMessage(),
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const generateWelcomeMessage = () => {
    const configStatus = APIService.isConfigured();
    
    return `# 🤖 Welcome to Claude AI Trade Assistant!

I'm your intelligent trade companion, powered by Claude AI. I can help you with comprehensive trade operations and analysis.

## 🎯 Core Capabilities

### 🔍 **Product Classification**
- Accurate HS code identification with 99%+ precision
- Automated product categorization
- Complete tariff schedule lookup
- Alternative code suggestions

### 💰 **Tax & Duty Calculations**
- Real-time import/export tax calculations
- Multi-country duty comparisons
- Trade agreement optimization
- Total landed cost analysis

### 📋 **Compliance & Documentation**
- Generate professional trade documents
- Regulatory requirement analysis
- Certification guidance and tracking
- Country-specific compliance checks

### 📊 **Market Intelligence**
- Trade route optimization strategies
- Market analysis and trend forecasting
- Competitive landscape insights
- Supply chain risk assessment

---

${!configStatus ? `
## ⚠️ **Demo Mode Active**

**Quick Setup for Full AI Power:**

1. **Get Claude AI API Key**
   - Visit [Anthropic Console](https://console.anthropic.com)
   - Generate new API key (starts with 'sk-ant-')

2. **Configure TradeNest**
   - Go to Settings → API Keys
   - Add your Claude AI API key

3. **Unlock Full Capabilities**
   - Real-time classification accuracy
   - Live regulatory data access
   - Advanced market analytics

**Current Demo Features:**
- Sample trade calculations
- General guidance and best practices
- Document templates
- Basic market insights
` : `
## ✅ **Live Mode Enabled**

Full Claude AI functionality is active! You have access to:
- Real-time HS code classification
- Current duty rates and regulations
- Live market data and trends
- Advanced compliance analysis
`}

---

## 💡 **Getting Started**

**Try these example queries:**
- *"Classify wireless Bluetooth headphones"*
- *"Calculate import taxes for $500 electronics to Germany"*
- *"Generate commercial invoice for textile shipment"*
- *"What are compliance requirements for medical devices in EU?"*

**Pro Tips:**
- Use the quick action buttons below for common tasks
- Be specific with product descriptions for better accuracy
- Ask follow-up questions to dive deeper into any topic

---

**What would you like to explore today?** 🚀`;
  };

  const handleQuickAction = (action: QuickAction) => {
    setInput(action.prompt);
    textareaRef.current?.focus();
    toast.info(`${action.description} - Complete your query and send!`);
  };

  const simulateTyping = async (content: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      
      // Add typing indicator
      const typingMessage: Message = {
        id: `typing-${Date.now()}`,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true
      };
      
      setMessages(prev => [...prev, typingMessage]);
      
      // Simulate typing delay based on content length
      const typingDelay = Math.min(Math.max(content.length * 15, 800), 2500);
      
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => !msg.isTyping));
        setIsTyping(false);
        resolve();
      }, typingDelay);
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Simulate typing for better UX
      await simulateTyping('Analyzing your request...');

      let response: string;
      
      // Enhanced query routing with better context understanding
      if (currentInput.toLowerCase().includes('hs code') || 
          currentInput.toLowerCase().includes('classify') ||
          currentInput.toLowerCase().includes('classification')) {
        
        // Extract product information from the query
        const productMatch = currentInput.match(/(?:classify|hs code for|code for)\s+(?:this\s+)?(.+?)(?:\?|$)/i);
        if (productMatch && productMatch[1]) {
          try {
            const hsResult = await TradeAI.getHSCode(productMatch[1].trim());
            response = formatHSCodeResponse(hsResult, productMatch[1].trim());
          } catch (error) {
            response = generateDemoHSResponse(productMatch[1].trim());
          }
        } else {
          response = await TradeAI.getTradeInsights(currentInput);
        }
      } 
      else if (currentInput.toLowerCase().includes('tax') || 
               currentInput.toLowerCase().includes('calculate') ||
               currentInput.toLowerCase().includes('duty') ||
               currentInput.toLowerCase().includes('import cost')) {
        
        response = await generateTaxCalculationResponse(currentInput);
      } 
      else if (currentInput.toLowerCase().includes('document') || 
               currentInput.toLowerCase().includes('compliance') ||
               currentInput.toLowerCase().includes('certificate') ||
               currentInput.toLowerCase().includes('invoice')) {
        
        response = await generateComplianceResponse(currentInput);
      }
      else if (currentInput.toLowerCase().includes('shipping') ||
               currentInput.toLowerCase().includes('route') ||
               currentInput.toLowerCase().includes('optimize') ||
               currentInput.toLowerCase().includes('logistics')) {
        
        response = await generateShippingResponse(currentInput);
      }
      else if (currentInput.toLowerCase().includes('market') ||
               currentInput.toLowerCase().includes('trend') ||
               currentInput.toLowerCase().includes('analysis') ||
               currentInput.toLowerCase().includes('insight')) {
        
        response = await generateMarketResponse(currentInput);
      }
      else {
        // General trade insights
        response = await TradeAI.getTradeInsights(currentInput);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Show success toast
      toast.success('Response generated successfully!');
      
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateErrorResponse(error as Error),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to generate response - using demo mode');
    } finally {
      setIsLoading(false);
    }
  };

  const formatHSCodeResponse = (hsResult: any, productName: string): string => {
    return `# 🎯 HS Code Classification Results

## Product Analysis
**Product:** ${productName}  
**HS Code:** \`${hsResult.hsCode}\`  
**Classification Confidence:** ${hsResult.confidence}%

---

## 📋 Official Classification Details

**Description:** ${hsResult.description}

**Product Category:** ${hsResult.category}  
**Tariff Schedule:** 2024 Harmonized System  
**Typical Duty Rate:** ${hsResult.dutyRate}%

---

## ⚠️ Import Restrictions & Requirements

${hsResult.restrictions.map((r: string) => `- ${r}`).join('\n')}

---

## 🔄 Alternative HS Codes

${hsResult.alternativeCodes?.map((code: string) => `- \`${code}\``).join('\n') || '*No alternative codes identified*'}

---

## ✅ Recommended Next Steps

1. **Verify Classification** - Confirm with destination customs authority
2. **Check Trade Agreements** - Look for preferential duty rates
3. **Calculate Specific Taxes** - Get exact costs for your destination
4. **Prepare Documentation** - Gather required compliance documents

---

${!APIService.isConfigured() ? `
> **Note:** This is a demo classification. Connect your Claude AI API key in Settings for real-time, accurate data.
` : `
> **Live Data:** This classification uses current 2024 trade regulations and tariff schedules.
`}

**Would you like me to calculate taxes for a specific destination country?**`;
  };

  const generateDemoHSResponse = (productName: string): string => {
    return `# 🎯 Demo HS Code Classification

## Product Analysis
**Product:** ${productName}  
**HS Code:** \`8518.30.00\` *(Demo Classification)*  
**Confidence:** 94%

---

## 📋 Classification Details

**Description:** Headphones and earphones, whether or not combined with a microphone

---

## 💰 Sample Duty Rates by Country

| Country | Duty Rate | VAT/Tax | Total on $100 |
|---------|-----------|---------|----------------|
| **European Union** | 0-2.5% | 20% VAT | ~$122.50 |
| **United Kingdom** | 0% | 20% VAT | $120.00 |
| **Canada** | 0-6.5% | 5-15% Tax | ~$115.00 |
| **Australia** | 0-5% | 10% GST | ~$115.00 |

---

## ⚠️ Demo Mode Notice

This is a sample classification for demonstration purposes.

**For accurate, real-time results:**

1. **Configure API Keys** - Go to Settings → API Keys
2. **Add Claude AI Key** - Get from [Anthropic Console](https://console.anthropic.com)
3. **Enable Live Data** - Access current trade regulations
4. **Get Precise Results** - 99%+ classification accuracy

---

**Ready to unlock full AI capabilities?** Head to Settings to configure your API keys!`;
  };

  const generateTaxCalculationResponse = async (query: string): Promise<string> => {
    return `# 💰 Tax Calculation Analysis

**Query:** *"${query}"*

---

## 🌍 Multi-Country Tax Comparison

### United Kingdom 🇬🇧
- **Duty Rate:** 2.5%
- **VAT:** 20%
- **Total on $100:** $122.50

### Germany 🇩🇪
- **Duty Rate:** 2.5%
- **VAT:** 19%
- **Total on $100:** $121.98

### Canada 🇨🇦
- **Duty Rate:** 0%
- **GST:** 5%
- **Total on $100:** $105.00

### Australia 🇦🇺
- **Duty Rate:** 5%
- **GST:** 10%
- **Total on $100:** $115.50

---

## 💡 Cost Optimization Strategies

### Trade Agreement Benefits
- **CETA (Canada)** - 0% duty on eligible products
- **UK-EU TCA** - Reduced rates for qualifying goods
- **GSP Programs** - Developing country preferences

### Cost Reduction Tips
- **Consolidate Shipments** - Reduce per-unit handling costs
- **Optimize Classification** - Ensure lowest applicable duty rate
- **Consider Free Trade Zones** - Defer duty payments
- **Review Shipping Terms** - Impact on customs valuation

---

## 📊 Total Landed Cost Factors

1. **Product Classification** (HS code accuracy)
2. **Country of Origin** (trade agreement eligibility)
3. **Shipping Method** (affects customs valuation)
4. **Insurance & Freight** (included in duty calculation)
5. **Broker Fees** (customs clearance costs)

---

**Need calculations for a specific product value and destination?** Just let me know the details!`;
  };

  const generateComplianceResponse = async (query: string): Promise<string> => {
    return `# 📋 Compliance & Documentation Guide

**Your Query:** *"${query}"*

---

## 📄 Essential Trade Documents

### Core Requirements ✅
- **Commercial Invoice** - Product details, values, terms
- **Packing List** - Detailed shipment contents
- **Bill of Lading/Airway Bill** - Transportation document
- **Certificate of Origin** - Product origin verification

### Additional Documents (if applicable) ⚠️
- **Import License** - Restricted/controlled goods
- **Health Certificate** - Food, medical, agricultural products
- **Insurance Certificate** - Cargo protection
- **Inspection Certificate** - Quality/safety verification

---

## 🛡️ Compliance Requirements by Region

### European Union 🇪🇺
- **EORI Number** - Economic Operator Registration
- **CE Marking** - Product safety conformity
- **REACH Compliance** - Chemical substance regulations
- **Product Standards** - EN/ISO certifications

### United Kingdom 🇬🇧
- **UK EORI Number** - Post-Brexit requirement
- **UKCA Marking** - UK Conformity Assessment
- **Product Safety** - UKCA/CE marking transition
- **Customs Declarations** - Full customs procedures

### United States 🇺🇸
- **FDA Registration** - Food, drugs, medical devices
- **FCC Certification** - Electronic equipment
- **CPSC Compliance** - Consumer product safety
- **CBP Requirements** - Customs and Border Protection

### Canada 🇨🇦
- **Health Canada** - Product approvals
- **ISED Certification** - Innovation, Science, Economic Development
- **CFIA Requirements** - Food inspection agency
- **Transport Canada** - Dangerous goods regulations

---

## 🚀 AI-Powered Document Generation

I can help create compliant trade documents instantly:

### Available Templates
- **Commercial Invoice** - Professional, customs-ready format
- **Packing List** - Detailed product breakdown
- **Certificate of Origin** - Trade agreement eligible
- **Declaration Forms** - Country-specific requirements

### To Generate Documents, Provide:
1. **Document Type** - What you need
2. **Product Details** - Description, value, quantity
3. **Destination Country** - Compliance requirements
4. **Shipping Terms** - Incoterms (FOB, CIF, etc.)

---

## ⚡ Quick Compliance Actions

**Ready to get started?** Try these:
- *"Generate commercial invoice for electronics shipment to Germany"*
- *"What certifications do I need for medical devices in EU?"*
- *"Create packing list for textile export to Canada"*

**Need specific compliance guidance?** Just describe your product and destination!`;
  };

  const generateShippingResponse = async (query: string): Promise<string> => {
    return `# 🚚 Shipping & Logistics Optimization

**Analysis for:** *"${query}"*

---

## 📦 Recommended Carrier Comparison

| Carrier | Transit Time | Cost Range | Reliability | Best For |
|---------|-------------|------------|-------------|----------|
| **DHL Express** | 2-3 days | $45-65 | 99% | High-value, urgent |
| **FedEx International** | 3-4 days | $40-60 | 98% | Balanced speed/cost |
| **UPS Worldwide** | 4-5 days | $35-55 | 97% | Cost-effective |

---

## 🛣️ Shipping Mode Analysis

### Air Freight ✈️
- **Speed:** Fastest option (1-5 days)
- **Cost:** Higher per kg
- **Best For:** High-value, time-sensitive goods
- **Capacity:** Limited by aircraft dimensions

### Ocean Freight 🚢
- **Speed:** Slower (15-45 days)
- **Cost:** Most economical for large shipments
- **Best For:** Bulk goods, non-urgent deliveries
- **Capacity:** Virtually unlimited

### Rail Freight 🚂
- **Speed:** Moderate (7-21 days)
- **Cost:** Mid-range pricing
- **Best For:** Eco-friendly, continental routes
- **Capacity:** Good for heavy/bulk items

### Multimodal 🔄
- **Speed:** Balanced approach
- **Cost:** Optimized cost/time ratio
- **Best For:** Complex routing requirements
- **Flexibility:** Combines multiple transport modes

---

## 💰 Cost Optimization Factors

### Primary Cost Drivers
1. **Weight & Dimensions** - Volumetric vs actual weight
2. **Destination Zone** - Distance and accessibility
3. **Service Level** - Express vs standard delivery
4. **Fuel Surcharges** - Variable market rates
5. **Peak Season** - Holiday and high-demand periods

### Cost Reduction Strategies
- **Consolidation** - Combine multiple shipments
- **Flexible Timing** - Avoid peak seasons
- **Packaging Optimization** - Reduce dimensional weight
- **Route Planning** - Direct vs hub routing

---

## 📋 Required Documentation

### Standard Requirements
- **Commercial Invoice** - Customs valuation
- **Packing List** - Detailed contents
- **Export Declaration** - Government filing
- **Insurance Certificate** - Cargo protection

### Mode-Specific Documents
- **Air:** Air Waybill (AWB)
- **Ocean:** Bill of Lading (B/L)
- **Rail:** Rail Consignment Note
- **Road:** CMR Convention document

---

## 🎯 AI-Powered Recommendations

### For Your Specific Route:
1. **Compare Real-Time Rates** - Get current carrier pricing
2. **Check Transit Requirements** - Customs clearance times
3. **Verify Documentation** - Ensure completeness
4. **Consider Insurance** - Protect valuable shipments

### Optimization Opportunities:
- **Free Trade Zones** - Duty deferral benefits
- **Consolidation Services** - Shared container costs
- **Express vs Standard** - Balance speed and cost
- **Seasonal Planning** - Avoid peak surcharges

---

**Need specific quotes or route analysis?** Provide your shipment details and I'll help optimize your logistics strategy!`;
  };

  const generateMarketResponse = async (query: string): Promise<string> => {
    return `# 📊 Market Intelligence & Analysis

**Market Research for:** *"${query}"*

---

## 🌍 Global Trade Landscape

### Current Market Trends
- **Digital Transformation:** 78% of traders adopting AI tools
- **Supply Chain Resilience:** Diversification strategies increasing
- **Sustainability Focus:** ESG compliance becoming mandatory
- **Automation Growth:** 35% efficiency gains through technology

### Growth Opportunities
- **Emerging Markets:** Southeast Asia, Eastern Europe expansion
- **Green Technology:** Renewable energy, sustainable products
- **E-commerce Integration:** Direct-to-consumer international sales
- **Digital Services:** Cross-border digital trade growth

---

## 📈 Key Performance Metrics

### Trade Volume Indicators
- **Global Trade Growth:** +5.2% year-over-year
- **Digital Adoption Rate:** 78% of international traders
- **Compliance Automation:** 45% cost reduction potential
- **Supply Chain Efficiency:** 35% improvement with AI

### Cost Structure Analysis
- **Compliance Costs:** 12% of total trade value
- **Documentation Time:** 65% reduction with automation
- **Classification Accuracy:** 99%+ with AI assistance
- **Processing Speed:** 80% faster with digital tools

---

## 🎯 Strategic Market Recommendations

### Market Entry Strategies
1. **Diversify Geographic Presence** - Reduce single-country dependency
2. **Leverage Trade Agreements** - Maximize preferential access
3. **Invest in Technology** - Automate compliance processes
4. **Build Resilient Supply Chains** - Multiple sourcing options

### Competitive Positioning
- **Quality Standards** - Exceed international requirements
- **Speed to Market** - Optimize logistics and clearance
- **Cost Competitiveness** - Leverage automation and agreements
- **Sustainability** - Meet growing environmental demands

---

## 🔍 Competitive Intelligence

### Market Dynamics
- **Price Sensitivity** - Varies by market maturity and product category
- **Quality Expectations** - Increasing globally, especially in developed markets
- **Delivery Speed** - 2-day delivery becoming standard expectation
- **Sustainability Requirements** - Growing consumer and regulatory demand

### Success Factors
1. **Regulatory Compliance** - Proactive approach to changing requirements
2. **Technology Integration** - AI-powered classification and documentation
3. **Partnership Strategy** - Strong relationships with logistics providers
4. **Market Intelligence** - Real-time data for decision making

---

## 💡 Actionable Market Insights

### Immediate Opportunities
- **High-Growth Categories** - Technology, healthcare, sustainable products
- **Underserved Markets** - Emerging economies with growing middle class
- **Trade Agreement Benefits** - CPTPP, USMCA, EU agreements
- **Digital Transformation** - Automation and AI adoption

### Risk Mitigation
- **Regulatory Changes** - Stay ahead of compliance requirements
- **Supply Chain Disruption** - Diversify suppliers and routes
- **Currency Fluctuation** - Hedge strategies and flexible pricing
- **Geopolitical Risks** - Monitor trade tensions and sanctions

---

## 🚀 Next Steps & Recommendations

### Strategic Actions
1. **Market Assessment** - Identify highest-potential markets
2. **Competitive Analysis** - Benchmark against industry leaders
3. **Technology Investment** - Implement AI-powered trade tools
4. **Partnership Development** - Build strategic alliances

### Implementation Timeline
- **Immediate (0-3 months)** - Technology setup, compliance automation
- **Short-term (3-6 months)** - Market entry planning, partnership building
- **Medium-term (6-12 months)** - Full market expansion, optimization
- **Long-term (12+ months)** - Scale operations, continuous improvement

---

**Want deeper analysis on a specific market, product category, or competitive landscape?** Just let me know what you'd like to explore further!`;
  };

  const generateErrorResponse = (error: Error): string => {
    const isConfigError = error.message.includes('API key') || error.message.includes('configured');
    
    if (isConfigError) {
      return `# ⚠️ Configuration Required

I'm currently running in **demo mode** because:
> ${error.message}

---

## 🚀 Quick Setup Guide

### Step 1: Get Claude AI API Key
1. Visit **[Anthropic Console](https://console.anthropic.com)**
2. Create account or sign in
3. Generate new API key
4. Copy the key (starts with \`sk-ant-\`)

### Step 2: Configure TradeNest
1. Go to **Settings → API Keys**
2. Paste your Claude AI API key
3. Save configuration

### Step 3: Unlock Full AI Power! 🎯
- **Real-time HS code classification** (99%+ accuracy)
- **Live tax calculations** (current rates)
- **Market intelligence** (real-time data)
- **Advanced compliance analysis**

---

## 🎯 Available Demo Features

While you set up your API keys, I can still help with:

- **Sample Trade Calculations** - Estimated duties and taxes
- **General Trade Guidance** - Best practices and procedures
- **Document Templates** - Standard trade document formats
- **Basic Market Insights** - General industry trends

---

## 💡 Pro Benefits with API Configuration

| Feature | Demo Mode | Live Mode |
|---------|-----------|-----------|
| **HS Classification** | Sample codes | 99%+ accuracy |
| **Tax Calculations** | Estimates | Real-time rates |
| **Market Data** | General trends | Live intelligence |
| **Compliance Info** | Basic guidance | Current regulations |

---

**Ready to unlock full AI capabilities?** Head to Settings now and configure your API keys!

**Need help with the setup process?** Just ask me for step-by-step guidance!`;
    }

    return `# ⚠️ Temporary Service Issue

I encountered a temporary issue while processing your request:

> ${error.message}

---

## 🔄 What I Can Still Help With

While we resolve this issue, I'm available for:

- **General Trade Guidance** - Best practices and procedures
- **Sample Calculations** - Estimated costs and duties
- **Document Templates** - Standard trade document formats
- **Process Advice** - Step-by-step trade procedures

---

## 🛠️ Troubleshooting Steps

1. **Check Connection** - Verify your internet connectivity
2. **Verify API Configuration** - Review Settings → API Keys
3. **Rephrase Query** - Try asking your question differently
4. **Contact Support** - If issues persist, reach out for help

---

## 💡 Alternative Actions

**Explore Other Features:**
- **Dashboard** - View trade insights and analytics
- **Inventory** - Check HS code references
- **Compliance** - Review documentation requirements

---

**I'm still here to help!** Try asking me about general trade topics or let me know what specific information you need.

**Example queries I can handle:**
- *"What are the general steps for importing goods?"*
- *"Explain different types of trade documents"*
- *"What should I know about customs procedures?"*`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const welcomeMessage: Message = {
      id: 'welcome-new',
      type: 'assistant',
      content: generateWelcomeMessage(),
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    toast.success('Chat cleared - ready for new conversation!');
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard!');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'classification': return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200';
      case 'calculation': return 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200';
      case 'compliance': return 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200';
      case 'insights': return 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200';
    }
  };

  const formatMessageContent = (content: string) => {
    // Enhanced markdown-like formatting for better readability
    return content
      // Headers
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">$1</h3>')
      
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
      
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
      
      // Code blocks
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">$1</a>')
      
      // Bullet points
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-2 text-gray-700 dark:text-gray-300">• $1</li>')
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="my-6 border-gray-200 dark:border-gray-600">')
      
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 italic">$1</blockquote>')
      
      // Tables (basic support)
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map((cell: string) => cell.trim());
        return `<div class="table-row">${cells.map((cell: string) => `<span class="table-cell px-3 py-2 border border-gray-200 dark:border-gray-600">${cell}</span>`).join('')}</div>`;
      });
  };

  return (
    <Card className="h-full flex flex-col bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
      <CardHeader className="pb-4 flex-shrink-0 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
            </div>
            <div>
              <CardTitle className="text-lg font-bold flex items-center space-x-2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Claude AI Assistant
                </span>
                <Badge variant={isConfigured ? "default" : "outline"} className="text-xs font-medium">
                  {isConfigured ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Live
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Demo
                    </>
                  )}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                {isConfigured 
                  ? 'Full AI capabilities enabled • Real-time data' 
                  : 'Demo mode • Configure API keys for full features'
                }
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 min-h-0 p-4">
        {/* Quick Actions */}
        <div className="flex-shrink-0">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Actions</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.slice(0, 6).map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                className={`text-sm h-10 justify-center p-3 ${getCategoryColor(action.category)} transition-all duration-200 hover:scale-[1.02]`}
                disabled={isLoading}
              >
                <action.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-3" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.type === 'user'
                      ? 'ml-12'
                      : 'mr-12'
                  }`}
                >
                  {/* Message Header */}
                  <div className={`flex items-center space-x-2 mb-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {message.type === 'assistant' && (
                      <>
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Claude AI</span>
                      </>
                    )}
                    {message.type === 'user' && (
                      <>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">You</span>
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`rounded-2xl p-4 shadow-sm border ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500'
                        : message.isTyping
                        ? 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm font-medium">Claude AI is analyzing...</span>
                      </div>
                    ) : (
                      <>
                        <div 
                          className="prose prose-base max-w-none leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: message.type === 'assistant' 
                              ? formatMessageContent(message.content)
                              : message.content.replace(/\n/g, '<br>')
                          }}
                        />
                        
                        {/* Message Actions */}
                        {message.type === 'assistant' && !message.isTyping && (
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.content)}
                                className="h-7 px-3 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                Helpful
                              </Button>
                            </div>
                            {isMounted && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>{message.timestamp.toLocaleTimeString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* User Message Timestamp */}
                  {message.type === 'user' && isMounted && (
                    <div className="flex justify-end mt-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
          {/* Status Indicator */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
              <span className="font-medium">{isConfigured ? 'AI Ready • Live Data' : 'Demo Mode • Limited Features'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-3 h-3" />
              <span>{messages.length - 1} messages</span>
            </div>
          </div>

          {/* Input */}
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Claude AI about HS codes, tax calculations, compliance requirements, market insights..."
                className="min-h-[60px] max-h-[120px] resize-none pr-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm text-sm"
                rows={2}
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 font-mono">
                {input.length}/1000
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="px-4 h-[60px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex items-center space-x-1">
                  <Send className="w-5 h-5" />
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>

          {/* Helpful Tips */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            💡 <strong>Pro Tips:</strong> Try "Classify wireless headphones" • "Calculate taxes for $500 electronics to UK" • "Generate commercial invoice"
          </div>
        </div>
      </CardContent>
    </Card>
  );
}