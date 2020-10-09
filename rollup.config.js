import { createRollupConfigs } from './scripts/base.config.js'
import replace from 'rollup-plugin-replace';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import autoPreprocess from 'svelte-preprocess'
import postcssImport from 'postcss-import'

const production = !process.env.ROLLUP_WATCH;

export const config = {
  staticDir: 'static',
  distDir: 'dist',
  buildDir: `dist/build`,
  serve: !production,
  production,
  rollupWrapper: rollup => {
    // Check ` _rollupConfig.plugins` in `scripts/base.config.js`.
    rollup.plugins.splice(2, 0, replace({
      values: {
        'crypto.randomBytes': 'require("randombytes")'
      }
    }))
    rollup.plugins.splice(5, 0, globals())
    rollup.plugins.splice(6, 0, builtins())
    console.log(rollup.plugins)
  },
  svelteWrapper: svelte => {
    svelte.preprocess = [
      autoPreprocess({
        postcss: {
          plugins: [
            postcssImport(),
            require('autoprefixer')()
          ]
        },
        defaults: { style: 'postcss' }
      })]
  },
  swWrapper: worker => worker,
}

const configs = createRollupConfigs(config)

export default configs

/**
  Wrappers can either mutate or return a config

  wrapper example 1
  svelteWrapper: (cfg, ctx) => {
    cfg.preprocess: mdsvex({ extension: '.md' }),
  }

  wrapper example 2
  rollupWrapper: cfg => {
    cfg.plugins = [...cfg.plugins, myPlugin()]
    return cfg
  }
*/


