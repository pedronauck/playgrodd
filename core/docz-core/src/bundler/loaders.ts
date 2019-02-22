import * as path from 'path'
import Config from 'webpack-chain'

import * as paths from '../config/paths'
import { Config as Args } from '../config/argv'
import { BabelRC } from '../config/babel'

const excludeNodeModules = (filepath: string) => /node_modules/.test(filepath)

export const sourceMaps = (config: Config, args: Args) => {
  const srcPath = path.resolve(paths.root, args.src)

  config.module
    .rule('sourcemaps')
    .test(/\.(js|mjs|jsx|ts|tsx|md|mdx)$/)
    .include.add(srcPath)
    .add(paths.app)
    .end()
    .exclude.add(excludeNodeModules)
    .end()
    .use('sourcemaps')
    .loader(require.resolve('source-map-loader'))
    .end()
    .enforce('pre')
}

export interface AddScriptLoaderOpts {
  threadLoader?: boolean
  rule: Config.Rule
  babelrc: BabelRC
  args: Args
}

const addScriptLoaders = (opts: AddScriptLoaderOpts) => {
  const { rule, threadLoader = true, babelrc, args } = opts
  return rule
    .when(!args.debug, rule =>
      rule
        .use('cache-loader')
        .loader(require.resolve('cache-loader'))
        .options({
          cacheDirectory: paths.cache,
        })
    )
    .when(Boolean(threadLoader), rule =>
      rule
        .use('thread-loader')
        .loader(require.resolve('thread-loader'))
        .options({
          workers: require('os').cpus().length - 1,
        })
    )
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelrc)
    .end()
}

export const js = (config: Config, args: Args, babelrc: BabelRC) => {
  const srcPath = path.resolve(paths.root, args.src)
  const rule = config.module
    .rule('js')
    .test(/\.(js|mjs|jsx)$/)
    .include.add(srcPath)
    .add(paths.root)
    .add(paths.app)
    .end()
    .exclude.add(excludeNodeModules)
    .end()

  addScriptLoaders({ rule, babelrc, args })
}

export const ts = (config: Config, args: Args, babelrc: BabelRC) => {
  const srcPath = path.resolve(paths.root, args.src)
  const rule = config.module
    .rule('ts')
    .test(/\.(ts|tsx?)$/)
    .include.add(srcPath)
    .add(paths.root)
    .add(paths.app)
    .end()
    .exclude.add(excludeNodeModules)
    .end()

  addScriptLoaders({ rule, babelrc, args })
}

export const mdx = (config: Config, args: Args, babelrc: BabelRC) => {
  const { mdPlugins, hastPlugins } = args
  const srcPath = path.resolve(paths.root, args.src)
  const rule = config.module
    .rule('mdx')
    .test(/\.(md|markdown|mdx)$/)
    .include.add(srcPath)
    .add(paths.root)
    .end()
    .exclude.add(excludeNodeModules)
    .end()

  addScriptLoaders({ rule, babelrc, args, threadLoader: false })
    .use('mdx-loader')
    .loader(require.resolve('@mdx-js/loader'))
    .options({
      mdPlugins: mdPlugins.concat([
        [require('remark-frontmatter'), { type: 'yaml', marker: '-' }],
        require('remark-docz'),
      ]),
      hastPlugins: hastPlugins.concat([
        [
          require('rehype-docz'),
          { root: paths.root, useCodeSandbox: args.codeSandbox },
        ],
        require('rehype-slug'),
      ]),
    })
}

<<<<<<< HEAD:core/docz-core/src/bundler/loaders.ts
=======
export const setupHappypack = (config: Config, args: Args, babelrc: any) => {
  const happyThreadPool = happyPack.ThreadPool({ size: 6 })
  const loaders = [
    !args.debug && {
      loader: require.resolve('cache-loader'),
      options: {
        cacheDirectory: paths.cache,
      },
    },
    {
      loader: require.resolve('babel-loader'),
      options: babelrc,
    },
  ]

  const loaderWithDocgen = [
    args.propsParser &&
      args.typescript && {
        loader: require.resolve('react-docgen-typescript-loader'),
        options: {
          propFilter: (prop: any) => {
            if (prop.parent == null) return true
            return !prop.parent.fileName.includes('node_modules')
          },
        },
      },
  ]

  config.plugin('happypack-jsx').use(happyPack, [
    {
      id: 'jsx',
      verbose: args.debug,
      threadPool: happyThreadPool,
      loaders: loaders.concat(loaderWithDocgen).filter(Boolean),
    },
  ])

  config.plugin('happypack-mdx').use(happyPack, [
    {
      id: 'mdx',
      verbose: args.debug,
      threadPool: happyThreadPool,
      loaders: loaders.filter(Boolean),
    },
  ])
}

>>>>>>> dev:packages/docz-core/src/webpack/loaders.ts
const INLINE_LIMIT = 10000

export const images = (config: Config) => {
  config.module
    .rule('images')
    .test(/\.(png|jpe?g|gif)(\?.*)?$/)
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options({
      limit: INLINE_LIMIT,
      name: `static/img/[name].[hash:8].[ext]`,
    })
}

export const svg = (config: Config) => {
  config.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
    .loader(require.resolve('file-loader'))
    .options({
      name: `static/img/[name].[hash:8].[ext]`,
    })
}

export const media = (config: Config) => {
  config.module
    .rule('media')
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options({
      limit: INLINE_LIMIT,
      name: `static/media/[name].[hash:8].[ext]`,
    })
}

export const fonts = (config: Config) => {
  config.module
    .rule('fonts')
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options({
      limit: INLINE_LIMIT,
      name: `static/fonts/[name].[hash:8].[ext]`,
    })
}
