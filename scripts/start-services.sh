#!/bin/bash

# Script para iniciar todos los servicios necesarios
echo "🚀 Iniciando servicios para el Sistema de Blockchain PDF..."

# Función para verificar si un puerto está en uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Verificar Anvil
echo "🔍 Verificando Anvil..."
if check_port 8545; then
    echo "✅ Anvil ya está ejecutándose en puerto 8545"
else
    echo "⚠️  Anvil no está ejecutándose. Iniciando..."
    echo "   Ejecuta en otra terminal: anvil"
fi

# Verificar IPFS
echo "🔍 Verificando IPFS..."
if check_port 5001; then
    echo "✅ IPFS API ya está ejecutándose en puerto 5001"
else
    echo "⚠️  IPFS no está ejecutándose. Iniciando..."
    echo "   Ejecuta en otra terminal: ipfs daemon"
fi

if check_port 8080; then
    echo "✅ IPFS Gateway ya está ejecutándose en puerto 8080"
else
    echo "⚠️  IPFS Gateway no está disponible"
fi

echo ""
echo "📋 Servicios necesarios:"
echo "1. Anvil (Blockchain local): http://localhost:8545"
echo "2. IPFS API: http://localhost:5001"
echo "3. IPFS Gateway: http://localhost:8080"
echo ""
echo "🔧 Para iniciar manualmente:"
echo "   Terminal 1: anvil"
echo "   Terminal 2: ipfs daemon"
echo "   Terminal 3: npm run demo"
echo ""
echo "✅ Verificación completada"
