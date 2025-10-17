#!/bin/bash

# Script para instalar todas las dependencias necesarias
echo "🔧 Instalando dependencias del Sistema de Blockchain PDF..."

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "   Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versión $NODE_VERSION es muy antigua"
    echo "   Se requiere Node.js 18 o superior"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Verificar npm
echo "📦 Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ npm $(npm -v) detectado"

# Verificar Anvil/Foundry
echo "🔨 Verificando Foundry..."
if ! command -v anvil &> /dev/null; then
    echo "⚠️  Foundry no está instalado"
    echo "   Instalando Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc
    foundryup
fi

echo "✅ Foundry $(anvil --version | head -n1) detectado"

# Verificar IPFS (opcional)
echo "🌐 Verificando IPFS..."
if ! command -v ipfs &> /dev/null; then
    echo "⚠️  IPFS no está instalado (opcional)"
    echo "   Para instalar IPFS:"
    echo "   - Descarga desde: https://dist.ipfs.io/#go-ipfs"
    echo "   - O usa: npm install -g ipfs"
else
    echo "✅ IPFS $(ipfs version | head -n1) detectado"
fi

# Limpiar instalaciones anteriores
echo "🧹 Limpiando instalaciones anteriores..."
rm -rf node_modules package-lock.json

# Instalar dependencias de Node.js
echo "📦 Instalando dependencias de Node.js..."
npm install

# Verificar instalación
echo "✅ Verificando instalación..."
if [ -d "node_modules" ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

if [ -d "dist" ]; then
    echo "✅ Compilación exitosa"
else
    echo "❌ Error en la compilación"
    exit 1
fi

echo ""
echo "🎉 ¡Instalación completada exitosamente!"
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
