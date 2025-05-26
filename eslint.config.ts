// @ts-check
import eslint from "@eslint/js"
import banRelativeImports from "eslint-plugin-ban-relative-imports"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config([
    {ignores: ["dist"]},
    {
        extends: [eslint.configs.recommended, tseslint.configs.recommended],
        files: ["src/**/*.{ts,tsx}"],
        languageOptions: {ecmaVersion: "latest", globals: globals.browser},
        plugins: {
            "react-hooks": reactHooks,
            "ban-relative-imports": banRelativeImports,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "ban-relative-imports/ban-relative-imports": "error",
            "func-style": ["error", "declaration"],
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "sort-imports": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "no-async-promise-executor": "off",
            "no-empty": "off",
            "prefer-const": "off",
        },
    },
])
