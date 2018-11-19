module.exports = {
  // todo: Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
  apps: [
    {
      /**
       * CLIENT
       */
      name: 'url-shortener-status-client',
      script: 'source/client.js',
      env: {
        watch: true,
        WS_PORT: 9897,
        WS_HOST: 'localhost',
        NODE_ENV: 'development'
      },
      env_production: {
        WS_PORT: 9897,
        WS_HOST: '138.68.183.160',
        NODE_ENV: 'production'
      }
    },
    {
      /**
       * SERVER
       */
      name: 'url-shortener-status-server',
      script: 'source/server.js',
      env: {
        watch: true,
        HOOK_PORT: 8813,
        WS_PORT: 9897,
        NODE_ENV: 'development'
      },
      env_production: {
        HOOK_PORT: 8813,
        WS_PORT: 9897,
        NODE_ENV: 'production'
      }
    }
  ],

  deploy: {
    // todo: надо найти способ задеплоить на Pi
    production: {
      user: 'adminus',
      host: '138.68.183.160',
      ref: 'origin/master',
      repo: 'git@github.com:taxnuke/url-shortener-status.git',
      path: '/var/www/stat.short.taxnuke.ru',
      'post-deploy': 'npm i && pm2 reload ecosystem.config.js --env production'
    }
  }
}
