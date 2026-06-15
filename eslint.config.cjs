const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
    {
        ignores: ["eslint.config.*", "build/", "coverage/", "dist/", "node_modules/"],
    },
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
            },
            ecmaVersion: 2022,
            sourceType: "module",
        },
        rules: {
            // Disable some standard ESLint rules in favor of TypeScript checks
            "no-undef": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { 
                vars: "all", 
                args: "after-used", 
                argsIgnorePattern: "^_" 
            }],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            
            // Standard code quality and style rules
            "array-bracket-spacing": [2, "never"],
            "arrow-parens": [2, "as-needed"],
            "arrow-spacing": 2,
            "block-scoped-var": 2,
            "brace-style": [2, "1tbs", {
                allowSingleLine: true,
            }],
            "comma-dangle": [2, "never"],
            "comma-spacing": [2, {
                before: false,
                after: true,
            }],
            "comma-style": [2, "last"],
            "computed-property-spacing": [2, "never"],
            "consistent-return": 2,
            "curly": [2, "multi-line"],
            "dot-location": [2, "property"],
            "dot-notation": [2, {
                allowKeywords: true,
            }],
            "eol-last": 2,
            "eqeqeq": 2,
            "func-names": [2, "as-needed"],
            "indent": [2, 4],
            "key-spacing": [2, {
                beforeColon: false,
                afterColon: true,
            }],
            "keyword-spacing": [2, {
                before: true,
                after: true,
            }],
            "linebreak-style": [2, "unix"],
            "no-alert": 2,
            "no-caller": 2,
            "no-console": 0,
            "no-const-assign": 2,
            "no-debugger": 2,
            "no-duplicate-case": 2,
            "no-eval": 2,
            "no-extra-semi": 2,
            "no-multi-spaces": 2,
            "no-multiple-empty-lines": [2, {
                max: 4,
            }],
            "no-new": 2,
            "no-redeclare": 2,
            "no-shadow": 2,
            "no-trailing-spaces": 2,
            "no-var": 2,
            "object-curly-spacing": [2, "never"],
            "object-shorthand": [2, "always"],
            "one-var": [2, "never"],
            "prefer-arrow-callback": 2,
            "prefer-const": 1,
            "quotes": [2, "single", "avoid-escape"],
            "semi": [2, "always"],
            "semi-spacing": [2, {
                before: false,
                after: true,
            }],
            "space-before-blocks": [2, "always"],
            "space-before-function-paren": [2, {
                anonymous: "always",
                named: "never",
            }],
            "space-in-parens": [2, "never"],
            "space-infix-ops": 2,
            "spaced-comment": [2, "always"],
            "yoda": [2, "never", {
                exceptRange: true,
            }],
        },
    }
);
