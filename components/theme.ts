import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: "#cfcfcf",
    },
    secondary: {
      main: "#949494",
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
