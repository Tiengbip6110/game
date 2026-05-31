const fs = require('fs');
const esbuild = require('esbuild');

const plugin = {
  name: 'three-alias',
  setup(build) {
    build.onResolve({ filter: /^three(\/.*)?$/ }, args => {
      if (args.path === 'three') {
        return { path: require.resolve('./three_bundle/node_modules/three/build/three.module.js') };
      }
      if (args.path.startsWith('three/addons/')) {
        const subPath = args.path.slice('three/addons/'.length);
        return { path: require.resolve(`./three_bundle/node_modules/three/examples/jsm/${subPath}`) };
      }
    });
  },
};

esbuild.build({
  entryPoints: ['js_bundle/main.js'],
  bundle: true,
  outfile: 'js_bundle/out.js',
  format: 'iife',
  plugins: [plugin],
  minify: true
}).then(() => {
  console.log('Bundled JS successfully');
}).catch((e) => {
  console.log(e);
  process.exit(1);
});
