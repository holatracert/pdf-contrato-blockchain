# 🔐 Sistema de Blockchain para Documentos PDF

Un sistema completo para la verificación y almacenamiento de documentos PDF usando blockchain (Ethereum) e IPFS, implementado en TypeScript.

## 📋 Características

- ✅ **Generación de Hash**: SHA-256 para integridad de documentos
- ✅ **Almacenamiento IPFS**: Distribución descentralizada de archivos
- ✅ **Registro Blockchain**: Inmutabilidad y trazabilidad
- ✅ **Verificación de Documentos**: Validación de autenticidad
- ✅ **Interfaz TypeScript**: Tipado fuerte y desarrollo seguro
- ✅ **Testing Completo**: Suite de pruebas automatizadas

## 🏗️ Arquitectura

```
Dispositivo → Aplicación Off-Chain → IPFS (Almacenamiento)
                ↓
            Blockchain (Hash + Timestamp)
```

### Flujo del Sistema

1. **Entrada**: Documento PDF desde dispositivo
2. **Procesamiento**: Generación de hash SHA-256
3. **Almacenamiento**: Subida a IPFS
4. **Registro**: Hash registrado en blockchain
5. **Verificación**: Validación de autenticidad

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- Anvil (Foundry)
- IPFS (opcional para desarrollo)

### Configuración

1. **Clonar e instalar dependencias**:
```bash
cd /var/www/html/pdf-blockchain
npm install
```

2. **Configurar variables de entorno**:
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

3. **Iniciar Anvil** (en terminal separado):
```bash
anvil
```

4. **Iniciar IPFS** (opcional):
```bash
ipfs daemon
```

## 📖 Uso

### Comandos Disponibles

```bash
# Desarrollo
npm run dev                    # Ejecutar en modo desarrollo
npm run build                  # Compilar TypeScript
npm start                      # Ejecutar versión compilada

# Testing
npm test                       # Ejecutar pruebas
npm run test:watch            # Pruebas en modo watch

# Demo
npm run demo                   # Ejecutar demo completo
```

### Uso Programático

```typescript
import { PDFBlockchainService } from './src/services/PDFBlockchainService';

const pdfService = new PDFBlockchainService(blockchainConfig, ipfsConfig);

// Procesar documento
const result = await pdfService.processPDFDocument('./documento.pdf');

// Verificar documento
const verification = await pdfService.verifyDocument(hash);

// Descargar desde IPFS
await pdfService.downloadDocument(ipfsHash, './descarga.pdf');
```

## 🔧 Configuración

### Variables de Entorno

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

### Smart Contract

El sistema utiliza el contrato `CodeCrytoDocumento` desplegado en:
- **Dirección**: `0x4ed7c70f96b99c776995fb64377f0d4ab3b0e1c1`
- **Red**: Anvil Local (Chain ID: 31337)

## 🧪 Testing

### Ejecutar Pruebas

```bash
# Todas las pruebas
npm test

# Pruebas específicas
npm test -- --testNamePattern="HashGenerator"

# Con cobertura
npm test -- --coverage
```

### Demo Interactivo

```bash
npm run demo
```

El demo incluye:
- ✅ Verificación de servicios
- ✅ Creación de PDF de prueba
- ✅ Procesamiento completo
- ✅ Verificación de documento
- ✅ Información detallada

## 📁 Estructura del Proyecto

```
pdf-blockchain/
├── src/
│   ├── contracts/           # Interfaz del smart contract
│   ├── services/            # Servicios principales
│   ├── utils/               # Utilidades (hash, validación)
│   ├── types/               # Definiciones TypeScript
│   └── index.ts             # Punto de entrada
├── tests/                   # Pruebas unitarias
├── scripts/                 # Scripts de utilidad
└── dist/                    # Código compilado
```

## 🔍 API Reference

### PDFBlockchainService

#### `processPDFDocument(filePath: string)`
Procesa un documento PDF completo:
- Genera hash SHA-256
- Sube a IPFS
- Registra en blockchain

#### `verifyDocument(documentHash: string)`
Verifica la existencia de un documento:
- Consulta blockchain
- Retorna información del propietario
- Incluye timestamp de registro

#### `downloadDocument(ipfsHash: string, outputPath: string)`
Descarga un documento desde IPFS:
- Recupera archivo desde IPFS
- Guarda en ruta local

### HashGenerator

#### `generatePDFHash(filePath: string)`
Genera hash SHA-256 de un archivo PDF.

#### `isValidPDF(filePath: string)`
Valida si un archivo es un PDF válido.

## 🛠️ Desarrollo

### Estructura de Clases

- **PDFBlockchainService**: Servicio principal
- **BlockchainService**: Interacción con blockchain
- **IPFSService**: Gestión de IPFS
- **HashGenerator**: Utilidades de hash

### Flujo de Datos

1. **Entrada**: Archivo PDF
2. **Validación**: Verificar formato PDF
3. **Hash**: Generar SHA-256
4. **IPFS**: Subir archivo
5. **Blockchain**: Registrar hash
6. **Respuesta**: Hash + IPFS Hash + TX Hash

## 🚨 Troubleshooting

### Problemas Comunes

1. **Anvil no conecta**:
   ```bash
   # Verificar que Anvil esté ejecutándose
   curl http://localhost:8545
   ```

2. **IPFS no disponible**:
   ```bash
   # Iniciar IPFS
   ipfs daemon
   ```

3. **Error de contrato**:
   - Verificar dirección del contrato
   - Confirmar que esté desplegado

### Logs de Debug

```typescript
// Habilitar logs detallados
console.log('Debug mode enabled');
```

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles.

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear issue en GitHub
- Revisar documentación
- Consultar logs de error

---

**Desarrollado con ❤️ usando TypeScript, Ethereum y IPFS**
# pdf-contrato-blockchain
# pdf-contrato-blockchain
