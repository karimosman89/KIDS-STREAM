import react from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      "react/jsx-key": "error"
    }
  }
];
