import { fileURLToPath } from 'node:url';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

export default {
  plugins: [
    obfuscatorPlugin({
      options: {
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
        debugProtection: false,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: true,
        renameProperties: false,
        selfDefending: false,
        sourceMap: false,
        stringArray: true,
        stringArrayThreshold: 0.5,
        target: 'browser',
      },
    }),
  ],
  resolve: {
    alias: {
      '../dist/': fileURLToPath(new URL('./dist/', import.meta.url)),
      '@': fileURLToPath(new URL('./dist/', import.meta.url)),
    },
  },
};
