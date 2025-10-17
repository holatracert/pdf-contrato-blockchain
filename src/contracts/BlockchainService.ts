import { ethers } from 'ethers';
import { BlockchainConfig, DocumentInfo, DocumentRegistrationResult } from '../types';
import CodeCrytoDocumentoABI from './CodeCrytoDocumento.json';

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(config: BlockchainConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.contract = new ethers.Contract(
      config.contractAddress,
      CodeCrytoDocumentoABI,
      this.wallet
    );
  }

  /**
   * Registra un documento en la blockchain
   */
  async registerDocument(documentHash: string): Promise<DocumentRegistrationResult> {
    try {
      console.log(`Registrando documento con hash: ${documentHash}`);
      
      const tx = await this.contract.registerDocument(documentHash);
      console.log(`Transacción enviada: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`Transacción confirmada en bloque: ${receipt.blockNumber}`);
      
      return {
        success: true,
        transactionHash: tx.hash,
        documentHash,
        ipfsHash: '', // Se llenará después
      };
    } catch (error) {
      console.error('Error registrando documento en blockchain:', error);
      return {
        success: false,
        documentHash,
        ipfsHash: '',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Verifica si un documento existe en la blockchain
   */
  async verifyDocument(documentHash: string): Promise<boolean> {
    try {
      const exists = await this.contract.verifyDocument(documentHash);
      console.log(`Documento ${documentHash} existe: ${exists}`);
      return exists;
    } catch (error) {
      console.error('Error verificando documento:', error);
      return false;
    }
  }

  /**
   * Obtiene información de un documento registrado
   */
  async getDocumentInfo(documentHash: string): Promise<DocumentInfo | null> {
    try {
      const [owner, timestamp] = await this.contract.getDocumentInfo(documentHash);
      return {
        owner,
        timestamp: Number(timestamp),
        hash: documentHash,
      };
    } catch (error) {
      console.error('Error obteniendo información del documento:', error);
      return null;
    }
  }

  /**
   * Obtiene el balance de la wallet
   */
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Obtiene la dirección de la wallet
   */
  getAddress(): string {
    return this.wallet.address;
  }
}
