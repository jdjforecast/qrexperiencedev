const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Limpiar cualquier caché
  console.log('🧹 Limpiando caché...');
  
  // Eliminar node_modules
  if (fs.existsSync('./node_modules')) {
    console.log('🗑️ Eliminando node_modules...');
    execSync('rm -rf ./node_modules');
  }
  
  // Instalar dependencias
  console.log('📦 Instalando dependencias...');
  execSync('npm install --prefer-offline --no-audit --progress=false');
  
  // Ejecutar build
  console.log('🏗️ Ejecutando build...');
  execSync('npm run build');
  
  console.log('✅ Build completado exitosamente');
} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  process.exit(1);
} 