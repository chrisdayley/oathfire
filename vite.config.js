import {defineConfig} from 'vite';
export default defineConfig({base:'./',build:{rollupOptions:{input:{game:'index.html',soundtrack:'soundtrack.html'}},target:'es2022',chunkSizeWarningLimit:2100},server:{port:4173,strictPort:true}});
