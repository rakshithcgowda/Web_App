// Script to set up API folder for Vercel deployment
// This copies backend/api to api/ and creates a symlink for server dependencies

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceApiDir = path.join(__dirname, 'backend', 'api');
const targetApiDir = path.join(__dirname, 'api');
const targetHandlersDir = path.join(__dirname, '_handlers');
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

// Remove existing api, handlers, and server folders if they exist
if (fs.existsSync(targetApiDir)) {
  fs.rmSync(targetApiDir, { recursive: true, force: true });
}
if (fs.existsSync(targetHandlersDir)) {
  fs.rmSync(targetHandlersDir, { recursive: true, force: true });
}
if (fs.existsSync(targetServerDir)) {
  fs.rmSync(targetServerDir, { recursive: true, force: true });
}

// Copy the entire backend/api directory to api/
function copyDir(src, dest, fixImports = false) {
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
      copyDir(srcPath, destPath, fixImports);
    } else {
      if (fixImports && entry.name.endsWith('.ts')) {
        // Fix import paths: ../server/ -> ../../server/
        let content = fs.readFileSync(srcPath, 'utf8');
        content = content.replace(/from ['"]\.\.\/server\//g, "from '../../server/");
        fs.writeFileSync(destPath, content, 'utf8');
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

try {
// Create target directories if they don't exist
if (!fs.existsSync(targetApiDir)) {
  fs.mkdirSync(targetApiDir, { recursive: true });
}
if (!fs.existsSync(targetHandlersDir)) {
  fs.mkdirSync(targetHandlersDir, { recursive: true });
}

// Copy only top-level API files (consolidated route handlers) to api/
// Copy subdirectories to _handlers/ (Vercel ignores directories starting with _)
const apiFiles = fs.readdirSync(sourceApiDir, { withFileTypes: true });
for (const entry of apiFiles) {
  const srcPath = path.join(sourceApiDir, entry.name);
  
  if (entry.isFile() && entry.name.endsWith('.ts')) {
    // Copy top-level API files (consolidated route handlers) to api/
    const destPath = path.join(targetApiDir, entry.name);
    fs.copyFileSync(srcPath, destPath);
  } else if (entry.isDirectory()) {
    // Copy subdirectories to _handlers/ (won't be treated as API functions)
    // Fix import paths: ../server/ -> ../../server/ since handlers are one level deeper
    const destPath = path.join(targetHandlersDir, entry.name);
    copyDir(srcPath, destPath, true);
  }
}

console.log('✅ Consolidated API files copied to root');
console.log('✅ Handler files copied to _handlers/');

// Copy server directory (needed for imports)
copyDir(sourceServerDir, targetServerDir);
console.log('✅ Server directory copied to root');

console.log('✅ Vercel deployment setup complete');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}

