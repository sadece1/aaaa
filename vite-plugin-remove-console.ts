import type { Plugin } from 'vite';

/**
 * Vite plugin to remove console.log statements in production
 * This reduces bundle size and prevents Lighthouse console errors
 */
export function removeConsole(): Plugin {
  return {
    name: 'remove-console',
    enforce: 'post',
    apply: 'build',
    transform(code, id) {
      // Only process JavaScript/TypeScript files
      if (!id.match(/\.(js|ts|tsx|jsx)$/)) {
        return null;
      }
      
      // Skip node_modules (they should be minified already)
      if (id.includes('node_modules')) {
        return null;
      }
      
      // Remove console.log, console.warn, console.info, console.debug
      // Keep console.error for error tracking
      // Use more precise regex to avoid breaking code
      const transformedCode = code
        // Match complete console statements with semicolon
        .replace(/console\.(log|warn|info|debug)\([^)]*\)\s*;/g, '')
        // Match console statements at end of line (without semicolon)
        .replace(/console\.(log|warn|info|debug)\([^)]*\)\s*$/gm, '')
        // Match console statements followed by newline or closing brace
        .replace(/console\.(log|warn|info|debug)\([^)]*\)\s*(\n|\})/g, '$2');
      
      if (transformedCode !== code) {
        return {
          code: transformedCode,
          map: null,
        };
      }
      
      return null;
    },
  };
}

