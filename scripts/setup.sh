#!/bin/bash

# Script de configuración para el Sistema de Blockchain PDF
echo "🚀 Configurando Sistema de Blockchain para PDFs..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm"
    exit 1
fi

# Verificar Anvil
if ! command -v anvil &> /dev/null; then
    echo "❌ Anvil no está instalado. Por favor instala Foundry:"
    echo "   curl -L https://foundry.paradigm.xyz | bash"
    echo "   foundryup"
    exit 1
fi

echo "✅ Prerrequisitos verificados"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp env.example .env
    echo "✅ Archivo .env creado. Por favor edita las configuraciones según necesites."
else
    echo "✅ Archivo .env ya existe"
fi

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Inicia Anvil: anvil"
echo "2. (Opcional) Inicia IPFS: ipfs daemon"
echo "3. Ejecuta el demo: npm run demo"
echo "4. Ejecuta las pruebas: npm test"
echo ""
echo "🔗 URLs importantes:"
echo "- Anvil RPC: http://localhost:8545"
echo "- IPFS API: http://localhost:5001"
echo "- IPFS Gateway: http://localhost:8080"
echo ""
echo "📚 Documentación: README.md"
