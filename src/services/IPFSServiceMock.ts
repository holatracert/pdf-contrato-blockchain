import { IPFSConfig } from '../types';

/**
 * Mock del servicio IPFS para pruebas
 */
export class IPFSServiceMock {
  private config: IPFSConfig;

  constructor(config: IPFSConfig) {
    this.config = config;
  }

  /**
   * Sube un archivo PDF a IPFS (mock)
   */
  async uploadPDF(filePath: string): Promise<string> {
    console.log(`[MOCK] Subiendo PDF a IPFS: ${filePath}`);
    // Simular hash IPFS
    const mockHash = `QmMock${Date.now()}${Math.random().toString(36).substring(2)}`;
    console.log(`[MOCK] PDF subido a IPFS con hash: ${mockHash}`);
    return mockHash;
  }

  /**
   * Sube un buffer a IPFS (mock)
   */
  async uploadBuffer(buffer: Buffer, filename?: string): Promise<string> {
    const mockHash = `QmMock${Date.now()}${Math.random().toString(36).substring(2)}`;
    return mockHash;
  }

  /**
   * Descarga un archivo desde IPFS (mock)
   */
  async downloadFile(ipfsHash: string): Promise<Buffer> {
    console.log(`[MOCK] Descargando archivo desde IPFS: ${ipfsHash}`);
    // Simular contenido
    const mockContent = Buffer.from('Mock PDF content for testing');
    console.log(`[MOCK] Archivo descargado, tamaño: ${mockContent.length} bytes`);
    return mockContent;
  }

  /**
   * Verifica si un archivo existe en IPFS (mock)
   */
  async fileExists(ipfsHash: string): Promise<boolean> {
    return ipfsHash.startsWith('QmMock');
  }

  /**
   * Obtiene información de un archivo en IPFS (mock)
   */
  async getFileInfo(ipfsHash: string): Promise<{ size: number; type?: string } | null> {
    if (ipfsHash.startsWith('QmMock')) {
      return {
        size: 1024,
        type: 'application/pdf',
      };
    }
    return null;
  }

  /**
   * Pin un archivo en IPFS (mock)
   */
  async pinFile(ipfsHash: string): Promise<boolean> {
    console.log(`[MOCK] Archivo pinneado: ${ipfsHash}`);
    return true;
  }

  /**
   * Unpin un archivo de IPFS (mock)
   */
  async unpinFile(ipfsHash: string): Promise<boolean> {
    console.log(`[MOCK] Archivo unpinneado: ${ipfsHash}`);
    return true;
  }

  /**
   * Obtiene la URL de acceso al archivo
   */
  getFileURL(ipfsHash: string): string {
    return `${this.config.gatewayUrl}/ipfs/${ipfsHash}`;
  }

  /**
   * Verifica la conexión con IPFS (mock)
   */
  async isConnected(): Promise<boolean> {
    console.log(`[MOCK] Conectado a IPFS con Mock`);
    return true;
  }
}
