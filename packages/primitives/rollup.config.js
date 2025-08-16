import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const components = ['tabs'];

export default [
  // Bundle all components
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      typescript({ declaration: true, outDir: 'dist' })
    ],
    external: ['lit']
  },
  // Individual component bundles
  ...components.map(component => ({
    input: `src/${component}.ts`,
    output: {
      file: `dist/${component}.js`,
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      typescript({ declaration: true, outDir: 'dist' })
    ],
    external: ['lit']
  }))
];