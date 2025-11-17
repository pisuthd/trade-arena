import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';;
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
      url: getFullnodeUrl("testnet"),
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

  async storeTradeData(tradeData: any, epochs: number = 2): Promise<string> {
    const jsonString = JSON.stringify(tradeData);
 

    const { blobId } = await this.client.walrus.writeBlob({
      blob: new TextEncoder().encode(jsonString),
      deletable: false,
      epochs,
      signer: this.keypair,
    });

    return blobId;
  }

  async getTradeData(blobId: string): Promise<any> {
    try { 
      const blobBytes = await this.client.walrus.readBlob({ blobId });
      const textDecoder = new TextDecoder('utf-8');
      const resultString = textDecoder.decode(await (new Blob([new Uint8Array(blobBytes)])).arrayBuffer());
      // console.error("resultString : ", resultString)
      return JSON.parse(resultString)
    } catch (error) {
      throw new Error(`Failed to retrieve trade data from Walrus: ${error}`);
    }
  }

}
