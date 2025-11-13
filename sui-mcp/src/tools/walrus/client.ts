import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { walrus, WalrusFile } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export interface WalrusConfig {
  network: 'testnet' | 'mainnet';
  uploadRelayHost?: string;
  maxTip?: number;
}

export class WalrusClient {
  
  private client: any; // Using any for now to avoid type conflicts
  private keypair: Ed25519Keypair;

  constructor(keypair: Ed25519Keypair, config: WalrusConfig) {
    this.keypair = keypair;

    this.client = new SuiClient({
      url: getFullnodeUrl(config.network),
      network: "testnet"
    }).$extend(
      walrus({
        uploadRelay: {
          host: 'https://upload-relay.testnet.walrus.space',
          sendTip: {
            max: 1_000,
          },
        },
      }) as any,
    );
  }

  async storeTradeData(tradeData: any, epochs: number = 15): Promise<string> {
    const jsonString = JSON.stringify(tradeData);
    const file = WalrusFile.from({
      contents: new TextEncoder().encode(jsonString),
      identifier: `trade-${Date.now()}.json`,
      tags: {
        'content-type': 'application/json',
        'trade-arena': 'ai-trade',
        'timestamp': Date.now().toString(),
      },
    });

    const results = await this.client.walrus.writeFiles({
      files: [file],
      epochs,
      deletable: true,
      signer: this.keypair,
    });

    return results[0].blobId;
  }

  async getTradeData(blobId: string): Promise<any> {
    try {
      const [file] = await this.client.walrus.getFiles({ ids: [blobId] });
      const text = await file.text();
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Failed to retrieve trade data from Walrus: ${error}`);
    }
  }

  async getBlobStatus(blobId: string): Promise<any> {
    try {
      const blob = await this.client.walrus.getBlob({ blobId });
      return {
        blobId,
        size: blob.size,
        certifiedEpochs: blob.certifiedEpochs,
        deletable: blob.deletable,
      };
    } catch (error) {
      throw new Error(`Failed to get blob status: ${error}`);
    }
  }
}
