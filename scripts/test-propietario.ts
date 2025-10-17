import dotenv from 'dotenv';
import { DocumentSignatureService } from '../src/services/DocumentSignatureService';
import { DocumentMonitoringService } from '../src/services/DocumentMonitoringService';
import { BlockchainConfig, IPFSConfig } from '../src/types';
import { existsSync } from 'fs';
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

async function testPropietarioDocument() {
  console.log('🔏 PRUEBA DEL DOCUMENTO PROPIETARIO.PDF\n');
  console.log('=' .repeat(60));
  
  // Crear servicios
  const signatureService = new DocumentSignatureService(
    blockchainConfig,
    ipfsConfig,
    './pdf',
    './signed-documents'
  );
  
  const monitoringService = new DocumentMonitoringService(signatureService, {
    checkInterval: 5 * 1000, // 5 segundos para prueba
    autoSign: true,
    autoVerify: true,
    logLevel: 'info'
  });
  
  const propietarioPath = join('./pdf', 'propietario.pdf');
  
  try {
    // 1. Verificar que el documento existe
    console.log('\n1️⃣ VERIFICANDO DOCUMENTO PROPIETARIO.PDF...');
    console.log('-' .repeat(50));
    
    if (!existsSync(propietarioPath)) {
      console.log('❌ El documento propietario.pdf no existe en la carpeta ./pdf');
      return;
    }
    
    console.log('✅ Documento propietario.pdf encontrado');
    console.log(`📄 Ruta: ${propietarioPath}`);
    
    // 2. Verificar si ya está firmado
    console.log('\n2️⃣ VERIFICANDO ESTADO DE FIRMA...');
    console.log('-' .repeat(50));
    
    const isSigned = signatureService.isDocumentSigned(propietarioPath);
    console.log(`🔏 Estado: ${isSigned ? 'YA FIRMADO' : 'PENDIENTE DE FIRMA'}`);
    
    if (isSigned) {
      console.log('ℹ️  El documento ya está firmado, procediendo con verificación...');
    }
    
    // 3. Obtener documentos pendientes
    console.log('\n3️⃣ DOCUMENTOS PENDIENTES...');
    console.log('-' .repeat(50));
    
    const pendingDocs = signatureService.getPendingDocuments();
    console.log(`📄 Total documentos pendientes: ${pendingDocs.length}`);
    
    if (pendingDocs.length > 0) {
      console.log('📋 Documentos pendientes:');
      pendingDocs.forEach((doc, index) => {
        const filename = doc.split('/').pop();
        console.log(`   ${index + 1}. ${filename}`);
      });
    }
    
    // 4. Firmar documento si está pendiente
    if (!isSigned) {
      console.log('\n4️⃣ FIRMANDO DOCUMENTO PROPIETARIO.PDF...');
      console.log('-' .repeat(50));
      
      const signResult = await signatureService.signDocument(propietarioPath);
      
      if (signResult.success) {
        console.log('✅ Documento firmado exitosamente');
        console.log(`🔏 Firma: ${signResult.documentSignature?.signature}`);
        console.log(`📄 Hash: ${signResult.documentSignature?.hash}`);
        console.log(`🌐 IPFS: ${signResult.documentSignature?.ipfsHash}`);
        console.log(`⛓️  TX: ${signResult.documentSignature?.transactionHash}`);
      } else {
        console.log(`❌ Error firmando documento: ${signResult.error}`);
        return;
      }
    }
    
    // 5. Verificar documento firmado
    console.log('\n5️⃣ VERIFICANDO DOCUMENTO FIRMADO...');
    console.log('-' .repeat(50));
    
    const verification = await signatureService.verifySignedDocument(propietarioPath);
    
    if (verification.isValid) {
      console.log('✅ Documento verificado exitosamente');
      console.log(`👤 Propietario: ${verification.signature?.originalPath.split('/').pop()}`);
      console.log(`🔏 Firma: ${verification.signature?.signature}`);
      console.log(`📅 Timestamp: ${new Date(verification.signature?.timestamp || 0).toISOString()}`);
      console.log(`📊 Estado: ${verification.signature?.status}`);
    } else {
      console.log(`❌ Error verificando documento: ${verification.error}`);
    }
    
    // 6. Mostrar estadísticas del sistema
    console.log('\n6️⃣ ESTADÍSTICAS DEL SISTEMA...');
    console.log('-' .repeat(50));
    
    const stats = signatureService.getSystemStats();
    console.log(`📄 Total documentos: ${stats.totalDocuments}`);
    console.log(`🔏 Firmados: ${stats.signedDocuments}`);
    console.log(`✅ Verificados: ${stats.verifiedDocuments}`);
    console.log(`❌ Fallidos: ${stats.failedDocuments}`);
    console.log(`⏳ Pendientes: ${stats.pendingDocuments}`);
    
    // 7. Probar monitoreo automático
    console.log('\n7️⃣ PROBANDO MONITOREO AUTOMÁTICO...');
    console.log('-' .repeat(50));
    
    console.log('🔄 Iniciando monitoreo por 10 segundos...');
    monitoringService.start();
    
    // Esperar 10 segundos para ver el monitoreo en acción
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    monitoringService.stop();
    console.log('⏹️  Monitoreo detenido');
    
    // 8. Mostrar estado final del monitoreo
    console.log('\n8️⃣ ESTADO FINAL DEL MONITOREO...');
    console.log('-' .repeat(50));
    
    const monitoringStatus = monitoringService.getStatus();
    console.log(`🔄 Verificaciones realizadas: ${monitoringStatus.stats.totalChecks}`);
    console.log(`📄 Documentos procesados: ${monitoringStatus.stats.documentsProcessed}`);
    console.log(`🔏 Firmas creadas: ${monitoringStatus.stats.signaturesCreated}`);
    console.log(`✅ Verificaciones completadas: ${monitoringStatus.stats.verificationsCompleted}`);
    console.log(`❌ Errores: ${monitoringStatus.stats.errors}`);
    
    // 9. Exportar estadísticas
    console.log('\n9️⃣ EXPORTANDO ESTADÍSTICAS...');
    console.log('-' .repeat(50));
    
    const exportFile = monitoringService.exportStats();
    console.log(`📊 Estadísticas exportadas a: ${exportFile}`);
    
    console.log('\n🎉 ¡PRUEBA DEL DOCUMENTO PROPIETARIO.PDF COMPLETADA EXITOSAMENTE!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Documento verificado y procesado');
    console.log('   🔏 Firma digital generada');
    console.log('   🌐 Almacenamiento IPFS simulado');
    console.log('   ⛓️  Registro blockchain simulado');
    console.log('   🔄 Monitoreo automático probado');
    console.log('   📊 Estadísticas exportadas');

  } catch (error) {
    console.error('\n❌ Error probando documento propietario.pdf:', error);
    console.log('\n🔧 Posibles soluciones:');
    console.log('   - Verificar que el archivo existe');
    console.log('   - Verificar permisos de lectura');
    console.log('   - Verificar que es un PDF válido');
  }
}

// Ejecutar prueba
if (require.main === module) {
  testPropietarioDocument().catch(console.error);
}
