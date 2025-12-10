import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

const phasermsg = () => {
    return {
        name: 'phasermsg',
        buildStart() {
            process.stdout.write(`Building for production...\n`);
        },
        buildEnd() {
            const line = "---------------------------------------------------------";
            const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
            process.stdout.write(`${line}\n${msg}\n${line}\n`);

            process.stdout.write(`✨ Done ✨\n`);
        }
    }
}

export default defineConfig({
    base: '/', // Use root for Netlify/Vercel, or '/CSC4821/' for GitHub Pages
    plugins: [
        react(),
        monacoEditorPlugin.default({
            languageWorkers: ['editorWorkerService'],
            customWorkers: []
        }),
        phasermsg()
    ],
    logLevel: 'warning',
    optimizeDeps: {
        include: ['monaco-editor']
    },
    build: {
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                passes: 2,
                pure_getters: false,
                keep_fnames: true,
                keep_classnames: true
            },
            mangle: {
                keep_fnames: true,
                keep_classnames: true
            },
            format: {
                comments: false
            }
        }
    }
});
