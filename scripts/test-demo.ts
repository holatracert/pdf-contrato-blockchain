import dotenv from 'dotenv';
import { PDFBlockchainService } from '../src/services/PDFBlockchainService';
import { BlockchainConfig, IPFSConfig } from '../src/types';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

// Cargar variables de entorno
dotenv.config();

// Configuración
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

async function runDemo() {
  console.log('🚀 Iniciando Demo del Sistema de Blockchain para PDFs\n');
  
  const pdfService = new PDFBlockchainService(blockchainConfig, ipfsConfig);
  
  try {
    // 1. Verificar servicios
    console.log('1️⃣ Verificando servicios...');
    const services = await pdfService.checkServices();
    console.log(`   ✅ Blockchain: ${services.blockchain ? 'Conectado' : 'Desconectado'}`);
    console.log(`   ✅ IPFS: ${services.ipfs ? 'Conectado' : 'Desconectado'}`);
    console.log(`   💰 Wallet: ${services.wallet}`);
    console.log(`   💵 Balance: ${services.balance} ETH\n`);

    if (!services.blockchain) {
      throw new Error('❌ Blockchain no disponible. Asegúrate de que Anvil esté ejecutándose.');
    }

    // 2. Crear PDF de prueba
    console.log('2️⃣ Creando PDF de prueba...');
    const testPDFPath = join(__dirname, 'demo-document.pdf');
    const testPDFContent = Buffer.from([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, // %PDF-1.4
      0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A, 0x34, // \n%âãÏÓ\n4
      0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, //  0 obj\n<
      0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, 0x54, // </Type/T
      0x72, 0x65, 0x65, 0x73, 0x2F, 0x4B, 0x69, 0x64, // rees/Kid
      0x73, 0x5B, 0x31, 0x20, 0x32, 0x5D, 0x2F, 0x50, // s[1 2]/P
      0x61, 0x72, 0x65, 0x6E, 0x74, 0x3E, 0x3E, 0x0A, // arent>>\n
      0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, 0x0A, // endobj\n\n
      0x78, 0x72, 0x65, 0x66, 0x0A, 0x30, 0x20, 0x31, // xref\n0 1
      0x0A, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, // \n0000000
      0x30, 0x30, 0x30, 0x30, 0x20, 0x6E, 0x0A, 0x0A, // 0000 n\n\n
      0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72, 0x0A, // trailer\n
      0x3C, 0x3C, 0x2F, 0x53, 0x69, 0x7A, 0x65, 0x20, // <<</Size 
      0x31, 0x3E, 0x3E, 0x0A, 0x73, 0x74, 0x61, 0x72, // 1>>\nstar
      0x74, 0x78, 0x72, 0x65, 0x66, 0x0A, 0x30, 0x20, // txref\n0 
      0x31, 0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46, 0x0A  // 1\n%%EOF\n
    ]);
    
    writeFileSync(testPDFPath, testPDFContent);
    console.log(`   ✅ PDF de prueba creado: ${testPDFPath}\n`);

    // 3. Procesar documento
    console.log('3️⃣ Procesando documento PDF...');
    const result = await pdfService.processPDFDocument(testPDFPath);
    
    if (result.success) {
      console.log('   ✅ Documento procesado exitosamente');
      console.log(`   📄 Hash del documento: ${result.documentHash}`);
      console.log(`   🌐 IPFS Hash: ${result.ipfsHash}`);
      console.log(`   ⛓️  Transacción: ${result.transactionHash}`);
      console.log(`   🔗 URL IPFS: ${pdfService.getIPFSFileURL(result.ipfsHash)}\n`);

      // 4. Verificar documento
      console.log('4️⃣ Verificando documento...');
      const verification = await pdfService.verifyDocument(result.documentHash);
      
      if (verification.exists && verification.info) {
        console.log('   ✅ Documento verificado exitosamente');
        console.log(`   👤 Propietario: ${verification.info.owner}`);
        console.log(`   📅 Fecha: ${new Date(Number(verification.info.timestamp) * 1000).toISOString()}\n`);
      } else {
        console.log('   ❌ Error verificando documento\n');
      }

      // 5. Obtener información completa
      console.log('5️⃣ Obteniendo información completa...');
      const info = await pdfService.getDocumentInfo(result.documentHash, result.ipfsHash);
      
      if (info.blockchain) {
        console.log('   📊 Información de Blockchain:');
        console.log(`      👤 Propietario: ${info.blockchain.owner}`);
        console.log(`      📅 Timestamp: ${info.blockchain.timestamp}`);
        console.log(`      🔗 Hash: ${info.blockchain.hash}`);
      }
      
      if (info.ipfs) {
        console.log('   🌐 Información de IPFS:');
        console.log(`      📏 Tamaño: ${info.ipfs.size} bytes`);
        console.log(`      🔗 URL: ${info.ipfs.url}`);
      }

    } else {
      console.log('   ❌ Error procesando documento:', result.error);
    }

  } catch (error) {
    console.error('❌ Error en el demo:', error);
  } finally {
    // Limpiar archivo de prueba
    const testPDFPath = join(__dirname, 'demo-document.pdf');
    if (existsSync(testPDFPath)) {
      unlinkSync(testPDFPath);
      console.log('\n🧹 Archivo de prueba eliminado');
    }
  }
}

// Ejecutar demo
if (require.main === module) {
  runDemo().catch(console.error);
}
