module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  extends: [
    "plugin:vue/strongly-recommended",
    "eslint:recommended",
    "@vue/typescript/recommended",
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    "vue/html-indent": ["error", 2, {
      "attribute": 2,
    }],
    "vue/max-attributes-per-line": ["error", {
      "singleline": 6,
      "multiline": 1
    }],
  }
}
