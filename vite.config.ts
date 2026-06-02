import { defineConfig } from 'vite';
import { resolve } from 'path';
import { execSync } from "child_process";

export default defineConfig({  
  base: '/threejs-terrain/', // Replace 'my-threejs-app' with your GitHub repository name
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          demo1: resolve(__dirname, 'demo1.html'),
          demo2: resolve(__dirname, 'demo2.html'),
          demo3: resolve(__dirname, 'demo3.html'),
        },
      },    
      target: 'es2022'
    },  
    define: {
      __BUILD_COMMIT__ :  JSON.stringify(execSync("git rev-parse --short HEAD").toString().trim()),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __BUILD_NUMBER__: JSON.stringify(execSync("git rev-list --count HEAD").toString().trim()),
    },
});
