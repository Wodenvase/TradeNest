export interface APIConfig {
  claudeApiKey?: string;
  baseUrl?: string;
}

export class APIService {
  private static config: APIConfig = {
    claudeApiKey: '',
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.anthropic.com'
  };

  static setConfig(config: Partial<APIConfig>) {
    this.config = { ...this.config, ...config };
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradenest-api-config', JSON.stringify(this.config));
    }
  }

  static loadConfig() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tradenest-api-config');
      if (stored) {
        try {
          const storedConfig = JSON.parse(stored);
          // Merge with default config, prioritizing stored values
          this.config = { ...this.config, ...storedConfig };
        } catch (e) {
          console.warn('Failed to load stored API config');
        }
      }
    }
  }

  static getConfig(): APIConfig {
    return this.config;
  }

  static isConfigured(): boolean {
    return !!(this.config.claudeApiKey);
  }

  static hasClaudeKey(): boolean {
    return !!(this.config.claudeApiKey && this.config.claudeApiKey.trim().length > 0);
  }

  static async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(this.config.claudeApiKey && { 'X-Claude-API-Key': this.config.claudeApiKey })
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// Load config on initialization
if (typeof window !== 'undefined') {
  APIService.loadConfig();
}