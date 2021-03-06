import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'

// comment out when using custom theme
declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    header: {
      light: string
      main: string
      dark: string
      borderBottom: string
    }
  }
  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    header: {
      light: string
      main: string
      dark: string
    }
  }
}

const theme = createMuiTheme({
  header: {
    light: '#ffffff',
    main: '#f5f5f5',
    dark: '#000000',
  },
  palette: {
    primary: {
      light: '#ffffff',
      main: '#f5f5f5',
    },
  },
  /*item: {
    borderBottom: '1px solid #cccccc'
  }*/
})

export default theme
