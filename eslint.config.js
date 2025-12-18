const js = require("@eslint/js");
const jestPlugin = require("eslint-plugin-jest");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                ...globals.browser,
                ...globals.jest,
                ...globals.webextensions,
                ...globals.node,
            },
        },
        plugins: {
            jest: jestPlugin,
        },
        rules: {
            ...jestPlugin.configs.recommended.rules,
            "no-unused-vars": "warn",
            "no-console": "off",
        },
    },
    prettierConfig,
];
