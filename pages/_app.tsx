import React, { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Switch from "../components/Switch";
import { initEthers } from "../utils/ethers";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../components/theme";
import { AppBar, Typography } from "@mui/material";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [contracts, setContracts] = useState({
    peg: {},
    token: {},
  });
  const [account, setAccount] = useState("");

  async function init() {
    const { peg, token, accounts }: any = await initEthers();
    setContracts({ peg, token });
    setAccount(accounts[0]);
    console.log("contracts", contracts);
    console.log("account", accounts[0]);
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Head>
        <title>Ethereum Bridge</title>
        <meta
          name="description"
          content="Ethereum Bridge powered by CENNZnet"
        />
        <link rel="icon" href="/favicon.svg" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <AppBar position="static" sx={{ marginBottom: "-5px" }}>
          <Typography
            variant="h4"
            component="div"
            sx={{
              padding: "10px 0 10px",
              cursor: "pointer",
              textAlign: "center",
              color: "secondary.dark",
            }}
            onClick={() => router.push("/")}
          >
            CENNZnet {"<>"} ETH Bridge
          </Typography>
        </AppBar>

        <Switch />

        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
