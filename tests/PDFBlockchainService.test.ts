import { PDFBlockchainServiceMock } from '../src/services/PDFBlockchainServiceMock';
import { BlockchainConfig, IPFSConfig } from '../src/types';
import { HashGenerator } from '../src/utils/HashGenerator';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
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

describe('PDF Blockchain Service Mock', () => {
  let pdfService: PDFBlockchainServiceMock;
  let testPDFPath: string;

  beforeAll(async () => {
    pdfService = new PDFBlockchainServiceMock(blockchainConfig, ipfsConfig);
    
    // Crear un PDF de prueba
    testPDFPath = join(__dirname, 'test-document.pdf');
    const testPDFContent = Buffer.from([
      0x25, 0x50, 0x44, 0x46, // %PDF
      0x2D, 0x31, 0x2E, 0x34, // -1.4
      0x0A, 0x25, 0xE2, 0xE3, // \n%âãÏÓ
      0xCF, 0xD3, 0x0A, 0x34, // ÏÓ\n4
      0x20, 0x30, 0x20, 0x6F, //  0 o
      0x62, 0x6A, 0x0A, 0x3C, // bj\n<
      0x3C, 0x2F, 0x54, 0x79, // </Ty
      0x70, 0x65, 0x2F, 0x54, // pe/T
      0x72, 0x65, 0x65, 0x73, // rees
      0x2F, 0x4B, 0x69, 0x64, // /Kid
      0x73, 0x5B, 0x31, 0x20, // s[1 
      0x32, 0x5D, 0x2F, 0x50, // 2]/P
      0x61, 0x72, 0x65, 0x6E, // aren
      0x74, 0x3E, 0x3E, 0x0A, // t>>\n
      0x65, 0x6E, 0x64, 0x6F, // endo
      0x62, 0x6A, 0x0A, 0x0A, // bj\n\n
      0x78, 0x72, 0x65, 0x66, // xref
      0x0A, 0x30, 0x20, 0x31, // \n0 1
      0x0A, 0x30, 0x30, 0x30, // \n000
      0x30, 0x30, 0x30, 0x30, // 0000
      0x30, 0x30, 0x30, 0x30, // 0000
      0x20, 0x6E, 0x0A, 0x0A, //  n\n\n
      0x74, 0x72, 0x61, 0x69, // trai
      0x6C, 0x65, 0x72, 0x0A, // ler\n
      0x3C, 0x3C, 0x2F, 0x53, // <<</S
      0x69, 0x7A, 0x65, 0x20, // ize 
      0x31, 0x3E, 0x3E, 0x0A, // 1>>\n
      0x73, 0x74, 0x61, 0x72, // star
      0x74, 0x78, 0x72, 0x65, // txre
      0x66, 0x0A, 0x30, 0x20, // f\n0 
      0x31, 0x0A, 0x25, 0x25, // 1\n%%
      0x45, 0x4F, 0x46, 0x0A  // EOF\n
    ]);
    
    writeFileSync(testPDFPath, testPDFContent);
  });

  afterAll(async () => {
    // Limpiar archivo de prueba
    if (existsSync(testPDFPath)) {
      unlinkSync(testPDFPath);
    }
  });

  describe('HashGenerator', () => {
    test('debe generar hash válido para PDF', () => {
      const hash = HashGenerator.generatePDFHash(testPDFPath);
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64); // SHA-256 produce 64 caracteres hex
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    test('debe validar PDF correctamente', () => {
      const isValid = HashGenerator.isValidPDF(testPDFPath);
      expect(isValid).toBe(true);
    });

    test('debe obtener información del PDF', () => {
      const info = HashGenerator.getPDFInfo(testPDFPath);
      expect(info.size).toBeGreaterThan(0);
      expect(info.isValid).toBe(true);
      expect(info.hash).toBeDefined();
    });
  });

  describe('Servicios', () => {
    test('debe verificar conectividad de servicios', async () => {
      const services = await pdfService.checkServices();
      expect(services.wallet).toBeDefined();
      expect(services.balance).toBeDefined();
      // IPFS puede no estar disponible en tests
    }, 10000);

    test('debe procesar documento PDF completo', async () => {
      const result = await pdfService.processPDFDocument(testPDFPath);
      
      expect(result.success).toBe(true);
      expect(result.documentHash).toBeDefined();
      expect(result.transactionHash).toBeDefined();
      expect(result.ipfsHash).toBeDefined();
      
      // Verificar que el documento se registró correctamente
      const verification = await pdfService.verifyDocument(result.documentHash);
      expect(verification.exists).toBe(true);
      expect(verification.info).toBeDefined();
    }, 10000);
  });

  describe('Verificación de documentos', () => {
    let testDocumentHash: string;

    beforeAll(async () => {
      // Procesar un documento de prueba
      const result = await pdfService.processPDFDocument(testPDFPath);
      if (result.success) {
        testDocumentHash = result.documentHash;
      } else {
        // Crear un hash de prueba si falla
        testDocumentHash = '0x' + 'a'.repeat(64);
      }
    });

    test('debe verificar documento existente', async () => {
      if (testDocumentHash) {
        const verification = await pdfService.verifyDocument(testDocumentHash);
        expect(verification.exists).toBe(true);
        expect(verification.info).toBeDefined();
        expect(verification.info?.owner).toBeDefined();
        expect(verification.info?.timestamp).toBeDefined();
      }
    }, 10000);

    test('debe retornar false para documento inexistente', async () => {
      const fakeHash = '0x' + 'a'.repeat(64);
      const verification = await pdfService.verifyDocument(fakeHash);
      expect(verification.exists).toBe(false);
    }, 10000);
  });
});
