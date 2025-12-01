import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

// Root ESLint config - just ignore everything, let subdirectories handle their own linting
export default defineConfig([
  globalIgnores(['**/*']),
])
