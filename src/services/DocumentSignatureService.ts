import { PDFBlockchainServiceMock } from './PDFBlockchainServiceMock';
import { BlockchainConfig, IPFSConfig, DocumentRegistrationResult } from '../types';
import { HashGenerator } from '../utils/HashGenerator';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename, extname } from 'path';

export interface DocumentSignature {
  originalPath: string;
  signedPath: string;
  hash: string;
  ipfsHash: string;
  transactionHash: string;
  signature: string;
  timestamp: number;
  status: 'pending' | 'signed' | 'verified' | 'failed';
}

export interface SignatureResult {
  success: boolean;
  documentSignature?: DocumentSignature;
  error?: string;
}

export class DocumentSignatureService {
  private pdfService: PDFBlockchainServiceMock;
  private pdfFolder: string;
  private signedFolder: string;
  private signatures: Map<string, DocumentSignature> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    blockchainConfig: BlockchainConfig,
    ipfsConfig: IPFSConfig,
    pdfFolder: string = './pdf',
    signedFolder: string = './signed-documents'
  ) {
    this.pdfService = new PDFBlockchainServiceMock(blockchainConfig, ipfsConfig);
    this.pdfFolder = pdfFolder;
    this.signedFolder = signedFolder;
    
    // Crear carpetas si no existen
    this.ensureDirectories();
    
    // Cargar firmas existentes
    this.loadExistingSignatures();
  }

  /**
   * Asegura que las carpetas necesarias existan
   */
  private ensureDirectories(): void {
    if (!existsSync(this.pdfFolder)) {
      require('fs').mkdirSync(this.pdfFolder, { recursive: true });
    }
    if (!existsSync(this.signedFolder)) {
      require('fs').mkdirSync(this.signedFolder, { recursive: true });
    }
  }

  /**
   * Carga firmas existentes desde archivos
   */
  private loadExistingSignatures(): void {
    try {
      const signaturesFile = join(this.signedFolder, 'signatures.json');
      if (existsSync(signaturesFile)) {
        const data = readFileSync(signaturesFile, 'utf8');
        const signatures = JSON.parse(data);
        this.signatures = new Map(signatures);
        console.log(`📋 Cargadas ${this.signatures.size} firmas existentes`);
      }
    } catch (error) {
      console.error('Error cargando firmas existentes:', error);
    }
  }

  /**
   * Guarda las firmas en archivo
   */
  private saveSignatures(): void {
    try {
      const signaturesFile = join(this.signedFolder, 'signatures.json');
      const signaturesArray = Array.from(this.signatures.entries());
      writeFileSync(signaturesFile, JSON.stringify(signaturesArray, null, 2));
    } catch (error) {
      console.error('Error guardando firmas:', error);
    }
  }

  /**
   * Obtiene lista de documentos PDF en la carpeta
   */
  getPDFDocuments(): string[] {
    try {
      if (!existsSync(this.pdfFolder)) {
        return [];
      }

      const files = readdirSync(this.pdfFolder);
      return files
        .filter(file => extname(file).toLowerCase() === '.pdf')
        .map(file => join(this.pdfFolder, file));
    } catch (error) {
      console.error('Error obteniendo documentos PDF:', error);
      return [];
    }
  }

  /**
   * Verifica si un documento ya está firmado
   */
  isDocumentSigned(filePath: string): boolean {
    const hash = this.getDocumentHash(filePath);
    return this.signatures.has(hash);
  }

  /**
   * Obtiene el hash de un documento
   */
  private getDocumentHash(filePath: string): string {
    try {
      return HashGenerator.generatePDFHash(filePath);
    } catch (error) {
      console.error('Error generando hash del documento:', error);
      return '';
    }
  }

  /**
   * Firma un documento PDF
   */
  async signDocument(filePath: string): Promise<SignatureResult> {
    try {
      console.log(`\n🔏 Firmando documento: ${basename(filePath)}`);
      
      // Verificar que el archivo existe
      if (!existsSync(filePath)) {
        return {
          success: false,
          error: 'El archivo no existe'
        };
      }

      // Verificar que es un PDF válido
      if (!HashGenerator.isValidPDF(filePath)) {
        return {
          success: false,
          error: 'El archivo no es un PDF válido'
        };
      }

      // Verificar si ya está firmado
      const hash = this.getDocumentHash(filePath);
      if (this.isDocumentSigned(filePath)) {
        return {
          success: false,
          error: 'El documento ya está firmado'
        };
      }

      // Procesar documento en blockchain
      console.log('📄 Procesando documento en blockchain...');
      const result = await this.pdfService.processPDFDocument(filePath);
      
      if (!result.success) {
        return {
          success: false,
          error: `Error procesando documento: ${result.error}`
        };
      }

      // Crear firma digital
      const signature = this.createDigitalSignature(filePath, result);
      
      // Crear documento firmado
      const signedPath = this.createSignedDocument(filePath, signature);
      
      // Crear objeto de firma
      const documentSignature: DocumentSignature = {
        originalPath: filePath,
        signedPath: signedPath,
        hash: result.documentHash,
        ipfsHash: result.ipfsHash,
        transactionHash: result.transactionHash || '',
        signature: signature,
        timestamp: Date.now(),
        status: 'signed'
      };

      // Guardar firma
      this.signatures.set(hash, documentSignature);
      this.saveSignatures();

      console.log('✅ Documento firmado exitosamente');
      console.log(`📄 Hash: ${result.documentHash}`);
      console.log(`🌐 IPFS: ${result.ipfsHash}`);
      console.log(`⛓️  TX: ${result.transactionHash}`);
      console.log(`🔏 Firma: ${signature}`);

      return {
        success: true,
        documentSignature
      };

    } catch (error) {
      console.error('❌ Error firmando documento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea una firma digital para el documento
   */
  private createDigitalSignature(filePath: string, result: DocumentRegistrationResult): string {
    const timestamp = Date.now();
    const filename = basename(filePath);
    const content = `${filename}|${result.documentHash}|${result.ipfsHash}|${timestamp}`;
    
    // Simular firma digital usando hash
    const signature = require('crypto')
      .createHash('sha256')
      .update(content)
      .digest('hex');
    
    return `SIG_${signature.substring(0, 16)}`;
  }

  /**
   * Crea una copia firmada del documento
   */
  private createSignedDocument(originalPath: string, signature: string): string {
    const filename = basename(originalPath, '.pdf');
    const signedFilename = `${filename}_SIGNED_${signature}.pdf`;
    const signedPath = join(this.signedFolder, signedFilename);
    
    // Copiar archivo original
    const originalContent = readFileSync(originalPath);
    writeFileSync(signedPath, originalContent);
    
    return signedPath;
  }

  /**
   * Verifica un documento firmado
   */
  async verifySignedDocument(filePath: string): Promise<{
    isValid: boolean;
    signature?: DocumentSignature;
    error?: string;
  }> {
    try {
      const hash = this.getDocumentHash(filePath);
      const signature = this.signatures.get(hash);
      
      if (!signature) {
        return {
          isValid: false,
          error: 'Documento no encontrado en el sistema de firmas'
        };
      }

      // Verificar en blockchain
      const verification = await this.pdfService.verifyDocument(hash);
      
      if (!verification.exists) {
        return {
          isValid: false,
          error: 'Documento no verificado en blockchain'
        };
      }

      // Actualizar estado
      signature.status = 'verified';
      this.signatures.set(hash, signature);
      this.saveSignatures();

      return {
        isValid: true,
        signature
      };

    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Error verificando documento'
      };
    }
  }

  /**
   * Inicia el monitoreo automático cada 10 minutos
   */
  startAutoVerification(): void {
    console.log('🔄 Iniciando verificación automática cada 10 minutos...');
    
    this.monitoringInterval = setInterval(async () => {
      console.log('\n🔄 Ejecutando verificación automática...');
      await this.verifyAllDocuments();
    }, 10 * 60 * 1000); // 10 minutos
  }

  /**
   * Detiene el monitoreo automático
   */
  stopAutoVerification(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️  Verificación automática detenida');
    }
  }

  /**
   * Verifica todos los documentos firmados
   */
  async verifyAllDocuments(): Promise<void> {
    try {
      console.log(`🔍 Verificando ${this.signatures.size} documentos firmados...`);
      
      let verified = 0;
      let failed = 0;
      
      for (const [hash, signature] of this.signatures) {
        try {
          const result = await this.verifySignedDocument(signature.originalPath);
          
          if (result.isValid) {
            verified++;
            console.log(`✅ ${basename(signature.originalPath)} - Verificado`);
          } else {
            failed++;
            console.log(`❌ ${basename(signature.originalPath)} - ${result.error}`);
            signature.status = 'failed';
            this.signatures.set(hash, signature);
          }
        } catch (error) {
          failed++;
          console.log(`❌ ${basename(signature.originalPath)} - Error: ${error}`);
        }
      }
      
      this.saveSignatures();
      console.log(`📊 Verificación completada: ${verified} verificados, ${failed} fallidos`);
      
    } catch (error) {
      console.error('❌ Error en verificación automática:', error);
    }
  }

  /**
   * Obtiene estadísticas del sistema
   */
  getSystemStats(): {
    totalDocuments: number;
    signedDocuments: number;
    verifiedDocuments: number;
    failedDocuments: number;
    pendingDocuments: number;
  } {
    const stats = {
      totalDocuments: this.signatures.size,
      signedDocuments: 0,
      verifiedDocuments: 0,
      failedDocuments: 0,
      pendingDocuments: 0
    };

    for (const signature of this.signatures.values()) {
      switch (signature.status) {
        case 'signed':
          stats.signedDocuments++;
          break;
        case 'verified':
          stats.verifiedDocuments++;
          break;
        case 'failed':
          stats.failedDocuments++;
          break;
        case 'pending':
          stats.pendingDocuments++;
          break;
      }
    }

    return stats;
  }

  /**
   * Obtiene lista de documentos pendientes
   */
  getPendingDocuments(): string[] {
    const pendingFiles: string[] = [];
    const pdfFiles = this.getPDFDocuments();
    
    for (const file of pdfFiles) {
      if (!this.isDocumentSigned(file)) {
        pendingFiles.push(file);
      }
    }
    
    return pendingFiles;
  }

  /**
   * Firma automáticamente todos los documentos pendientes
   */
  async signAllPendingDocuments(): Promise<{
    success: number;
    failed: number;
    results: SignatureResult[];
  }> {
    const pendingFiles = this.getPendingDocuments();
    const results: SignatureResult[] = [];
    let success = 0;
    let failed = 0;

    console.log(`\n🔏 Firmando ${pendingFiles.length} documentos pendientes...`);

    for (const file of pendingFiles) {
      try {
        const result = await this.signDocument(file);
        results.push(result);
        
        if (result.success) {
          success++;
          console.log(`✅ ${basename(file)} - Firmado exitosamente`);
        } else {
          failed++;
          console.log(`❌ ${basename(file)} - ${result.error}`);
        }
      } catch (error) {
        failed++;
        console.log(`❌ ${basename(file)} - Error: ${error}`);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    console.log(`\n📊 Firmado completado: ${success} exitosos, ${failed} fallidos`);
    
    return { success, failed, results };
  }
}
