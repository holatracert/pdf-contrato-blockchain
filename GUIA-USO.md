# 📖 Guía de Uso - Sistema de Blockchain para PDFs

## 🚀 Inicio Rápido

### Paso 1: Instalación Completa
```bash
# Instalar todas las dependencias
npm run install-deps

# Crear documentos de prueba
npm run create-test-docs

# Compilar el proyecto
npm run build
```

### Paso 2: Iniciar Servicios
```bash
# Terminal 1: Iniciar Anvil (Blockchain)
npm run anvil

# Terminal 2: Iniciar IPFS (Opcional)
npm run ipfs

# Terminal 3: Verificar servicios
npm run check-services
```

### Paso 3: Ejecutar Demo
```bash
# Demo básico
npm run demo

# Demo completo con documentos reales
npx ts-node scripts/final-demo.ts
```

## 📋 Comandos Disponibles

### 🔧 Instalación y Configuración
```bash
npm run install-deps      # Instalación completa con verificaciones
npm run fresh-install     # Instalación limpia desde cero
npm run create-test-docs  # Crear documentos PDF de prueba
npm run build            # Compilar TypeScript
npm run clean            # Limpiar archivos generados
```

### 🚀 Desarrollo
```bash
npm run dev              # Modo desarrollo
npm start                # Ejecutar versión compilada
npm run demo             # Demo interactivo
npx ts-node scripts/final-demo.ts  # Demo completo
```

### 🧪 Testing
```bash
npm test                 # Ejecutar todas las pruebas
npm run test:watch       # Pruebas en modo watch
npm run test:coverage    # Pruebas con cobertura
```

### 🌐 Servicios
```bash
npm run anvil            # Iniciar Anvil (Blockchain)
npm run ipfs             # Iniciar IPFS
npm run check-services   # Verificar estado de servicios
```

## 📄 Uso Programático

### Procesar un Documento PDF
```typescript
import { PDFBlockchainService } from './src/services/PDFBlockchainService';

const pdfService = new PDFBlockchainService(blockchainConfig, ipfsConfig);

// Procesar documento
const result = await pdfService.processPDFDocument('./mi-documento.pdf');

if (result.success) {
  console.log('Hash del documento:', result.documentHash);
  console.log('IPFS Hash:', result.ipfsHash);
  console.log('Transacción:', result.transactionHash);
}
```

### Verificar un Documento
```typescript
// Verificar documento existente
const verification = await pdfService.verifyDocument(documentHash);

if (verification.exists) {
  console.log('Propietario:', verification.info?.owner);
  console.log('Fecha:', new Date(Number(verification.info?.timestamp) * 1000));
}
```

### Descargar desde IPFS
```typescript
// Descargar documento desde IPFS
const success = await pdfService.downloadDocument(ipfsHash, './descarga.pdf');
```

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env` con:
```env
# Blockchain (Anvil)
ANVIL_RPC_URL=http://localhost:8545
ANVIL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x4ed7c70f96b99c776995fb64377f0d4ab3b0e1c1
NETWORK_ID=31337

# IPFS
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY_URL=http://localhost:8080
```

### Configuración de Red
- **Anvil RPC**: `http://localhost:8545`
- **Chain ID**: `31337`
- **Contrato**: `0x4ed7c70f96b99c776995fb64377f0d4ab3b0e1c1`
- **IPFS API**: `http://localhost:5001`
- **IPFS Gateway**: `http://localhost:8080`

## 📊 Flujo de Trabajo Completo

### 1. Preparación
```bash
# 1. Instalar dependencias
npm run install-deps

# 2. Crear documentos de prueba
npm run create-test-docs

# 3. Compilar proyecto
npm run build
```

### 2. Iniciar Servicios
```bash
# Terminal 1: Anvil
anvil

# Terminal 2: IPFS (opcional)
ipfs daemon

# Terminal 3: Verificar
npm run check-services
```

### 3. Ejecutar Demo
```bash
# Demo básico
npm run demo

# Demo completo
npx ts-node scripts/final-demo.ts
```

### 4. Ejecutar Pruebas
```bash
# Todas las pruebas
npm test

# Con cobertura
npm run test:coverage
```

## 🧪 Documentos de Prueba

El sistema incluye 5 documentos PDF de prueba:

1. **documento-basico.pdf** - PDF mínimo
2. **documento-texto.pdf** - PDF con contenido
3. **documento-metadatos.pdf** - PDF con metadatos
4. **documento-grande.pdf** - PDF de 1KB+
5. **documento-integridad.pdf** - Para pruebas de hash

### Crear Documentos de Prueba
```bash
npm run create-test-docs
```

## 🔍 Verificación del Sistema

### Verificar Servicios
```bash
npm run check-services
```

### Verificar Compilación
```bash
npm run build
```

### Verificar Pruebas
```bash
npm test
```

## 🚨 Solución de Problemas

### Error: Blockchain no disponible
```bash
# Verificar que Anvil esté ejecutándose
curl http://localhost:8545

# Si no responde, iniciar Anvil
anvil
```

### Error: IPFS no disponible
```bash
# Verificar IPFS
curl http://localhost:5001

# Si no responde, iniciar IPFS
ipfs daemon
```

### Error: Contrato no encontrado
- Verificar que el contrato esté desplegado
- Confirmar la dirección en `.env`
- Verificar que Anvil esté ejecutándose

### Error: Dependencias
```bash
# Limpiar e instalar desde cero
npm run fresh-install
```

## 📈 Monitoreo del Sistema

### Verificar Estado
```typescript
const services = await pdfService.checkServices();
console.log('Blockchain:', services.blockchain);
console.log('IPFS:', services.ipfs);
console.log('Wallet:', services.wallet);
console.log('Balance:', services.balance);
```

### Verificar Documento
```typescript
const verification = await pdfService.verifyDocument(hash);
console.log('Existe:', verification.exists);
console.log('Info:', verification.info);
```

## 🎯 Casos de Uso

### 1. Procesar Documento Nuevo
```typescript
const result = await pdfService.processPDFDocument('./documento.pdf');
```

### 2. Verificar Documento Existente
```typescript
const verification = await pdfService.verifyDocument(hash);
```

### 3. Descargar desde IPFS
```typescript
const success = await pdfService.downloadDocument(ipfsHash, './descarga.pdf');
```

### 4. Obtener Información Completa
```typescript
const info = await pdfService.getDocumentInfo(hash, ipfsHash);
```

## 📚 Documentación Adicional

- **README.md** - Documentación principal
- **README-DIAGRAMAS.md** - Diagramas del sistema
- **IMPLEMENTACION.md** - Detalles de implementación
- **GUIA-USO.md** - Esta guía de uso

## 🔗 URLs Importantes

- **Anvil RPC**: http://localhost:8545
- **IPFS API**: http://localhost:5001
- **IPFS Gateway**: http://localhost:8080
- **Contrato**: 0x4ed7c70f96b99c776995fb64377f0d4ab3b0e1c1

## ✅ Checklist de Verificación

- [ ] Dependencias instaladas (`npm run install-deps`)
- [ ] Documentos de prueba creados (`npm run create-test-docs`)
- [ ] Proyecto compilado (`npm run build`)
- [ ] Anvil ejecutándose (`npm run anvil`)
- [ ] IPFS disponible (opcional)
- [ ] Servicios verificados (`npm run check-services`)
- [ ] Demo ejecutado (`npm run demo`)
- [ ] Pruebas pasando (`npm test`)

---

**🎉 ¡Sistema listo para usar!**
