import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/qr-gen.ts'],
    format: ['cjs', 'esm', 'iife'],
    globalName: 'qrGen',
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: true,
    outExtension({ format }) {
        if (format === 'iife') {
            return { js: '.min.js' };
        }
        if (format === 'cjs') {
            return { js: '.cjs' };
        }
        return { js: '.esm.js' };
    },
    // Bundle qrcode-generator so that qr-gen is zero-dependency at runtime
    noExternal: ['qrcode-generator'],
    banner: {
        js: '/*! qr-gen v1.0.1 - https://github.com/brunonyland/qr-gen */'
    },
    footer: {
        js: 'if (typeof qrGen !== "undefined" && qrGen.default) { qrGen = qrGen.default; }'
    }
});
