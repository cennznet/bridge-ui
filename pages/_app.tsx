import React, { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Switch from "../components/Switch";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../components/theme";
import BlockchainProvider from "../context/BlockchainContext";
import { AppBar, Typography } from "@mui/material";
import dynamic from "next/dynamic";
const { NEXT_PUBLIC_NETWORK_CHAIN_ID } = process.env;

const Web3 = dynamic(() => import("../components/Web3"), { ssr: false });

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { ethereum } = window as any;

      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);

      if (chainId !== NEXT_PUBLIC_NETWORK_CHAIN_ID) {
        NEXT_PUBLIC_NETWORK_CHAIN_ID === "0x3"
          ? alert("Please switch to the Ropsten Test Network!")
          : alert("Please connect to Ethereum Mainnet!");
      }

      await ethereum.request({
        method: "eth_requestAccounts",
      });
    })();
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
            variant="h3"
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

        <BlockchainProvider>
          <Web3>
            <Component {...pageProps} />
          </Web3>
        </BlockchainProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
