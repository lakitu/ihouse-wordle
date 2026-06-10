import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import compression from 'vite-plugin-compression'

export default defineConfig({
        plugins: [
                viteSingleFile(),
                compression({ algorithm: 'brotliCompress', ext: '.br' })
        ],
        build: {
                cssCodeSplit: false,
        },
        base: '/ihouse-wordle/'
})
