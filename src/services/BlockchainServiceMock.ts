import { BlockchainConfig, DocumentInfo, DocumentRegistrationResult } from '../types';

/**
 * Mock del servicio de blockchain para desarrollo y pruebas
 */
export class BlockchainServiceMock {
  private config: BlockchainConfig;
  private documents: Map<string, DocumentInfo> = new Map();

  constructor(config: BlockchainConfig) {
    this.config = config;
  }

  /**
   * Registra un documento en la blockchain (mock)
   */
  async registerDocument(documentHash: string): Promise<DocumentRegistrationResult> {
    try {
      console.log(`[MOCK] Registrando documento con hash: ${documentHash}`);
      
      // Simular transacción
      const mockTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2)}`;
      
      // Almacenar documento en memoria
      const documentInfo: DocumentInfo = {
        owner: this.getAddress(),
        timestamp: Math.floor(Date.now() / 1000),
        hash: documentHash,
      };
      
      this.documents.set(documentHash, documentInfo);
      
      console.log(`[MOCK] Transacción simulada: ${mockTxHash}`);
      console.log(`[MOCK] Documento registrado en blockchain simulada`);
      
      return {
        success: true,
        transactionHash: mockTxHash,
        documentHash,
        ipfsHash: '', // Se llenará después
      };
    } catch (error) {
      console.error('[MOCK] Error registrando documento en blockchain:', error);
      return {
        success: false,
        documentHash,
        ipfsHash: '',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Verifica si un documento existe en la blockchain (mock)
   */
  async verifyDocument(documentHash: string): Promise<boolean> {
    try {
      const exists = this.documents.has(documentHash);
      console.log(`[MOCK] Documento ${documentHash} existe: ${exists}`);
      return exists;
    } catch (error) {
      console.error('[MOCK] Error verificando documento:', error);
      return false;
    }
  }

  /**
   * Obtiene información de un documento registrado (mock)
   */
  async getDocumentInfo(documentHash: string): Promise<DocumentInfo | null> {
    try {
      const info = this.documents.get(documentHash);
      if (info) {
        console.log(`[MOCK] Información del documento encontrada`);
        return info;
      }
      return null;
    } catch (error) {
      console.error('[MOCK] Error obteniendo información del documento:', error);
      return null;
    }
  }

  /**
   * Obtiene el balance de la wallet (mock)
   */
  async getBalance(): Promise<string> {
    return "10000.0"; // Balance simulado
  }

  /**
   * Obtiene la dirección de la wallet
   */
  getAddress(): string {
    return this.config.privateKey ? 
      this.deriveAddressFromPrivateKey(this.config.privateKey) : 
      '0x0000000000000000000000000000000000000000';
  }

  /**
   * Deriva la dirección de la clave privada (simulado)
   */
  private deriveAddressFromPrivateKey(privateKey: string): string {
    // Simular derivación de dirección
    return '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  }

  /**
   * Obtiene estadísticas del mock
   */
  getStats(): { totalDocuments: number; documents: string[] } {
    return {
      totalDocuments: this.documents.size,
      documents: Array.from(this.documents.keys())
    };
  }
}
