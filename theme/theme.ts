import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1130FF",
    },
    secondary: {
      main: "#B3BDFF",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#B3BDFF",
    },
  },
  typography: {
    fontFamily: ["Roboto", "Teko"].join(","),
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
      @font-face {
        font-family: "Teko";
        src: url("/fonts/Teko-Regular.ttf");
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local('Teko'), local('Teko-Regular'), url('/fonts/Teko-Regular.ttf') format('ttf');
      }
      
      @font-face {
        font-family: "Teko";
        src: url("/fonts/Teko-Bold.ttf");
        font-style: bold;
        font-weight: 700;
        font-display: swap;
        src: local('Teko'), local('Teko-Bold'), url('/fonts/Teko-Bold.ttf') format('ttf');
      }`,
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          opacity: "0.3",
        },
      },
    },
  },
});

export default theme;
