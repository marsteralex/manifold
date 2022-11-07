// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')

/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path')
const projectRoot = __dirname
const defaultConfig = getDefaultConfig(projectRoot)
const extraNodeModules = {
  common: path.resolve(__dirname + '/../common'),
  components: path.resolve(__dirname + '/components'),
}
defaultConfig.watchFolders = [
  path.resolve(__dirname + '/../common'),
  path.resolve(__dirname + '/components'),
  // workspaceRoot,
]
defaultConfig.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
]
module.exports = {
  ...defaultConfig,
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) =>
        //redirects dependencies referenced from common/ to local node_modules
        name in target
          ? target[name]
          : path.join(process.cwd(), `node_modules/${name}`),
    }),
    assetExts: [...defaultConfig.resolver.assetExts, 'cjs'],
  },
}
