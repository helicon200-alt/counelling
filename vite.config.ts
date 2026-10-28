import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Firebase SDK(약 170KB gzip)는 원래 이 정도 크기이므로 경고 기준을 조정
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        // Firebase SDK를 별도 파일로 분리해 브라우저 캐시 효율을 높인다
        codeSplitting: {
          groups: [
            { name: 'firebase', test: /node_modules[\\/](@firebase|firebase)[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
})
