import { BlockchainServiceMock } from './BlockchainServiceMock';
import { IPFSService } from './IPFSService';
import { HashGenerator } from '../utils/HashGenerator';
import { 
  BlockchainConfig, 
  IPFSConfig, 
  PDFDocument, 
  DocumentRegistrationResult,
  DocumentInfo 
} from '../types';

export class PDFBlockchainServiceMock {
  private blockchainService: BlockchainServiceMock;
  private ipfsService: IPFSService;

  constructor(blockchainConfig: BlockchainConfig, ipfsConfig: IPFSConfig) {
    this.blockchainService = new BlockchainServiceMock(blockchainConfig);
    this.ipfsService = new IPFSService(ipfsConfig);
  }

  /**
   * Procesa un documento PDF completo: genera hash, sube a IPFS y registra en blockchain
   */
  async processPDFDocument(filePath: string): Promise<DocumentRegistrationResult> {
    try {
      console.log(`\n=== Procesando documento PDF: ${filePath} ===`);
      
      // 1. Validar que es un PDF válido
      if (!HashGenerator.isValidPDF(filePath)) {
        throw new Error('El archivo no es un PDF válido');
      }

      // 2. Generar hash del PDF
      console.log('1. Generando hash del PDF...');
      const documentHash = HashGenerator.generatePDFHash(filePath);
      console.log(`Hash del documento: ${documentHash}`);

      // 3. Subir PDF a IPFS
      console.log('2. Subiendo PDF a IPFS...');
      const ipfsHash = await this.ipfsService.uploadPDF(filePath);
      console.log(`IPFS Hash: ${ipfsHash}`);

      // 4. Registrar hash en blockchain
      console.log('3. Registrando hash en blockchain...');
      const blockchainResult = await this.blockchainService.registerDocument(documentHash);
      
      if (!blockchainResult.success) {
        throw new Error(`Error registrando en blockchain: ${blockchainResult.error}`);
      }

      console.log('✅ Documento procesado exitosamente');
      console.log(`📄 Hash del documento: ${documentHash}`);
      console.log(`🌐 IPFS Hash: ${ipfsHash}`);
      console.log(`⛓️  Transacción: ${blockchainResult.transactionHash}`);

      return {
        success: true,
        transactionHash: blockchainResult.transactionHash,
        documentHash,
        ipfsHash,
      };

    } catch (error) {
      console.error('❌ Error procesando documento:', error);
      return {
        success: false,
        documentHash: '',
        ipfsHash: '',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Verifica un documento existente
   */
  async verifyDocument(documentHash: string): Promise<{
    exists: boolean;
    info?: DocumentInfo;
    ipfsInfo?: { size: number; type?: string };
  }> {
    try {
      console.log(`\n=== Verificando documento: ${documentHash} ===`);
      
      // Verificar en blockchain
      const exists = await this.blockchainService.verifyDocument(documentHash);
      console.log(`Documento existe en blockchain: ${exists}`);

      if (!exists) {
        return { exists: false };
      }

      // Obtener información del blockchain
      const info = await this.blockchainService.getDocumentInfo(documentHash);
      console.log(`Propietario: ${info?.owner}`);
      console.log(`Timestamp: ${new Date(Number(info?.timestamp) * 1000).toISOString()}`);

      return {
        exists: true,
        info: info || undefined,
      };

    } catch (error) {
      console.error('Error verificando documento:', error);
      return { exists: false };
    }
  }

  /**
   * Descarga un documento desde IPFS
   */
  async downloadDocument(ipfsHash: string, outputPath: string): Promise<boolean> {
    try {
      console.log(`\n=== Descargando documento desde IPFS: ${ipfsHash} ===`);
      
      const buffer = await this.ipfsService.downloadFile(ipfsHash);
      
      const fs = require('fs');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✅ Documento descargado a: ${outputPath}`);
      return true;

    } catch (error) {
      console.error('❌ Error descargando documento:', error);
      return false;
    }
  }

  /**
   * Obtiene información completa de un documento
   */
  async getDocumentInfo(documentHash: string, ipfsHash?: string): Promise<{
    blockchain: DocumentInfo | null;
    ipfs?: { size: number; type?: string; url: string };
  }> {
    try {
      const blockchain = await this.blockchainService.getDocumentInfo(documentHash);
      
      let ipfs = undefined;
      if (ipfsHash) {
        const ipfsInfo = await this.ipfsService.getFileInfo(ipfsHash);
        if (ipfsInfo) {
          ipfs = {
            ...ipfsInfo,
            url: this.ipfsService.getFileURL(ipfsHash),
          };
        }
      }

      return { blockchain, ipfs };
    } catch (error) {
      console.error('Error obteniendo información del documento:', error);
      return { blockchain: null };
    }
  }

  /**
   * Verifica la conectividad de los servicios
   */
  async checkServices(): Promise<{
    blockchain: boolean;
    ipfs: boolean;
    wallet: string;
    balance: string;
  }> {
    console.log('\n=== Verificando servicios ===');
    
    const ipfsConnected = await this.ipfsService.isConnected();
    const wallet = this.blockchainService.getAddress();
    const balance = await this.blockchainService.getBalance();
    
    console.log(`🌐 IPFS: ${ipfsConnected ? '✅ Conectado' : '❌ Desconectado'}`);
    console.log(`⛓️  Blockchain: ${wallet ? '✅ Conectado' : '❌ Desconectado'}`);
    console.log(`💰 Wallet: ${wallet}`);
    console.log(`💵 Balance: ${balance} ETH`);

    return {
      blockchain: !!wallet,
      ipfs: ipfsConnected,
      wallet,
      balance,
    };
  }

  /**
   * Obtiene la URL de acceso a un archivo en IPFS
   */
  getIPFSFileURL(ipfsHash: string): string {
    return this.ipfsService.getFileURL(ipfsHash);
  }

  /**
   * Obtiene estadísticas del sistema
   */
  getSystemStats(): any {
    const blockchainStats = this.blockchainService.getStats();
    return {
      blockchain: blockchainStats,
      timestamp: new Date().toISOString(),
    };
  }
}
