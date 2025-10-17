import { DocumentSignatureService } from '../src/services/DocumentSignatureService';
import { BlockchainConfig, IPFSConfig } from '../src/types';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

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

/**
 * Genera un certificado de firma digital en HTML
 */
function generateCertificateHTML(
  documentName: string,
  signature: any,
  verification: any
): string {
  const timestamp = new Date(signature.timestamp).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Lima'
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificado de Firma Digital - ${documentName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .certificate-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .seal {
            width: 120px;
            height: 120px;
            margin: 20px auto;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 60px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        
        .content {
            padding: 40px;
        }
        
        .document-info {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 5px solid #667eea;
        }
        
        .document-name {
            font-size: 1.8em;
            color: #333;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .status {
            display: inline-block;
            padding: 10px 20px;
            background: #28a745;
            color: white;
            border-radius: 25px;
            font-weight: bold;
            margin-top: 10px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 3px solid #667eea;
        }
        
        .info-label {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-value {
            font-size: 1.1em;
            color: #333;
            font-weight: 600;
            word-break: break-all;
        }
        
        .signature-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .signature-value {
            font-size: 2em;
            font-weight: bold;
            letter-spacing: 3px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
        }
        
        .blockchain-info {
            background: #e3f2fd;
            padding: 25px;
            border-radius: 10px;
            border: 2px solid #2196f3;
        }
        
        .blockchain-title {
            font-size: 1.3em;
            color: #1976d2;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .verification-steps {
            margin-top: 30px;
        }
        
        .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .step-number {
            width: 40px;
            height: 40px;
            background: #667eea;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            flex-shrink: 0;
        }
        
        .step-content h3 {
            color: #333;
            margin-bottom: 5px;
        }
        
        .step-content p {
            color: #666;
            line-height: 1.6;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 3px solid #667eea;
        }
        
        .qr-code {
            width: 200px;
            height: 200px;
            background: white;
            border: 3px solid #667eea;
            border-radius: 10px;
            margin: 20px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #666;
        }
        
        .print-button {
            background: #667eea;
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.1em;
            border-radius: 25px;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s;
        }
        
        .print-button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .print-button {
                display: none;
            }
        }
        
        .verification-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: #28a745;
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 1.2em;
            font-weight: bold;
            margin: 20px 0;
        }
        
        .hash-display {
            background: #2c3e50;
            color: #2ecc71;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            overflow-x: auto;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="header">
            <h1>🔐 CERTIFICADO DE FIRMA DIGITAL</h1>
            <p>Sistema de Verificación Blockchain</p>
            <div class="seal">✓</div>
        </div>
        
        <div class="content">
            <div class="document-info">
                <div class="document-name">📄 ${documentName}</div>
                <div class="verification-badge">
                    ✓ Documento Verificado y Firmado
                </div>
                <p style="color: #666; margin-top: 10px;">
                    Este documento ha sido firmado digitalmente y registrado en blockchain,
                    garantizando su autenticidad e integridad.
                </p>
            </div>
            
            <div class="signature-box">
                <h2 style="margin-bottom: 10px;">🔏 FIRMA DIGITAL</h2>
                <div class="signature-value">${signature.signature}</div>
                <p style="opacity: 0.9;">Esta firma es única e irrepetible</p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-label">📅 Fecha y Hora</div>
                    <div class="info-value">${timestamp}</div>
                </div>
                
                <div class="info-card">
                    <div class="info-label">📊 Estado</div>
                    <div class="info-value" style="color: #28a745;">${signature.status.toUpperCase()}</div>
                </div>
                
                <div class="info-card">
                    <div class="info-label">👤 Propietario</div>
                    <div class="info-value" style="font-size: 0.8em;">${verification.info?.owner || 'N/A'}</div>
                </div>
                
                <div class="info-card">
                    <div class="info-label">⛓️ Blockchain</div>
                    <div class="info-value">Ethereum (Anvil)</div>
                </div>
            </div>
            
            <div class="blockchain-info">
                <div class="blockchain-title">
                    <span>⛓️</span>
                    <span>INFORMACIÓN DE BLOCKCHAIN</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div class="info-label">🔐 Hash del Documento (SHA-256)</div>
                    <div class="hash-display">${signature.hash}</div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div class="info-label">🌐 Hash IPFS</div>
                    <div class="hash-display">${signature.ipfsHash}</div>
                </div>
                
                <div>
                    <div class="info-label">📝 Transacción Blockchain</div>
                    <div class="hash-display">${signature.transactionHash}</div>
                </div>
            </div>
            
            <div class="verification-steps">
                <h2 style="margin-bottom: 20px; color: #333;">🔍 ¿Cómo Verificar Esta Firma?</h2>
                
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Obtén el documento original</h3>
                        <p>Asegúrate de tener el archivo PDF original que fue firmado.</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Calcula el hash SHA-256</h3>
                        <p>Genera el hash SHA-256 del documento. Este hash debe coincidir con el mostrado arriba.</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>Verifica en Blockchain</h3>
                        <p>Consulta la transacción en el explorador de blockchain usando el hash de transacción.</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h3>Confirma en IPFS</h3>
                        <p>Verifica que el documento existe en IPFS con el hash proporcionado.</p>
                    </div>
                </div>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 5px solid #ffc107; margin-top: 30px;">
                <h3 style="color: #856404; margin-bottom: 10px;">⚠️ Importante</h3>
                <p style="color: #856404; line-height: 1.6;">
                    Este certificado es una prueba criptográfica de que el documento fue firmado 
                    en la fecha indicada. Cualquier modificación al documento resultará en un 
                    hash diferente, invalidando la firma.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <div class="qr-code">
                📱 Código QR<br>(Próximamente)
            </div>
            <p style="color: #666; margin-bottom: 20px;">
                Escanea este código para verificar el certificado en línea
            </p>
            <button class="print-button" onclick="window.print()">
                🖨️ Imprimir Certificado
            </button>
            <p style="color: #999; margin-top: 20px; font-size: 0.9em;">
                Generado por Sistema de Firma Digital Blockchain<br>
                ${new Date().toISOString()}
            </p>
        </div>
    </div>
</body>
</html>`;
}

async function generateCertificate(documentPath: string) {
  console.log('📜 GENERADOR DE CERTIFICADOS DE FIRMA DIGITAL\n');
  console.log('='.repeat(60));
  
  const signatureService = new DocumentSignatureService(
    blockchainConfig,
    ipfsConfig,
    './pdf',
    './signed-documents'
  );
  
  try {
    const documentName = documentPath.split('/').pop() || documentPath;
    
    console.log(`\n📄 Procesando: ${documentName}`);
    console.log('-'.repeat(50));
    
    // Verificar si existe
    if (!existsSync(documentPath)) {
      console.log(`❌ El documento ${documentPath} no existe`);
      return;
    }
    
    // Verificar si ya está firmado
    let signature;
    const isSigned = signatureService.isDocumentSigned(documentPath);
    
    if (!isSigned) {
      console.log('🔏 Firmando documento...');
      const signResult = await signatureService.signDocument(documentPath);
      
      if (!signResult.success) {
        console.log(`❌ Error firmando: ${signResult.error}`);
        return;
      }
      
      signature = signResult.documentSignature;
    } else {
      console.log('✅ Documento ya firmado, obteniendo información...');
    }
    
    // Verificar documento
    console.log('🔍 Verificando firma...');
    const verification = await signatureService.verifySignedDocument(documentPath);
    
    if (!verification.isValid) {
      console.log(`❌ Error verificando: ${verification.error}`);
      return;
    }
    
    signature = verification.signature;
    
    // Generar certificado HTML
    console.log('📜 Generando certificado...');
    const html = generateCertificateHTML(documentName, signature, verification);
    
    // Guardar certificado
    const certificatePath = join('./signed-documents', `CERTIFICADO_${documentName.replace('.pdf', '')}.html`);
    writeFileSync(certificatePath, html);
    
    console.log('\n✅ ¡CERTIFICADO GENERADO EXITOSAMENTE!');
    console.log('-'.repeat(50));
    console.log(`📄 Documento: ${documentName}`);
    console.log(`🔏 Firma: ${signature?.signature}`);
    console.log(`📅 Fecha: ${new Date(signature?.timestamp || 0).toLocaleString('es-ES')}`);
    console.log(`📊 Estado: ${signature?.status}`);
    console.log(`📁 Certificado guardado en: ${certificatePath}`);
    
    console.log('\n📋 Para ver el certificado:');
    console.log(`   1. Abre el archivo: ${certificatePath}`);
    console.log(`   2. Se abrirá en tu navegador web`);
    console.log(`   3. Puedes imprimirlo o guardarlo como PDF`);
    
  } catch (error) {
    console.error('\n❌ Error generando certificado:', error);
  }
}

// Ejecutar
const documentPath = process.argv[2] || './pdf/propietario.pdf';
generateCertificate(documentPath).catch(console.error);

