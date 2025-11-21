import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

// Client-side only Walrus client
export class WalrusReadClient {
  private client: any;
  private isInitialized: boolean = false;

  constructor() {
    // Don't initialize in constructor - do it lazily
  }

  private async initialize() {
    if (this.isInitialized) return;
    
    // Dynamic import to avoid SSR issues
    const { walrus } = await import('@mysten/walrus');
    
    this.client = new SuiClient({
      url: getFullnodeUrl("testnet"),
      network: "testnet"
    }).$extend(
      walrus({
        // Read-only configuration - no upload capabilities needed
      }) as any,
    );
    
    this.isInitialized = true;
  }

  async getTradeData(blobId: string): Promise<any> {
    try {
      await this.initialize();
      
      const blobBytes = await this.client.walrus.readBlob({ blobId });
      const textDecoder = new TextDecoder('utf-8');
      const resultString = textDecoder.decode(await (new Blob([new Uint8Array(blobBytes)]).arrayBuffer()));
      return JSON.parse(resultString);
    } catch (error) {
      console.error('Error fetching Walrus data:', error);
      throw new Error(`Failed to retrieve trade data from Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to validate blob ID format
  isValidBlobId(blobId: string): boolean {
    // Walrus blob IDs are typically base64-like strings
    const blobIdPattern = /^[A-Za-z0-9_-]+$/;
    return blobIdPattern.test(blobId) && blobId.length > 10;
  }

  // Generate Walruscan URL
  getWalruscanUrl(blobId: string): string {
    return `https://walruscan.com/testnet/blob/${blobId}`;
  }
}

// Export singleton instance
export const walrusClient = new WalrusReadClient();
