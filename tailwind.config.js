// tailwind config file for typescript

module.exports = {
  purge: {
    content: ['./src/**/*.html', './src/**/*.tsx', './src/**/*.ts', './src/**/*.jsx', './src/**/*.js'],
    options: {}
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {},
      fontFamily: {
        valverde: ['Valverde', 'sans-serif']
      },
      backgroundImage: (theme) => ({
        'light-logo':
          "url('https://firebasestorage.googleapis.com/v0/b/meublesbymi.appspot.com/o/WHITE_LOGO.png?alt=media&token=0f7c5611-48bd-426c-b9e9-498998dfec82')",
        'dark-logo':
          "url('https://firebasestorage.googleapis.com/v0/b/meublesbymi.appspot.com/o/DARK_LOGO.png?alt=media&token=26c79fec-2c61-4948-9791-217c2d34fcb7')"
      }),
      boxShadow: {
        'light-small': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
        'light-large': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        'dark-small': '2px 2px 0px 0px rgba(255, 255, 255, 1)',
        'dark-large': '4px 4px 0px 0px rgba(255, 255, 255, 1)'
      }
    }
  },
  variants: {
    extend: {
      backgroundImage: ['dark']
    }
  }
}
