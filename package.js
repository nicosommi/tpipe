/* ph stamps */
/* /^(?!expressWebServer)(?!eslintLinting)(?!reactMochaEnzyme)(?!webpackWithDevServer)(?!styledComponents)(?!expectAssertions).*$/ */
/* endph */

let packageObject = {
  babel: {
    presets: ['es2015', 'stage-2']
  },
  dependencies: {
    'bluebird': '^3.3.5',
    'debug': '^2.2.0'
  },
  devDependencies: {
    gddify: '^0.1.6',
    'babel-cli': '^6.22.2',
    'babel-polyfill': '^6.9.1',
    'babel-preset-es2015': '^6.9.0',
    'babel-preset-stage-2': '^6.18.0',
    'babel-register': '^6.9.0',
    'babel-require': '^1.0.1',
    'cross-env': '^3.1.3',
    'shx': '^0.2.2'
  },
  scripts: {
    gddify: 'gddify',
    build: 'shx rm -fr dist && babel source -d dist'
  },
  readmeFilename: 'README.md',
  author: 'nicosommi',
  license: 'MIT'
}

/* ph customPackage */
packageObject = {
  ...packageObject,
  babel: {
    ...packageObject.babel
  },
  name: 'tpipe',
  version: '0.0.7',
  main: './dist/lib/lib.js',
  description: 'T piper for functions',
  repository: {
    type: 'git',
    url: 'ssh://github.com/nicosommi/tpipe.git'
  },
  homepage: 'https://github.com/nicosommi/tpipe',
  devDependencies: {
    ...packageObject.devDependencies,
    debug: '^2.2.0',
    sinon: '^1.17.7'
  },
  scripts: {
    ...packageObject.scripts
  }
}
/* endph */

/* stamp expressWebServer */
/* endstamp */

/* stamp mochaTesting */
packageObject = {
  ...packageObject,
  devDependencies: {
    ...packageObject.devDependencies,
    mocha: '^2.5.3',
    nyc: '^10.0.0',
    proxyquire: '^1.7.10'
  },
  scripts: {
    ...packageObject.scripts,
    test: 'cross-env NODE_ENV=test nyc --reporter=text-summary mocha \'spec/**/*.spec.js\' --require mocha.setup.js',
    // 'test:watch': 'cross-env NODE_ENV=test watch \'nyc --reporter=text-summary mocha "spec/**/*.spec.js" --require mocha.setup.js\' --reporter min src --ignoreDotFiles',
    'test:watch': 'cross-env NODE_ENV=test nyc --reporter=text-summary mocha "spec/**/*.spec.js" --require mocha.setup.js --reporter min --watch',
    coverage: 'cross-env NODE_ENV=test nyc mocha \'spec/**/*.spec.js\' --require mocha.setup.js',
    // 'coverage:watch': 'cross-env NODE_ENV=test watch \'nyc mocha "spec/**/*.spec.js" --require mocha.setup.js\' src --ignoreDotFiles'
    'coverage:watch': 'cross-env NODE_ENV=test nyc mocha \'spec/**/*.spec.js\' --require mocha.setup.js --watch --reporter min'
  }
}
/* endstamp */

/* stamp reactMochaEnzyme */
/* endstamp */

/* stamp webpackWithDevServer */
/* endstamp */

/* stamp styledComponents */
/* endstamp */

/* stamp nycEnforceCoverage */
packageObject = {
  ...packageObject,
  nyc: {
    lines: 85,
    statements: 85,
    functions: 85,
    branches: 85,
    sourceType: 'module',
    include: [
      'source/**/*.js'
    ],
    exclude: [
      'spec/**/*.spec.js'
    ],
    reporter: [
      'lcov',
      'text',
      'html'
    ],
    require: [
      'babel-register'
    ],
    extension: [
      '.js'
    ],
    cache: true,
    all: true,
    'check-coverage': true,
    'report-dir': './.coverage'
  }
}
/* endstamp */

/* stamp expectAssertions */
/* endstamp */

/* stamp shouldAssertions */
packageObject = {
  ...packageObject,
  devDependencies: {
    ...packageObject.devDependencies,
    should: '^11.2.0'
  }
}
/* endstamp */

/* stamp nspPackageManagement */
packageObject = {
  ...packageObject,
  dependencies: {
    ...packageObject.dependencies,
    nsp: '^2.6.2'
  },
  scripts: {
    ...packageObject.scripts,
    check: 'nsp check'
  }
}
/* endstamp */

/* stamp eslintLinting */
/* endstamp */

/* stamp standardLinting */
packageObject = {
  ...packageObject,
  devDependencies: {
    ...packageObject.devDependencies,
    'standard': '^8.6.0',
    ghooks: '^1.3.2'
  },
  'standard': {
    rules: {
      'react/jsx-filename-extension': [
        1,
        { extensions: ['.js', '.jsx'] }
      ],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          optionalDependencies: true,
          peerDependencies: true
        }
      ],
      'react/forbid-prop-types': [0]
    },
    'no-plusplus': [
      1,
      { allowForLoopAfterthoughts: true }
    ],
    'globals': []
  },
  config: {
    ghooks: {
      'pre-commit': `${packageObject.scripts.coverage} && standard --fix source spec`
    }
  },
  scripts: {
    ...packageObject.scripts,
    test: `standard --fix source && ${packageObject.scripts.test}`,
    fix: 'standard --fix package.js source/**/* spec/**/*'
  }
}
/* endstamp */

module.exports = packageObject
