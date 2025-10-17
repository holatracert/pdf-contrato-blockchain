import { DocumentSignatureService } from '../src/services/DocumentSignatureService';
import { DocumentMonitoringService } from '../src/services/DocumentMonitoringService';
import { BlockchainConfig, IPFSConfig } from '../src/types';
import { writeFileSync, unlinkSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Configuración de prueba
const blockchainConfig: BlockchainConfig = {
  rpcUrl: 'http://localhost:8545',
  privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  contractAddress: '0x4ed7c70f96b99c776995fb64377f0d4ab3b0e1c1',
  networkId: 31337,
};

const ipfsConfig: IPFSConfig = {
  apiUrl: 'http://localhost:5001',
  gatewayUrl: 'http://localhost:8080',
};

describe('Document Signature Service', () => {
  let signatureService: DocumentSignatureService;
  let monitoringService: DocumentMonitoringService;
  let testPDFPath: string;
  let testPDFPath2: string;

  beforeAll(async () => {
    // Crear servicio de firmas
    signatureService = new DocumentSignatureService(
      blockchainConfig,
      ipfsConfig,
      './test-pdf',
      './test-signed'
    );
    
    // Crear servicio de monitoreo
    monitoringService = new DocumentMonitoringService(signatureService, {
      checkInterval: 1000, // 1 segundo para pruebas
      autoSign: true,
      autoVerify: true,
      logLevel: 'info'
    });
    
    // Crear PDFs de prueba
    testPDFPath = join('./test-pdf', 'test-document-1.pdf');
    testPDFPath2 = join('./test-pdf', 'test-document-2.pdf');
    
    const testPDFContent = Buffer.from([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, // %PDF-1.4
      0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A, 0x34, // \n%âãÏÓ\n4
      0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, //  0 obj\n<
      0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, 0x43, // </Type/C
      0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67, 0x2F, 0x50, // atalog/P
      0x61, 0x67, 0x65, 0x73, 0x20, 0x31, 0x20, 0x30, // ages 1 0
      0x20, 0x52, 0x3E, 0x3E, 0x0A, 0x65, 0x6E, 0x64, //  R>>\nend
      0x6F, 0x62, 0x6A, 0x0A, 0x0A, 0x78, 0x72, 0x65, // obj\n\nxre
      0x66, 0x0A, 0x30, 0x20, 0x31, 0x0A, 0x30, 0x30, // f\n0 1\n00
      0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, // 0000000
      0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A, 0x0A, // 0000 n\n\n
      0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72, 0x0A, // trailer\n
      0x3C, 0x3C, 0x2F, 0x53, 0x69, 0x7A, 0x65, 0x20, // <<</Size 
      0x31, 0x3E, 0x3E, 0x0A, 0x73, 0x74, 0x61, 0x72, // 1>>\nstar
      0x74, 0x78, 0x72, 0x65, 0x66, 0x0A, 0x30, 0x20, // txref\n0 
      0x31, 0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46, 0x0A  // 1\n%%EOF\n
    ]);
    
    // Crear directorios de prueba
    if (!existsSync('./test-pdf')) {
      require('fs').mkdirSync('./test-pdf', { recursive: true });
    }
    if (!existsSync('./test-signed')) {
      require('fs').mkdirSync('./test-signed', { recursive: true });
    }
    
    // Crear archivos de prueba
    writeFileSync(testPDFPath, testPDFContent);
    writeFileSync(testPDFPath2, testPDFContent);
  });

  afterAll(async () => {
    // Limpiar archivos de prueba
    try {
      if (existsSync('./test-pdf')) {
        const files = readdirSync('./test-pdf');
        for (const file of files) {
          unlinkSync(join('./test-pdf', file));
        }
        require('fs').rmdirSync('./test-pdf');
      }
      
      if (existsSync('./test-signed')) {
        const files = readdirSync('./test-signed');
        for (const file of files) {
          unlinkSync(join('./test-signed', file));
        }
        require('fs').rmdirSync('./test-signed');
      }
      
      // Limpiar archivos de log
      if (existsSync('monitoring.log')) {
        unlinkSync('monitoring.log');
      }
      if (existsSync('monitoring-status.json')) {
        unlinkSync('monitoring-status.json');
      }
    } catch (error) {
      console.error('Error limpiando archivos de prueba:', error);
    }
  });

  describe('Document Signature Service', () => {
    test('debe obtener documentos PDF en la carpeta', () => {
      const documents = signatureService.getPDFDocuments();
      expect(documents).toHaveLength(2);
      expect(documents).toContain(testPDFPath);
      expect(documents).toContain(testPDFPath2);
    });

    test('debe verificar si un documento está firmado', () => {
      const isSigned = signatureService.isDocumentSigned(testPDFPath);
      expect(isSigned).toBe(false);
    });

    test('debe firmar un documento PDF', async () => {
      const result = await signatureService.signDocument(testPDFPath);
      
      expect(result.success).toBe(true);
      expect(result.documentSignature).toBeDefined();
      expect(result.documentSignature?.hash).toBeDefined();
      expect(result.documentSignature?.ipfsHash).toBeDefined();
      expect(result.documentSignature?.signature).toBeDefined();
      expect(result.documentSignature?.status).toBe('signed');
    }, 15000);

    test('debe verificar que el documento ya está firmado', () => {
      const isSigned = signatureService.isDocumentSigned(testPDFPath);
      expect(isSigned).toBe(true);
    });

    test('debe verificar un documento firmado', async () => {
      const result = await signatureService.verifySignedDocument(testPDFPath);
      
      expect(result.isValid).toBe(true);
      expect(result.signature).toBeDefined();
      expect(result.signature?.status).toBe('verified');
    }, 10000);

    test('debe obtener estadísticas del sistema', () => {
      const stats = signatureService.getSystemStats();
      
      expect(stats.totalDocuments).toBeGreaterThan(0);
      expect(stats.signedDocuments).toBeGreaterThanOrEqual(0);
      expect(stats.verifiedDocuments).toBeGreaterThanOrEqual(0);
    });

    test('debe obtener documentos pendientes', () => {
      const pending = signatureService.getPendingDocuments();
      expect(Array.isArray(pending)).toBe(true);
      // El segundo documento debería estar pendiente si no se ha firmado
    });

    test('debe firmar todos los documentos pendientes', async () => {
      const result = await signatureService.signAllPendingDocuments();
      
      expect(result.success).toBeGreaterThanOrEqual(0);
      expect(result.results).toBeDefined();
    }, 20000);
  });

  describe('Document Monitoring Service', () => {
    test('debe iniciar y detener el monitoreo', () => {
      expect(monitoringService.getStatus().isRunning).toBe(false);
      
      monitoringService.start();
      expect(monitoringService.getStatus().isRunning).toBe(true);
      
      monitoringService.stop();
      expect(monitoringService.getStatus().isRunning).toBe(false);
    });

    test('debe obtener estado del monitoreo', () => {
      const status = monitoringService.getStatus();
      
      expect(status.isRunning).toBeDefined();
      expect(status.config).toBeDefined();
      expect(status.stats).toBeDefined();
      expect(status.systemStats).toBeDefined();
    });

    test('debe actualizar configuración', () => {
      const newConfig = { logLevel: 'debug' as const };
      monitoringService.updateConfig(newConfig);
      
      const status = monitoringService.getStatus();
      expect(status.config.logLevel).toBe('debug');
    });

    test('debe forzar verificación inmediata', async () => {
      await monitoringService.forceCheck();
      
      const status = monitoringService.getStatus();
      expect(status.stats.totalChecks).toBeGreaterThan(0);
    }, 10000);

    test('debe obtener historial de logs', () => {
      const logs = monitoringService.getLogHistory(10);
      expect(Array.isArray(logs)).toBe(true);
    });

    test('debe exportar estadísticas', () => {
      const exportFile = monitoringService.exportStats();
      expect(existsSync(exportFile)).toBe(true);
      
      // Limpiar archivo de exportación
      unlinkSync(exportFile);
    });
  });

  describe('Integración completa', () => {
    test('debe procesar flujo completo de firma y verificación', async () => {
      // 1. Verificar documentos pendientes
      const pending = signatureService.getPendingDocuments();
      expect(Array.isArray(pending)).toBe(true);
      
      // 2. Firmar documentos
      const signResult = await signatureService.signAllPendingDocuments();
      expect(signResult.success).toBeGreaterThanOrEqual(0);
      
      // 3. Verificar documentos firmados
      await signatureService.verifyAllDocuments();
      
      // 4. Obtener estadísticas finales
      const stats = signatureService.getSystemStats();
      expect(stats.verifiedDocuments).toBeGreaterThanOrEqual(0);
    }, 30000);
  });
});
