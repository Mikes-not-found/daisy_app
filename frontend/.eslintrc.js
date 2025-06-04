export default {
    root: true,
    extends: '@react-native',
    'rules': {
        'indent': [
            'error',
            4,
        ],
        'linebreak-style': [
            'error',
            'unix',
        ],
        'semi': [
            'error',
            'always',
        ],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'react/jsx-no-unused-vars': 'off',
        'no-console': 'off',
        'react-hooks/exhaustive-deps': 'off'
    },
    parser: '@babel/eslint-parser',
    parserOptions: {
        requireConfigFile: false,
    },
};
