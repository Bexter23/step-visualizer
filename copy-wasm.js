const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'node_modules', 'occt-import-js', 'dist', 'occt-import-js.wasm');
const targetDir = path.join(__dirname, 'public');
const targetFile = path.join(targetDir, 'occt-import-js.wasm');

// Create public directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy the file
fs.copyFileSync(sourceFile, targetFile);
console.log('WASM file copied successfully!'); 