# 🔐 Sistema de Blockchain para PDFs - Diagramas de Flujo

## 📊 Diagrama General del Sistema

```mermaid
graph TB
    A[📱 Dispositivo] --> B[🔧 Aplicación Off-Chain]
    B --> C[📄 Archivo PDF]
    B --> D[🔐 Generación Hash SHA-256]
    B --> E[🌐 Almacenamiento IPFS]
    B --> F[⛓️ Registro en Blockchain]
    
    C --> E
    D --> F
    E --> G[📦 IPFS Hash]
    F --> H[🔗 Transaction Hash]
    
    G --> I[✅ Verificación]
    H --> I
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#e3f2fd
    style F fill:#fce4ec
    style I fill:#e8f5e8
```

## 🔄 Flujo Detallado Paso a Paso

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant A as 🔧 Aplicación
    participant H as 🔐 HashGenerator
    participant I as 🌐 IPFS
    participant B as ⛓️ Blockchain
    participant C as 📋 Smart Contract

    U->>A: 1. Subir PDF
    A->>H: 2. Validar formato PDF
    H-->>A: ✅ PDF válido
    
    A->>H: 3. Generar SHA-256
    H-->>A: 🔐 Hash del documento
    
    A->>I: 4. Subir PDF a IPFS
    I-->>A: 🌐 IPFS Hash
    
    A->>B: 5. Conectar a blockchain
    B-->>A: ✅ Conexión establecida
    
    A->>C: 6. Registrar hash en contrato
    C-->>A: 🔗 Transaction Hash
    
    A-->>U: 7. ✅ Documento procesado
    Note over A,U: Hash + IPFS Hash + TX Hash
```

## 🏗️ Arquitectura de Componentes

```mermaid
graph LR
    subgraph "📱 Frontend"
        A[Dispositivo]
        B[Interfaz Usuario]
    end
    
    subgraph "🔧 Aplicación Off-Chain"
        C[PDFBlockchainService]
        D[HashGenerator]
        E[IPFSService]
        F[BlockchainService]
    end
    
    subgraph "🌐 IPFS Network"
        G[IPFS Node 1]
        H[IPFS Node 2]
        I[IPFS Node N]
    end
    
    subgraph "⛓️ Blockchain Network"
        J[Smart Contract]
        K[Ethereum Node]
        L[Anvil Local]
    end
    
    A --> B
    B --> C
    C --> D
    C --> E
    C --> F
    E --> G
    E --> H
    E --> I
    F --> J
    F --> K
    F --> L
    
    style A fill:#e1f5fe
    style C fill:#f3e5f5
    style G fill:#e3f2fd
    style J fill:#fce4ec
```

## 🔍 Proceso de Verificación

```mermaid
flowchart TD
    A[🔍 Verificar Documento] --> B{¿Hash existe en blockchain?}
    B -->|❌ No| C[❌ Documento no encontrado]
    B -->|✅ Sí| D[📋 Obtener información del contrato]
    
    D --> E[👤 Propietario]
    D --> F[📅 Timestamp]
    D --> G[🔐 Hash del documento]
    
    E --> H[✅ Documento verificado]
    F --> H
    G --> H
    
    H --> I[📊 Mostrar información completa]
    
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#ffebee
    style H fill:#e8f5e8
    style I fill:#e8f5e8
```

## 📦 Estructura de Datos

```mermaid
classDiagram
    class PDFDocument {
        +string filePath
        +string hash
        +string ipfsHash
        +number timestamp
    }
    
    class DocumentInfo {
        +string owner
        +number timestamp
        +string hash
        +string ipfsHash
    }
    
    class DocumentRegistrationResult {
        +boolean success
        +string transactionHash
        +string documentHash
        +string ipfsHash
        +string error
    }
    
    class BlockchainConfig {
        +string rpcUrl
        +string privateKey
        +string contractAddress
        +number networkId
    }
    
    class IPFSConfig {
        +string apiUrl
        +string gatewayUrl
    }
    
    PDFDocument --> DocumentInfo
    DocumentInfo --> DocumentRegistrationResult
    BlockchainConfig --> PDFDocument
    IPFSConfig --> PDFDocument
```

## 🚀 Flujo de Instalación y Configuración

```mermaid
flowchart TD
    A[🚀 Iniciar Proyecto] --> B[📦 npm install]
    B --> C[🔧 Configurar .env]
    C --> D[🔨 npm run build]
    D --> E[✅ Compilación exitosa]
    
    E --> F[🔍 Verificar Anvil]
    F --> G{¿Anvil ejecutándose?}
    G -->|❌ No| H[⚠️ Iniciar Anvil]
    G -->|✅ Sí| I[🌐 Verificar IPFS]
    
    H --> I
    I --> J{¿IPFS disponible?}
    J -->|❌ No| K[⚠️ Iniciar IPFS]
    J -->|✅ Sí| L[🧪 Ejecutar pruebas]
    
    K --> L
    L --> M[🎯 Ejecutar demo]
    M --> N[✅ Sistema listo]
    
    style A fill:#e1f5fe
    style E fill:#e8f5e8
    style N fill:#e8f5e8
    style H fill:#fff3e0
    style K fill:#fff3e0
```

## 🔧 Comandos y Scripts

```mermaid
graph TB
    subgraph "📦 Instalación"
        A[npm run install-deps]
        B[npm run fresh-install]
        C[npm run clean]
    end
    
    subgraph "🔨 Desarrollo"
        D[npm run build]
        E[npm run dev]
        F[npm start]
    end
    
    subgraph "🧪 Testing"
        G[npm test]
        H[npm run test:watch]
        I[npm run test:coverage]
        J[npm run demo]
    end
    
    subgraph "🌐 Servicios"
        K[npm run anvil]
        L[npm run ipfs]
        M[npm run check-services]
    end
    
    A --> D
    B --> D
    C --> A
    D --> G
    E --> G
    F --> G
    G --> J
    K --> M
    L --> M
    
    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style G fill:#e8f5e8
    style K fill:#fff3e0
```

## 📊 Estados del Sistema

```mermaid
stateDiagram-v2
    [*] --> Inicializado
    Inicializado --> ServiciosVerificados: Verificar servicios
    ServiciosVerificados --> PDFValidado: Subir PDF
    PDFValidado --> HashGenerado: Generar hash
    HashGenerado --> IPFSUpload: Subir a IPFS
    IPFSUpload --> BlockchainRegistro: Registrar en blockchain
    BlockchainRegistro --> DocumentoProcesado: ✅ Completado
    
    DocumentoProcesado --> Verificacion: Verificar documento
    Verificacion --> DocumentoVerificado: ✅ Verificado
    Verificacion --> DocumentoNoEncontrado: ❌ No encontrado
    
    DocumentoVerificado --> [*]
    DocumentoNoEncontrado --> [*]
    
    note right of ServiciosVerificados
        - Anvil ejecutándose
        - IPFS disponible
        - Contrato desplegado
    end note
    
    note right of DocumentoProcesado
        - Hash SHA-256 generado
        - Archivo en IPFS
        - Hash registrado en blockchain
    end note
```

## 🔐 Seguridad y Validación

```mermaid
flowchart TD
    A[📄 Archivo PDF] --> B{¿Formato válido?}
    B -->|❌ No| C[❌ Error: No es PDF]
    B -->|✅ Sí| D[🔐 Generar SHA-256]
    
    D --> E[🌐 Subir a IPFS]
    E --> F{¿Subida exitosa?}
    F -->|❌ No| G[❌ Error: IPFS]
    F -->|✅ Sí| H[⛓️ Registrar en blockchain]
    
    H --> I{¿Registro exitoso?}
    I -->|❌ No| J[❌ Error: Blockchain]
    I -->|✅ Sí| K[✅ Documento seguro]
    
    K --> L[🔍 Verificación disponible]
    L --> M[📊 Información inmutable]
    
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#ffebee
    style K fill:#e8f5e8
    style M fill:#e8f5e8
```

## 📈 Métricas y Monitoreo

```mermaid
graph TB
    subgraph "📊 Métricas del Sistema"
        A[📄 Documentos procesados]
        B[🔐 Hashes generados]
        C[🌐 Archivos en IPFS]
        D[⛓️ Transacciones blockchain]
    end
    
    subgraph "🔍 Verificaciones"
        E[✅ Documentos verificados]
        F[❌ Documentos no encontrados]
        G[⏱️ Tiempo de procesamiento]
        H[💾 Tamaño de archivos]
    end
    
    subgraph "🌐 Estado de Red"
        I[🔗 Conexión Anvil]
        J[🌐 Conexión IPFS]
        K[💰 Balance wallet]
        L[⛓️ Estado del contrato]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    
    style A fill:#e1f5fe
    style E fill:#e8f5e8
    style I fill:#fff3e0
```

## 🎯 Casos de Uso

```mermaid
graph LR
    subgraph "👤 Usuario Final"
        A[Subir documento]
        B[Verificar autenticidad]
        C[Descargar documento]
    end
    
    subgraph "🏢 Empresa"
        D[Registrar contratos]
        E[Verificar certificados]
        F[Auditoría de documentos]
    end
    
    subgraph "🏛️ Gobierno"
        G[Documentos oficiales]
        H[Verificación de identidad]
        I[Transparencia pública]
    end
    
    A --> D
    B --> E
    C --> F
    D --> G
    E --> H
    F --> I
    
    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style G fill:#e8f5e8
```

---

## 📋 Resumen de Diagramas

1. **Diagrama General**: Vista de alto nivel del sistema
2. **Flujo Detallado**: Secuencia paso a paso
3. **Arquitectura**: Componentes y sus relaciones
4. **Verificación**: Proceso de validación
5. **Estructura de Datos**: Modelos de información
6. **Instalación**: Configuración del sistema
7. **Comandos**: Scripts disponibles
8. **Estados**: Flujo de estados del sistema
9. **Seguridad**: Validaciones y verificaciones
10. **Métricas**: Monitoreo del sistema
11. **Casos de Uso**: Aplicaciones prácticas

Estos diagramas proporcionan una comprensión completa del sistema de blockchain para PDFs, desde la instalación hasta el uso en producción.
