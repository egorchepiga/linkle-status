module.exports = {
  // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
  apps: [
    {
      /**
       * СЕРВЕР
       */
      name: 'url-shortener-status-server',
      script: 'source/server.js',
      env: {
        watch: true,
        HOOK_PORT: 8813,
        WS_PORT: 9897,
        MONGO_PORT: 28017,
        NODE_ENV: 'development'
      },
      env_vps: {
        watch: false,
        HOOK_PORT: 8813,
        WS_PORT: 9897,
        MONGO_PORT: 27017,
        NODE_ENV: 'production'
      }
    },
    {
      /**
       * КЛИЕНТ
       */
      name: 'url-shortener-status-client',
      script: 'source/client.js',
      env: {
        watch: true,
        WS_PORT: 9897,
        WS_HOST: 'localhost',
        NODE_ENV: 'development'
      },
      env_raspberry: {
        watch: false,
        WS_PORT: 9897,
        WS_HOST: '138.68.183.160',
        NODE_ENV: 'production'
      }
    }
  ],

  // todo: добавить в readme инфу о том, что нужен pm2 глобальный
  deploy: {
    vps: {
      user: 'adminus',
      host: '138.68.183.160',
      ref: 'origin/master',
      repo: 'git@github.com:taxnuke/url-shortener-status.git',
      path: '/var/www/stat.short.taxnuke.ru',
      'post-deploy': 'npm i && pm2 reload ecosystem.config.js --env vps --only url-shortener-status-server'
    },
    raspberry: {
      user: 'pi',
      // задеплоить на Raspberry можно только с локалки, соответственно
      host: '192.168.1.70',
      ref: 'origin/master',
      repo: 'git@github.com:taxnuke/url-shortener-status.git',
      path: '/var/www/stat.short.taxnuke.ru',
      'post-deploy': 'npm i && pm2 reload ecosystem.config.js --env raspberry --only url-shortener-status-client'
    }
  }
}
