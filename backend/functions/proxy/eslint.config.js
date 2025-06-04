import importPlugin from 'eslint-plugin-import';

export default [
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2021
    },
    plugins: {
      import: importPlugin
    },
    'rules': {
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
        'no-console': 'off',
        
        // Regole per gli import
        'import/no-unresolved': 'error',           // Segnala import non risolvibili
        'import/named': 'error',                   // Verifica che gli import nominati esistano
        'import/default': 'error',                 // Verifica che gli import default esistano
        'import/namespace': 'error',               // Verifica che gli import namespace esistano
        'import/no-missing-import': 'error',       // Segnala import mancanti
        'import/no-duplicates': 'error',           // Previene import duplicati
        'import/order': [                          // Ordina gli import
            'error',
            {
                'groups': [
                    'builtin',                     // Node.js built-in modules
                    'external',                    // npm packages
                    'internal',                    // paths aliased to internal
                    'parent',                      // parent directory imports
                    'sibling',                     // same or sibling directory imports
                    'index'                        // index of the current directory
                ],
                'newlines-between': 'always'       // Linea vuota tra gruppi di import
            }
        ],
        'import/first': 'error',                   // Gli import devono essere in cima al file
        'import/exports-last': 'error',            // Gli export devono essere in fondo al file
        'import/no-self-import': 'error',          // Previene l'import di se stesso
        'import/no-cycle': 'error',                // Previene dipendenze circolari
    },
  }
];