import React, { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Switch from "../components/Switch";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../components/theme";
import { AppBar, Typography } from "@mui/material";
import { BlockchainProvider } from "../context/blockchainContext";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  async function init() {
    const { ethereum } = window as any;

    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    const ropstenChainId = "0x3";
    if (chainId !== ropstenChainId) {
      alert("Please switch to the Ropsten Test Network!");
    }
    await ethereum.request({
      method: "eth_requestAccounts",
    });
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
        <BlockchainProvider>
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
        </BlockchainProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
