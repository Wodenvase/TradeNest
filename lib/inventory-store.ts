import { InventoryItem } from './huggingface-api';

export interface InventoryStore {
  items: InventoryItem[];
  lastUpdated: string;
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  aiClassifiedCount: number;
}

class InventoryManager {
  private static instance: InventoryManager;
  private store: InventoryStore;
  private listeners: ((store: InventoryStore) => void)[] = [];

  private constructor() {
    this.store = {
      items: [],
      lastUpdated: new Date().toISOString(),
      totalItems: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      aiClassifiedCount: 0
    };
    
    // Load initial data
    this.loadInitialData();
  }

  static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }
    return InventoryManager.instance;
  }

  private loadInitialData() {
    // Load sample data
    const sampleItems: InventoryItem[] = [
      {
        id: '1',
        sku: "TN-ELE-001",
        name: "Wireless Bluetooth Headphones",
        category: "Electronics - Audio",
        availability: 245,
        hsCode: "8518.30.00",
        warehouse: "UK-LON-01",
        country: "United Kingdom",
        lastSynced: "2024-01-15 14:30",
        status: "in-stock",
        aiClassified: true,
        price: 149,
        marketDemand: 'high',
        seasonality: 'Holiday peak',
        complianceRisk: 'medium'
      },
      {
        id: '2',
        sku: "TN-APP-002",
        name: "Smart Home Security Camera",
        category: "Electronics - Photography",
        availability: 12,
        hsCode: "8525.80.30",
        warehouse: "DE-BER-01",
        country: "Germany",
        lastSynced: "2024-01-15 12:15",
        status: "low-stock",
        aiClassified: true,
        price: 299,
        marketDemand: 'high',
        seasonality: 'Year-round',
        complianceRisk: 'medium'
      },
      {
        id: '3',
        sku: "TN-TEX-003",
        name: "Organic Cotton T-Shirt",
        category: "Textiles - Tops",
        availability: 0,
        hsCode: "6109.10.00",
        warehouse: "FR-PAR-01",
        country: "France",
        lastSynced: "2024-01-15 09:45",
        status: "out-of-stock",
        aiClassified: false,
        price: 29,
        marketDemand: 'medium',
        seasonality: 'Spring/Summer peak',
        complianceRisk: 'high'
      }
    ];

    this.updateStore(sampleItems);
  }

  subscribe(listener: (store: InventoryStore) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.store));
  }

  private calculateStats(items: InventoryItem[]): void {
    this.store.totalItems = items.length;
    this.store.lowStockCount = items.filter(item => item.status === 'low-stock').length;
    this.store.outOfStockCount = items.filter(item => item.status === 'out-of-stock').length;
    this.store.aiClassifiedCount = items.filter(item => item.aiClassified).length;
    this.store.lastUpdated = new Date().toISOString();
  }

  updateStore(items: InventoryItem[]): void {
    this.store.items = items;
    this.calculateStats(items);
    this.notifyListeners();
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradenest-inventory', JSON.stringify(this.store));
    }
  }

  addItems(newItems: InventoryItem[]): void {
    const updatedItems = [...this.store.items, ...newItems];
    this.updateStore(updatedItems);
  }

  updateItem(itemId: string, updates: Partial<InventoryItem>): void {
    const updatedItems = this.store.items.map(item => 
      item.id === itemId ? { ...item, ...updates, lastSynced: new Date().toISOString() } : item
    );
    this.updateStore(updatedItems);
  }

  removeItem(itemId: string): void {
    const updatedItems = this.store.items.filter(item => item.id !== itemId);
    this.updateStore(updatedItems);
  }

  getStore(): InventoryStore {
    return this.store;
  }

  getItemById(itemId: string): InventoryItem | undefined {
    return this.store.items.find(item => item.id === itemId);
  }

  getItemsBySku(sku: string): InventoryItem[] {
    return this.store.items.filter(item => item.sku === sku);
  }

  getItemsByCategory(category: string): InventoryItem[] {
    return this.store.items.filter(item => item.category === category);
  }

  getItemsByStatus(status: 'in-stock' | 'low-stock' | 'out-of-stock'): InventoryItem[] {
    return this.store.items.filter(item => item.status === status);
  }

  searchItems(query: string): InventoryItem[] {
    const searchTerm = query.toLowerCase();
    return this.store.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.sku.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );
  }

  // Generate data for other components
  generateDashboardData() {
    return {
      totalSKUs: this.store.totalItems,
      aiClassified: this.store.aiClassifiedCount,
      lowStock: this.store.lowStockCount,
      complianceRate: this.store.totalItems > 0 ? 
        Math.round((this.store.aiClassifiedCount / this.store.totalItems) * 100) : 0
    };
  }

  generateBillingData() {
    return this.store.items.map(item => ({
      id: item.id,
      date: item.lastSynced.split(' ')[0],
      product: item.name,
      country: item.country,
      orderValue: (item.price || 50) * Math.min(item.availability, 10),
      taxRate: item.category.includes('Electronics') ? 2.5 : 
               item.category.includes('Textiles') ? 16.5 : 5.0,
      totalTax: 0,
      totalAmount: 0,
      status: item.status === 'in-stock' ? 'paid' : 'pending',
      orderRef: `ORD-${item.sku}`
    }));
  }

  generateComplianceData() {
    return this.store.items.map(item => ({
      id: item.id,
      type: "Commercial Invoice",
      destination: item.country,
      orderRef: `ORD-${item.sku}`,
      status: item.aiClassified ? "completed" : "pending",
      createdDate: item.lastSynced.split(' ')[0],
      downloadUrl: "#",
      complianceRisk: item.complianceRisk || 'low'
    }));
  }
}

export const inventoryManager = InventoryManager.getInstance();