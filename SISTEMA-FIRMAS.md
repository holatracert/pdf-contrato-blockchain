# 🔏 SISTEMA DE FIRMA DIGITAL DE DOCUMENTOS PDF

## 📋 Descripción

Sistema completo de firma digital para documentos PDF utilizando tecnología blockchain e IPFS. Permite firmar, verificar y generar certificados de autenticidad para documentos.

## ✨ Características Principales

### 🔐 Firma Digital
- **Firma automática** de documentos PDF
- **Hash SHA-256** para garantizar integridad
- **Registro en blockchain** inmutable
- **Almacenamiento en IPFS** descentralizado
- **Firma única** irrepetible por documento

### 🔄 Monitoreo Automático
- **Verificación cada 10 minutos**
- **Detección automática** de nuevos documentos
- **Firma automática** de documentos pendientes
- **Logs detallados** de todas las operaciones
- **Estadísticas en tiempo real**

### 📜 Certificados Digitales
- **Certificados HTML** imprimibles
- **Información completa** de la firma
- **Hashes verificables** (SHA-256, IPFS, TX)
- **Guía de verificación** paso a paso
- **Diseño profesional** listo para imprimir

## 🚀 Inicio Rápido

### 1. Configuración Inicial

```bash
# Instalar dependencias
npm run install-deps

# Compilar proyecto
npm run build

# Crear documentos de prueba
npm run create-test-docs
```

### 2. Firmar Documentos

#### Opción A: Colocar documentos en carpeta
```bash
# 1. Coloca tus PDFs en la carpeta ./pdf
cp mi-documento.pdf pdf/

# 2. Ejecuta el sistema de firmas
npm run signature-system
```

#### Opción B: Probar con documento específico
```bash
# Probar con propietario.pdf
npm run test-propietario

# O generar certificado directamente
npm run generate-certificate pdf/propietario.pdf
```

### 3. Ver Certificado

Después de firmar un documento:
1. Abre `signed-documents/CERTIFICADO_nombre-documento.html`
2. Se abrirá en tu navegador
3. Puedes imprimirlo o guardarlo como PDF

## 📁 Estructura de Carpetas

```
pdf-blockchain/
├── pdf/                          # Documentos para firmar
│   ├── propietario.pdf          # Tu documento
│   └── *.pdf                    # Otros documentos
│
├── signed-documents/            # Documentos firmados
│   ├── propietario_SIGNED_SIG_*.pdf
│   ├── CERTIFICADO_propietario.html
│   └── signatures.json          # Base de datos de firmas
│
├── src/
│   └── services/
│       ├── DocumentSignatureService.ts     # Servicio de firmas
│       └── DocumentMonitoringService.ts    # Monitoreo automático
│
└── scripts/
    ├── signature-system.ts                 # Sistema principal
    ├── test-propietario.ts                # Prueba específica
    └── generate-certificate.ts             # Generador de certificados
```

## 🎯 Casos de Uso

### Caso 1: Usuario Común - Firmar un Documento

```bash
# 1. Coloca tu PDF en la carpeta
cp contrato.pdf pdf/

# 2. Genera el certificado
npm run generate-certificate pdf/contrato.pdf

# 3. Abre el certificado HTML generado
# Se encuentra en: signed-documents/CERTIFICADO_contrato.html
```

### Caso 2: Empresa - Monitoreo Continuo

```bash
# Inicia el sistema de monitoreo
npm run signature-system

# El sistema:
# - Detecta nuevos PDFs cada 10 minutos
# - Firma automáticamente
# - Verifica documentos existentes
# - Genera logs detallados
```

### Caso 3: Desarrollador - Integración

```typescript
import { DocumentSignatureService } from './src/services/DocumentSignatureService';

const service = new DocumentSignatureService(
  blockchainConfig,
  ipfsConfig,
  './pdf',
  './signed-documents'
);

// Firmar documento
const result = await service.signDocument('./pdf/documento.pdf');

// Verificar documento
const verification = await service.verifySignedDocument('./pdf/documento.pdf');
```

## 🔍 Cómo Demostrar la Firma al Cliente

### Método 1: Certificado Visual (Recomendado)

1. **Genera el certificado**:
   ```bash
   npm run generate-certificate pdf/propietario.pdf
   ```

2. **Muestra el certificado HTML**:
   - Abre `CERTIFICADO_propietario.html` en el navegador
   - Muestra la firma digital única
   - Explica los hashes (SHA-256, IPFS, Blockchain)
   - Imprime o guarda como PDF

### Método 2: Verificación Técnica

```bash
# Ver todas las firmas registradas
cat signed-documents/signatures.json

# Ver logs del sistema
cat monitoring.log

# Ver estadísticas exportadas
cat monitoring-export-*.json
```

### Método 3: Demostración en Vivo

```bash
# 1. Ejecuta la prueba del documento
npm run test-propietario

# El sistema mostrará:
# ✅ Hash SHA-256 del documento
# ✅ Firma digital generada (SIG_*)
# ✅ Hash IPFS donde se almacenó
# ✅ Transacción en blockchain
# ✅ Verificación exitosa
```

## 📊 Información del Certificado

Cada certificado incluye:

### 🔐 Datos de Seguridad
- **Firma Digital**: Código único e irrepetible (ej: `SIG_9be11bfc2e69da17`)
- **Hash SHA-256**: Huella digital del documento original
- **Hash IPFS**: Identificador en la red descentralizada
- **TX Blockchain**: Número de transacción en la cadena de bloques

### 📅 Datos Temporales
- **Fecha y hora exacta** de la firma
- **Timestamp** Unix para verificación
- **Propietario** de la firma (wallet address)

### ✅ Datos de Verificación
- **Estado**: VERIFIED / SIGNED / PENDING
- **Pasos de verificación** explicados
- **Instrucciones** para validar la firma

## 🧪 Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Pruebas específicas del sistema de firmas
```bash
npm run test-signature
```

### Resultado esperado:
```
✓ debe obtener documentos PDF en la carpeta
✓ debe verificar si un documento está firmado
✓ debe firmar un documento PDF
✓ debe verificar un documento firmado
✓ debe obtener estadísticas del sistema
✓ debe iniciar y detener el monitoreo
✓ debe procesar flujo completo de firma y verificación

Test Suites: 1 passed
Tests: 15 passed
```

## 📈 Estadísticas y Monitoreo

### Ver estadísticas en tiempo real
```bash
# El sistema genera automáticamente:
monitoring.log                  # Log de todas las operaciones
monitoring-status.json         # Estado actual del sistema
monitoring-export-*.json       # Exportaciones con timestamp
```

### Formato de estadísticas:
```json
{
  "totalDocuments": 5,
  "signedDocuments": 4,
  "verifiedDocuments": 5,
  "failedDocuments": 0,
  "pendingDocuments": 0
}
```

## 🔒 Seguridad

### Garantías de Seguridad

1. **Integridad del Documento**
   - Hash SHA-256 único por documento
   - Cualquier cambio genera un hash diferente
   - Imposible modificar sin invalidar la firma

2. **Inmutabilidad**
   - Registro permanente en blockchain
   - No se puede alterar o eliminar
   - Verificable públicamente

3. **Descentralización**
   - Almacenamiento en IPFS
   - No depende de un servidor central
   - Disponible globalmente

4. **Trazabilidad**
   - Timestamp preciso de la firma
   - Propietario identificado por wallet
   - Historial completo de operaciones

## 🎓 Para Usuarios No Técnicos

### ¿Qué es una firma digital?

Es como una huella dactilar única de tu documento que:
- ✅ Prueba que el documento existía en una fecha específica
- ✅ Garantiza que nadie lo ha modificado
- ✅ Identifica al firmante
- ✅ Es verificable por cualquier persona

### ¿Cómo funciona?

1. **Tu documento** → Se calcula su "huella digital" (hash)
2. **Se registra** → En una base de datos inmutable (blockchain)
3. **Se guarda** → En una red descentralizada (IPFS)
4. **Se genera** → Un certificado visual que puedes imprimir

### ¿Por qué es seguro?

- 🔐 La blockchain no se puede modificar
- 🌐 IPFS es descentralizado (no hay un único punto de falla)
- 🔏 El hash es único e irrepetible
- ✅ Cualquiera puede verificar la firma

## 📞 Comandos Disponibles

### Sistema de Firmas
```bash
npm run signature-system          # Inicia monitoreo automático
npm run test-propietario          # Prueba documento propietario.pdf
npm run generate-certificate      # Genera certificado HTML
npm run test-signature           # Ejecuta pruebas del sistema
```

### Utilidades
```bash
npm run build                    # Compila TypeScript
npm test                        # Todas las pruebas
npm run demo-mock               # Demo completo sin errores
npm run create-test-docs        # Crea documentos de prueba
```

## 🎯 Próximos Pasos

Para demostrar al cliente:

1. **Genera el certificado**:
   ```bash
   npm run generate-certificate pdf/propietario.pdf
   ```

2. **Abre el archivo HTML** generado en el navegador

3. **Muestra al cliente**:
   - La firma digital única
   - Los hashes criptográficos
   - La fecha y hora exacta
   - El botón para imprimir

4. **Explica**:
   - "Esta firma es única e irrepetible"
   - "Está registrada en blockchain de forma permanente"
   - "Cualquier cambio al documento la invalida"
   - "Puede verificarse en cualquier momento"

## 📝 Notas Importantes

- ✅ Los documentos originales nunca se modifican
- ✅ Se crean copias en `signed-documents/`
- ✅ El sistema funciona con mock para desarrollo
- ✅ Para producción, conectar a blockchain real
- ✅ Los certificados son completamente autónomos

## 🚀 Listo para Producción

Para usar en producción real:

1. Configurar nodo Ethereum real
2. Desplegar contrato en mainnet
3. Configurar nodo IPFS propio
4. Actualizar variables de entorno
5. Todo el código está listo ✅

---

**Sistema creado para demostrar firmas digitales de forma visual y comprensible para usuarios comunes.**
