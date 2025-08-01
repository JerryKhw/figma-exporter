import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default [
    {
        ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.ts"],
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { 
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_" 
                }
            ],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports" }
            ],
            "prefer-const": "error",
            "no-var": "error",
        },
    },
];
