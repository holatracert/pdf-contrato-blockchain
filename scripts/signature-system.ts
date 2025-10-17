import dotenv from 'dotenv';
import { DocumentSignatureService } from '../src/services/DocumentSignatureService';
import { DocumentMonitoringService } from '../src/services/DocumentMonitoringService';
import { BlockchainConfig, IPFSConfig } from '../src/types';

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

async function runSignatureSystem() {
  console.log('🔏 SISTEMA DE FIRMA DE DOCUMENTOS PDF\n');
  console.log('=' .repeat(60));
  
  // Crear servicios
  const signatureService = new DocumentSignatureService(
    blockchainConfig,
    ipfsConfig,
    './pdf',
    './signed-documents'
  );
  
  const monitoringService = new DocumentMonitoringService(signatureService, {
    checkInterval: 10 * 60 * 1000, // 10 minutos
    autoSign: true,
    autoVerify: true,
    logLevel: 'info'
  });
  
  try {
    // 1. Verificar documentos pendientes
    console.log('\n1️⃣ VERIFICANDO DOCUMENTOS PENDIENTES...');
    console.log('-' .repeat(40));
    const pendingDocs = signatureService.getPendingDocuments();
    console.log(`📄 Documentos pendientes: ${pendingDocs.length}`);
    
    if (pendingDocs.length > 0) {
      console.log('📋 Documentos encontrados:');
      pendingDocs.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.split('/').pop()}`);
      });
    } else {
      console.log('✅ No hay documentos pendientes de firma');
    }

    // 2. Firmar documentos pendientes
    if (pendingDocs.length > 0) {
      console.log('\n2️⃣ FIRMANDO DOCUMENTOS PENDIENTES...');
      console.log('-' .repeat(40));
      
      const signResult = await signatureService.signAllPendingDocuments();
      
      console.log(`✅ Documentos firmados exitosamente: ${signResult.success}`);
      console.log(`❌ Documentos fallidos: ${signResult.failed}`);
      
      if (signResult.success > 0) {
        console.log('\n📋 Detalles de firmas:');
        signResult.results.forEach((result, index) => {
          if (result.success && result.documentSignature) {
            const sig = result.documentSignature;
            console.log(`   ${index + 1}. ${sig.originalPath.split('/').pop()}`);
            console.log(`      🔏 Firma: ${sig.signature}`);
            console.log(`      📄 Hash: ${sig.hash.substring(0, 16)}...`);
            console.log(`      🌐 IPFS: ${sig.ipfsHash.substring(0, 16)}...`);
            console.log(`      ⛓️  TX: ${sig.transactionHash?.substring(0, 16)}...`);
          }
        });
      }
    }

    // 3. Verificar documentos firmados
    console.log('\n3️⃣ VERIFICANDO DOCUMENTOS FIRMADOS...');
    console.log('-' .repeat(40));
    await signatureService.verifyAllDocuments();
    console.log('✅ Verificación completada');

    // 4. Mostrar estadísticas
    console.log('\n4️⃣ ESTADÍSTICAS DEL SISTEMA...');
    console.log('-' .repeat(40));
    const stats = signatureService.getSystemStats();
    console.log(`📄 Total documentos: ${stats.totalDocuments}`);
    console.log(`🔏 Firmados: ${stats.signedDocuments}`);
    console.log(`✅ Verificados: ${stats.verifiedDocuments}`);
    console.log(`❌ Fallidos: ${stats.failedDocuments}`);
    console.log(`⏳ Pendientes: ${stats.pendingDocuments}`);

    // 5. Iniciar monitoreo automático
    console.log('\n5️⃣ INICIANDO MONITOREO AUTOMÁTICO...');
    console.log('-' .repeat(40));
    console.log('🔄 El sistema verificará automáticamente cada 10 minutos');
    console.log('📊 Se procesarán nuevos documentos automáticamente');
    console.log('🔍 Se verificarán documentos firmados automáticamente');
    
    monitoringService.start();
    
    // Mostrar estado del monitoreo
    const monitoringStatus = monitoringService.getStatus();
    console.log(`\n📊 Estado del Monitoreo:`);
    console.log(`   🔄 Ejecutándose: ${monitoringStatus.isRunning ? 'Sí' : 'No'}`);
    console.log(`   ⏱️  Intervalo: ${monitoringStatus.config.checkInterval / 1000} segundos`);
    console.log(`   🔏 Auto-firma: ${monitoringStatus.config.autoSign ? 'Habilitado' : 'Deshabilitado'}`);
    console.log(`   🔍 Auto-verificación: ${monitoringStatus.config.autoVerify ? 'Habilitada' : 'Deshabilitada'}`);

    // 6. Mostrar comandos disponibles
    console.log('\n6️⃣ COMANDOS DISPONIBLES...');
    console.log('-' .repeat(40));
    console.log('📋 Para gestionar el sistema:');
    console.log('   - Coloca documentos PDF en la carpeta ./pdf');
    console.log('   - Los documentos se firmarán automáticamente');
    console.log('   - La verificación se ejecuta cada 10 minutos');
    console.log('   - Los documentos firmados se guardan en ./signed-documents');
    console.log('   - Revisa monitoring.log para ver el historial');

    console.log('\n🎉 ¡SISTEMA DE FIRMA INICIADO EXITOSAMENTE!');
    console.log('\n📋 El sistema está monitoreando:');
    console.log('   📁 Carpeta de documentos: ./pdf');
    console.log('   📁 Carpeta de firmados: ./signed-documents');
    console.log('   📊 Logs del sistema: monitoring.log');
    console.log('   🔄 Verificación automática: Cada 10 minutos');

    // Mantener el proceso ejecutándose
    console.log('\n⏳ Sistema ejecutándose... (Ctrl+C para detener)');
    
    // Manejar cierre graceful
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Deteniendo sistema...');
      monitoringService.stop();
      console.log('✅ Sistema detenido exitosamente');
      process.exit(0);
    });

    // Mantener proceso vivo
    setInterval(() => {
      const status = monitoringService.getStatus();
      if (status.isRunning) {
        console.log(`\n🔄 Sistema activo - Verificaciones: ${status.stats.totalChecks}`);
      }
    }, 60000); // Mostrar estado cada minuto

  } catch (error) {
    console.error('\n❌ Error en el sistema de firmas:', error);
    console.log('\n🔧 Soluciones:');
    console.log('   - Verificar que la carpeta ./pdf existe');
    console.log('   - Verificar permisos de escritura');
    console.log('   - Revisar configuración de blockchain');
  }
}

// Ejecutar sistema de firmas
if (require.main === module) {
  runSignatureSystem().catch(console.error);
}
