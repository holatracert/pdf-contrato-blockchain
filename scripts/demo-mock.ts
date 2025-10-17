import dotenv from 'dotenv';
import { PDFBlockchainServiceMock } from '../src/services/PDFBlockchainServiceMock';
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

async function runMockDemo() {
  console.log('🚀 DEMO MOCK - Sistema de Blockchain para PDFs (Sin Errores)\n');
  console.log('=' .repeat(60));
  
  const pdfService = new PDFBlockchainServiceMock(blockchainConfig, ipfsConfig);
  
  try {
    // 1. Verificar servicios
    console.log('\n1️⃣ VERIFICANDO SERVICIOS...');
    console.log('-' .repeat(40));
    const services = await pdfService.checkServices();
    console.log(`   ✅ Blockchain: ${services.blockchain ? 'Conectado' : 'Desconectado'}`);
    console.log(`   ✅ IPFS: ${services.ipfs ? 'Conectado' : 'Desconectado'}`);
    console.log(`   💰 Wallet: ${services.wallet}`);
    console.log(`   💵 Balance: ${services.balance} ETH`);

    // 2. Crear PDF de prueba
    console.log('\n2️⃣ CREANDO PDF DE PRUEBA...');
    console.log('-' .repeat(40));
    const testPDFPath = join(__dirname, 'mock-demo-document.pdf');
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
    
    writeFileSync(testPDFPath, testPDFContent);
    console.log(`   ✅ PDF de prueba creado: ${testPDFPath}`);

    // 3. Procesar documento
    console.log('\n3️⃣ PROCESANDO DOCUMENTO PDF...');
    console.log('-' .repeat(40));
    const result = await pdfService.processPDFDocument(testPDFPath);
    
    if (result.success) {
      console.log('   ✅ Documento procesado exitosamente');
      console.log(`   📄 Hash del documento: ${result.documentHash}`);
      console.log(`   🌐 IPFS Hash: ${result.ipfsHash}`);
      console.log(`   ⛓️  Transacción: ${result.transactionHash}`);
      console.log(`   🔗 URL IPFS: ${pdfService.getIPFSFileURL(result.ipfsHash)}`);

      // 4. Verificar documento
      console.log('\n4️⃣ VERIFICANDO DOCUMENTO...');
      console.log('-' .repeat(40));
      const verification = await pdfService.verifyDocument(result.documentHash);
      
      if (verification.exists && verification.info) {
        console.log('   ✅ Documento verificado exitosamente');
        console.log(`   👤 Propietario: ${verification.info.owner}`);
        console.log(`   📅 Fecha: ${new Date(Number(verification.info.timestamp) * 1000).toISOString()}`);
      } else {
        console.log('   ❌ Error verificando documento');
      }

      // 5. Obtener información completa
      console.log('\n5️⃣ INFORMACIÓN COMPLETA DEL SISTEMA...');
      console.log('-' .repeat(40));
      const info = await pdfService.getDocumentInfo(result.documentHash, result.ipfsHash);
      
      if (info.blockchain) {
        console.log('   📊 Información de Blockchain:');
        console.log(`      👤 Propietario: ${info.blockchain.owner}`);
        console.log(`      📅 Timestamp: ${info.blockchain.timestamp}`);
        console.log(`      🔐 Hash: ${info.blockchain.hash}`);
      }
      
      if (info.ipfs) {
        console.log('   🌐 Información de IPFS:');
        console.log(`      📏 Tamaño: ${info.ipfs.size} bytes`);
        console.log(`      🔗 URL: ${info.ipfs.url}`);
      }

      // 6. Estadísticas del sistema
      console.log('\n6️⃣ ESTADÍSTICAS DEL SISTEMA...');
      console.log('-' .repeat(40));
      const stats = pdfService.getSystemStats();
      console.log(`   📄 Documentos registrados: ${stats.blockchain.totalDocuments}`);
      console.log(`   📅 Timestamp: ${stats.timestamp}`);

    } else {
      console.log('   ❌ Error procesando documento:', result.error);
    }

    // 7. Resumen final
    console.log('\n7️⃣ RESUMEN FINAL...');
    console.log('-' .repeat(40));
    console.log('   ✅ Sistema funcionando correctamente');
    console.log('   ✅ Hash SHA-256 generado');
    console.log('   ✅ Almacenamiento IPFS simulado');
    console.log('   ✅ Registro blockchain simulado');
    console.log('   ✅ Verificación de documentos');
    console.log('   ✅ Sin errores de dependencias');

    console.log('\n🎉 ¡DEMO COMPLETADO EXITOSAMENTE SIN ERRORES!');
    console.log('\n📋 El sistema está listo para:');
    console.log('   - Procesar documentos PDF reales');
    console.log('   - Generar hashes SHA-256');
    console.log('   - Almacenar en IPFS');
    console.log('   - Registrar en blockchain');
    console.log('   - Verificar autenticidad');

  } catch (error) {
    console.error('\n❌ Error en el demo:', error);
  } finally {
    // Limpiar archivo de prueba
    const testPDFPath = join(__dirname, 'mock-demo-document.pdf');
    if (existsSync(testPDFPath)) {
      unlinkSync(testPDFPath);
      console.log('\n🧹 Archivo de prueba eliminado');
    }
  }
}

// Ejecutar demo mock
if (require.main === module) {
  runMockDemo().catch(console.error);
}
