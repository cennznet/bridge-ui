import React from "react";
import { isBrowser, isTablet } from "react-device-detect";
import type { AppProps } from "next/app";
import Head from "next/head";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme/theme";
import BlockchainProvider from "../context/BlockchainContext";
import dynamic from "next/dynamic";
import "../theme/styles.css";
import { AppBar, Box, Typography } from "@mui/material";
import { useRouter } from "next/router";

const Web3 = dynamic(() => import("../components/Web3"), { ssr: false });

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	return (
		<>
			<Head>
				<title>Ethereum Bridge</title>
				<meta
					name="description"
					content="Ethereum Bridge powered by CENNZnet"
				/>
				<link rel="icon" href="/favicon.svg" />
			</Head>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Web3>
					<BlockchainProvider>
						<AppBar position="static">
							<Box onClick={() => router.push("/")} sx={{ cursor: "pointer" }}>
								<img
									src="/cennznet-header.png"
									alt="CENNZnet header"
									style={{
										width: isBrowser || isTablet ? "90px" : "45px",
										position: "absolute",
										top: "5%",
										left: "6%",
									}}
								/>
							</Box>
							<Typography
								sx={{
									position: "absolute",
									top: "4.5%",
									left: isBrowser ? "16%" : "25%",
									fontFamily: "Teko",
									fontStyle: "normal",
									fontWeight: "bold",
									fontSize: isBrowser || isTablet ? "24px" : "16px",
									lineHeight: "124%",
									color: "black",
									letterSpacing: "1px",
								}}
							>
								ETHEREUM BRIDGE
							</Typography>
						</AppBar>
						<Component {...pageProps} />
					</BlockchainProvider>
				</Web3>
			</ThemeProvider>
		</>
	);
}

export default MyApp;
