module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'JSON Chat',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'JSON Server based chat test project' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev) {
        config.devtool = isClient ? 'source-map' : 'inline-source-map';
      }
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  plugins: [
    { src: '~plugins/vuelidate.js' },
    { src: '~plugins/customScroll.js', mode: 'client' },
  ],
  modules: [
    'bootstrap-vue/nuxt',
    'cookie-universal-nuxt'
  ],
  buildModules: [
    '@nuxtjs/dotenv',
    '@nuxt/http',
  ],
  publicRuntimeConfig: { 
    api: process.env.API_PATH,
    port: process.env.API_PORT,
  },
}

