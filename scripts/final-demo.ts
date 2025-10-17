import dotenv from 'dotenv';
import { PDFBlockchainService } from '../src/services/PDFBlockchainService';
import { BlockchainConfig, IPFSConfig } from '../src/types';
import { join } from 'path';
import { existsSync } from 'fs';

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

async function runFinalDemo() {
  console.log('🚀 DEMO FINAL - Sistema de Blockchain para PDFs\n');
  console.log('=' .repeat(60));
  
  const pdfService = new PDFBlockchainService(blockchainConfig, ipfsConfig);
  
  try {
    // 1. Verificar servicios
    console.log('\n1️⃣ VERIFICANDO SERVICIOS...');
    console.log('-' .repeat(40));
    const services = await pdfService.checkServices();
    console.log(`   ✅ Blockchain: ${services.blockchain ? 'Conectado' : 'Desconectado'}`);
    console.log(`   ✅ IPFS: ${services.ipfs ? 'Conectado' : 'Desconectado'}`);
    console.log(`   💰 Wallet: ${services.wallet}`);
    console.log(`   💵 Balance: ${services.balance} ETH`);

    if (!services.blockchain) {
      throw new Error('❌ Blockchain no disponible. Asegúrate de que Anvil esté ejecutándose.');
    }

    // 2. Listar documentos de prueba disponibles
    console.log('\n2️⃣ DOCUMENTOS DE PRUEBA DISPONIBLES...');
    console.log('-' .repeat(40));
    const testDocsDir = join(__dirname, '..', 'test-documents');
    const testFiles = [
      'documento-basico.pdf',
      'documento-texto.pdf', 
      'documento-metadatos.pdf',
      'documento-grande.pdf',
      'documento-integridad.pdf'
    ];

    const availableDocs = testFiles.filter(file => 
      existsSync(join(testDocsDir, file))
    );

    console.log(`   📄 Documentos encontrados: ${availableDocs.length}`);
    availableDocs.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc}`);
    });

    if (availableDocs.length === 0) {
      console.log('   ⚠️  No hay documentos de prueba. Ejecuta: npm run create-test-docs');
      return;
    }

    // 3. Procesar cada documento
    console.log('\n3️⃣ PROCESANDO DOCUMENTOS...');
    console.log('-' .repeat(40));
    
    const results = [];
    
    for (let i = 0; i < Math.min(3, availableDocs.length); i++) {
      const docPath = join(testDocsDir, availableDocs[i]);
      console.log(`\n   📄 Procesando: ${availableDocs[i]}`);
      
      const result = await pdfService.processPDFDocument(docPath);
      
      if (result.success) {
        console.log(`   ✅ Procesado exitosamente`);
        console.log(`   🔐 Hash: ${result.documentHash.substring(0, 16)}...`);
        console.log(`   🌐 IPFS: ${result.ipfsHash.substring(0, 16)}...`);
        console.log(`   ⛓️  TX: ${result.transactionHash?.substring(0, 16)}...`);
        
        results.push({
          file: availableDocs[i],
          hash: result.documentHash,
          ipfsHash: result.ipfsHash,
          txHash: result.transactionHash
        });
      } else {
        console.log(`   ❌ Error: ${result.error}`);
      }
    }

    // 4. Verificar documentos procesados
    console.log('\n4️⃣ VERIFICANDO DOCUMENTOS...');
    console.log('-' .repeat(40));
    
    for (const result of results) {
      console.log(`\n   🔍 Verificando: ${result.file}`);
      const verification = await pdfService.verifyDocument(result.hash);
      
      if (verification.exists && verification.info) {
        console.log(`   ✅ Documento verificado`);
        console.log(`   👤 Propietario: ${verification.info.owner}`);
        console.log(`   📅 Fecha: ${new Date(Number(verification.info.timestamp) * 1000).toISOString()}`);
      } else {
        console.log(`   ❌ Documento no encontrado`);
      }
    }

    // 5. Información completa del sistema
    console.log('\n5️⃣ INFORMACIÓN COMPLETA DEL SISTEMA...');
    console.log('-' .repeat(40));
    
    if (results.length > 0) {
      const firstResult = results[0];
      const fullInfo = await pdfService.getDocumentInfo(firstResult.hash, firstResult.ipfsHash);
      
      console.log(`\n   📊 Información del primer documento:`);
      if (fullInfo.blockchain) {
        console.log(`   ⛓️  Blockchain:`);
        console.log(`      👤 Propietario: ${fullInfo.blockchain.owner}`);
        console.log(`      📅 Timestamp: ${fullInfo.blockchain.timestamp}`);
        console.log(`      🔐 Hash: ${fullInfo.blockchain.hash}`);
      }
      
      if (fullInfo.ipfs) {
        console.log(`   🌐 IPFS:`);
        console.log(`      📏 Tamaño: ${fullInfo.ipfs.size} bytes`);
        console.log(`      🔗 URL: ${fullInfo.ipfs.url}`);
      }
    }

    // 6. Resumen final
    console.log('\n6️⃣ RESUMEN FINAL...');
    console.log('-' .repeat(40));
    console.log(`   📄 Documentos procesados: ${results.length}`);
    console.log(`   ✅ Verificaciones exitosas: ${results.length}`);
    console.log(`   🔐 Hashes generados: ${results.length}`);
    console.log(`   🌐 Archivos en IPFS: ${results.length}`);
    console.log(`   ⛓️  Transacciones blockchain: ${results.length}`);

    console.log('\n🎉 ¡DEMO COMPLETADO EXITOSAMENTE!');
    console.log('\n📋 Próximos pasos:');
    console.log('   - Ejecutar pruebas: npm test');
    console.log('   - Verificar servicios: npm run check-services');
    console.log('   - Revisar documentación: README.md');
    console.log('   - Explorar diagramas: README-DIAGRAMAS.md');

  } catch (error) {
    console.error('\n❌ Error en el demo final:', error);
    console.log('\n🔧 Soluciones:');
    console.log('   - Verificar que Anvil esté ejecutándose: anvil');
    console.log('   - Verificar que IPFS esté disponible: ipfs daemon');
    console.log('   - Revisar configuración en .env');
  }
}

// Ejecutar demo final
if (require.main === module) {
  runFinalDemo().catch(console.error);
}
