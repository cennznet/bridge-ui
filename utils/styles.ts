import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  heading: {
    padding: "10px 0 10px",
    cursor: "pointer",
    textAlign: "center",
    color: "secondary.dark",
  },
  box: {
    margin: "0 auto",
    borderRadius: 20,
    width: "30%",
    height: "auto",
    display: "block",
    border: "3px outset #cfcfcf",
  },
  input: {
    display: "flex",
    width: "70%",
    margin: "20px auto",
    borderRadius: 10,
  },
  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    border: "3px outset #cfcfcf",
    padding: 4,
    textAlign: "center",
    borderRadius: 10,
  },
});

export default useStyles;
