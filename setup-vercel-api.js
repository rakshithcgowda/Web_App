// Script to set up API folder for Vercel deployment
// This copies backend/api to api/ and creates a symlink for server dependencies

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceApiDir = path.join(__dirname, 'backend', 'api');
const targetApiDir = path.join(__dirname, 'api');
const sourceServerDir = path.join(__dirname, 'backend', 'server');
const targetServerDir = path.join(__dirname, 'server');

// Check if source directories exist
if (!fs.existsSync(sourceApiDir)) {
  console.error(`❌ Error: Source directory not found: ${sourceApiDir}`);
  console.error('Current working directory:', __dirname);
  console.error('Available files:', fs.readdirSync(__dirname));
  if (fs.existsSync(path.join(__dirname, 'backend'))) {
    console.error('Backend folder exists. Contents:', fs.readdirSync(path.join(__dirname, 'backend')));
    if (fs.existsSync(path.join(__dirname, 'backend', 'api'))) {
      console.error('Backend/api folder exists. Contents:', fs.readdirSync(path.join(__dirname, 'backend', 'api')));
    } else {
      console.error('Backend/api folder does NOT exist');
    }
  } else {
    console.error('Backend folder does NOT exist');
  }
  process.exit(1);
}

if (!fs.existsSync(sourceServerDir)) {
  console.error(`❌ Error: Source directory not found: ${sourceServerDir}`);
  process.exit(1);
}

// Remove existing api and server folders if they exist
if (fs.existsSync(targetApiDir)) {
  fs.rmSync(targetApiDir, { recursive: true, force: true });
}
if (fs.existsSync(targetServerDir)) {
  fs.rmSync(targetServerDir, { recursive: true, force: true });
}

// Copy the entire backend/api directory to api/
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
// Copy only consolidated API files (not subdirectories)
// This reduces function count for Vercel Hobby plan (12 function limit)
const apiFiles = fs.readdirSync(sourceApiDir, { withFileTypes: true });
for (const entry of apiFiles) {
  const srcPath = path.join(sourceApiDir, entry.name);
  const destPath = path.join(targetApiDir, entry.name);
  
  if (entry.isFile() && entry.name.endsWith('.ts')) {
    // Copy only top-level API files (consolidated route handlers)
    fs.copyFileSync(srcPath, destPath);
  }
  // Skip subdirectories (auth/, bqc/, admin/) - they're handled by consolidated files
}

console.log('✅ Consolidated API files copied to root');

// Copy server directory (needed for imports)
copyDir(sourceServerDir, targetServerDir);
console.log('✅ Server directory copied to root');

console.log('✅ Vercel deployment setup complete');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}

