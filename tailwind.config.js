module.exports = {
    // purge: [
    //     './public/css/*.css',
    //     './public/js/*.js'
    // ],
  theme: {
    extend: {
    fontFamily: {
      sans: ['Inter var'],
    },    
      spacing: {
          '72': '18rem',
          '80': '20rem',
          '84': '21rem',
          '96': '24rem',
          '104': '25rem',
          '116': '26rem',
          '128': '27rem',
    },
    minWidth: {
      '1/2': '50%'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      
      black: '#000',
      white: '#fff',
      lhred: '#CF2228',
      danger: '#CF2228',
      teal: {
         50: '#F0FDFA',
        100: '#E6FFFA',
        200: '#B2F5EA',
        300: '#81E6D9',
        400: '#4FD1C5',
        500: '#38B2AC',
        600: '#319795',
        700: '#2C7A7B',
        800: '#285E61',
        900: '#234E52', 
      },
      gray: {
      //warm
      //    50: '#FAFAF9',
      //   100: '#F5F5F4',
      //   200: '#E7E5E4',
      //   300: '#D6D3D1',
      //   400: '#A8A29E',
      //   500: '#78716C',
      //   600: '#57534E',
      //   700: '#44403C',
      //   800: '#292524',
      //   900: '#1C1917',

      //True
         50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#E5E5E5',
        300: '#D4D4D4',
        400: '#A3A3A3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',     
      }
      
      
    },
    
      gradients: theme => ({
          // Array definition (defaults to linear gradients).
            'lhadmin': ['to top', theme('colors.gray.600'), theme('colors.white')],

          // Object definition.
          'mono-circle': {
              type: 'radial',
              colors: ['circle', '#CCC', '#000']
          },
      }),
      customForms: theme => ({
          // horizontalPadding: defaultTheme.spacing[3],
          // verticalPadding: defaultTheme.spacing[2],
          lineHeight: theme('lineHeight.snug'),
          // fontSize: defaultTheme.fontSize.base,
          borderColor: 'transparent',
          // borderWidth: defaultTheme.borderWidth.default,
          borderRadius: theme('borderRadius.lg'),
          backgroundColor: theme('colors.gray.200'),
          focusBorderColor: 'transparent',
          focusShadow: 'none',
          // boxShadow: defaultTheme.boxShadow.none,
          checkboxSize: '1.5em',
          radioSize: '1.5em',
          // checkboxIcon: `<svg viewBox="0 0 16 16" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z"/></svg>`,
          // radioIcon: `<svg viewBox="0 0 16 16" fill="#fff" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="3"/></svg>`,
          checkedColor: theme('colors.red.600'),
          selectIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff"><path d="M15.3 9.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4l3.3 3.29 3.3-3.3z"/></svg>`,
          // selectIconOffset: defaultTheme.spacing[2],
          // selectIconSize: '1.5em',
      })
    }
  },
  variants: {},
  plugins: [
  require('@tailwindcss/forms'),
  //   require('@tailwindcss/custom-forms'),
  //   require('tailwindcss-plugins/gradients'),  
  ]
}