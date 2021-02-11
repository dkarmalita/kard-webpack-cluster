const allowUnderscoreDangleNames = ["__WP_BUILDER_CONFIG__", "__WP_BUILDER_OPTION__"]

module.exports = {
  extends: ['airbnb'],

  env: {
    node: true,
  },

  globals: {},

  rules: {
    'max-len': ['warn'],
    'no-unused-vars': ['warn'],
    'no-underscore-dangle': ["error", { "allow": allowUnderscoreDangleNames }],
  }
}
