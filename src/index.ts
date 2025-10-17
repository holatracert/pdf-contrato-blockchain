import dotenv from 'dotenv';
import { PDFBlockchainService } from './services/PDFBlockchainService';
import { BlockchainConfig, IPFSConfig } from './types';

// Cargar variables de entorno
dotenv.config();

// Configuración del sistema
const blockchainConfig: BlockchainConfig = {
  rpcUrl: process.env.ANVIL_RPC_URL || 'http://localhost:8545',
  privateKey: process.env.ANVIL_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  contractAddress: process.env.CONTRACT_ADDRESS || '0x4ed7c70f96b99c776995fb64377f0d4ab3b0e1c1',
  networkId: parseInt(process.env.NETWORK_ID || '31337'),
};

const ipfsConfig: IPFSConfig = {
  apiUrl: process.env.IPFS_API_URL || 'http://localhost:5001',
  gatewayUrl: process.env.IPFS_GATEWAY_URL || 'http://localhost:8080',
};

// Crear instancia del servicio
const pdfService = new PDFBlockchainService(blockchainConfig, ipfsConfig);

/**
 * Función principal para procesar un documento PDF
 */
async function processDocument(filePath: string) {
  try {
    console.log('🚀 Iniciando procesamiento de documento PDF...\n');
    
    // Verificar servicios
    await pdfService.checkServices();
    
    // Procesar documento
    const result = await pdfService.processPDFDocument(filePath);
    
    if (result.success) {
      console.log('\n🎉 ¡Documento procesado exitosamente!');
      console.log(`📄 Hash del documento: ${result.documentHash}`);
      console.log(`🌐 IPFS Hash: ${result.ipfsHash}`);
      console.log(`⛓️  Transacción: ${result.transactionHash}`);
      console.log(`🔗 URL IPFS: ${pdfService.getIPFSFileURL(result.ipfsHash)}`);
    } else {
      console.log('\n❌ Error procesando documento:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
}

/**
 * Función para verificar un documento
 */
async function verifyDocument(documentHash: string) {
  try {
    console.log('🔍 Verificando documento...\n');
    
    const result = await pdfService.verifyDocument(documentHash);
    
    if (result.exists && result.info) {
      console.log('✅ Documento verificado exitosamente');
      console.log(`👤 Propietario: ${result.info.owner}`);
      console.log(`📅 Fecha: ${new Date(Number(result.info.timestamp) * 1000).toISOString()}`);
    } else {
      console.log('❌ Documento no encontrado en la blockchain');
    }
    
  } catch (error) {
    console.error('❌ Error verificando documento:', error);
  }
}

/**
 * Función para descargar un documento desde IPFS
 */
async function downloadDocument(ipfsHash: string, outputPath: string) {
  try {
    console.log('📥 Descargando documento desde IPFS...\n');
    
    const success = await pdfService.downloadDocument(ipfsHash, outputPath);
    
    if (success) {
      console.log('✅ Documento descargado exitosamente');
    } else {
      console.log('❌ Error descargando documento');
    }
    
  } catch (error) {
    console.error('❌ Error descargando documento:', error);
  }
}

// Exportar funciones para uso en otros módulos
export {
  processDocument,
  verifyDocument,
  downloadDocument,
  pdfService,
};

// Si se ejecuta directamente, mostrar ayuda
if (require.main === module) {
  console.log(`
🔐 Sistema de Blockchain para Documentos PDF
==========================================

Uso:
  npm run dev <comando> [argumentos]

Comandos disponibles:
  process <ruta-pdf>           - Procesar un documento PDF
  verify <hash-documento>      - Verificar un documento
  download <ipfs-hash> <ruta>  - Descargar desde IPFS
  check                       - Verificar servicios

Ejemplos:
  npm run dev process ./documento.pdf
  npm run dev verify 0x1234...
  npm run dev download QmHash... ./descarga.pdf
  npm run dev check

Configuración:
  - Asegúrate de que Anvil esté ejecutándose en http://localhost:8545
  - Asegúrate de que IPFS esté ejecutándose en http://localhost:5001
  - Configura las variables de entorno en .env
`);
}
