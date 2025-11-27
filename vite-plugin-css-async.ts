/**
 * Vite plugin to load CSS asynchronously to prevent render-blocking
 * This improves FCP and LCP by allowing HTML to render before CSS loads
 */
import type { Plugin } from 'vite';

export function cssAsync(): Plugin {
  return {
    name: 'css-async',
    enforce: 'post',
    transformIndexHtml(html) {
      // Replace CSS link tags with async loading
      return html.replace(
        /<link[^>]+rel=["']stylesheet["'][^>]*>/g,
        (match) => {
          // Convert to async loading
          return match.replace(
            /rel=["']stylesheet["']/,
            'rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"'
          );
        }
      );
    },
  };
}

