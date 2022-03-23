import React, { useState } from "react";
import { Button, Modal } from "@mui/material";
import { StyledModal, Heading, SmallText, Option } from "./StyledComponents";
import { useWeb3 } from "@/context/Web3Context";
import { Box, CircularProgress } from "@mui/material";
import store from "store";

const WalletModal: React.FC<{
	setModalOpen: Function;
	setModalState: Function;
	modalState: string;
}> = ({ setModalOpen, setModalState, modalState }) => {
	const [open] = useState(true);
	const {
		balances,
		accounts,
		selectedAccount,
		updateSelectedAccount,
		setBalances,
	}: any = useWeb3();

	const updateAccount = (account) => {
		if (account !== selectedAccount) {
			setBalances(null);
			updateSelectedAccount(account);
			store.set("selected-CENNZnet-account", account);
		}
		setModalState("showWallet");
	};

	const AccountBalances = selectedAccount && (
		<>
			<Box sx={{ mt: "5%", pl: "5%", display: "flex" }}>
				<Heading
					sx={{
						color: "primary.main",
						fontSize: "18px",

						textTransform: "uppercase",
					}}
				>
					{selectedAccount.name}&nbsp;
				</Heading>
				<Heading
					sx={{
						color: "black",
						fontSize: "18px",
						display: "flex",
					}}
				>
					{"[Account Name]"}
				</Heading>
			</Box>
			<SmallText sx={{ pl: "5%", opacity: "70%" }}>
				{selectedAccount.address}
			</SmallText>
			{balances ? (
				<Box sx={{ mt: "3%", pl: "5%", display: "block" }}>
					{Object.values(balances).map((token: any, i) => (
						<Box key={i}>
							<SmallText
								sx={{
									color: "black",
									fontSize: "18px",
									display: "inline-flex",
								}}
							>
								{token.symbol} Balance:
							</SmallText>
							<SmallText
								sx={{
									color: "black",
									fontWeight: "bold",
									fontSize: "18px",
									display: "inline-flex",
								}}
							>
								{token.balance}
							</SmallText>
							<br />
						</Box>
					))}
				</Box>
			) : (
				<>
					<SmallText
						sx={{ color: "primary.main", fontSize: "14", margin: "10px auto" }}
					>
						Fetching Balances...
					</SmallText>
					<CircularProgress sx={{ margin: "0 auto" }} />
				</>
			)}
		</>
	);

	return (
		<Modal open={open}>
			<StyledModal
				sx={{
					justifyContent: "center",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Box sx={{ display: "flex", mt: "3%", pl: "5%" }}>
					<Heading
						sx={{
							color: "primary.main",
							fontSize: "24px",
						}}
					>
						CENNZnet&nbsp;
					</Heading>
					<Heading
						sx={{
							color: "black",
							fontSize: "24px",
						}}
					>
						WALLET
					</Heading>
				</Box>
				{modalState === "showWallet" ? (
					<>
						{AccountBalances}
						<Button
							sx={{
								fontFamily: "Teko",
								fontWeight: "bold",
								fontSize: "21px",
								lineHeight: "124%",
								color: "primary.main",
								width: "40%",
								m: "30px auto 5px",
								display: "flex",
							}}
							size="large"
							variant="outlined"
							onClick={() => setModalState("changeAccount")}
						>
							Change Account
						</Button>
					</>
				) : (
					<>
						<Heading
							sx={{
								m: "3% 0 1.5% 5%",
								color: "primary.main",
								fontSize: "22px",
							}}
						>
							SELECT ACCOUNT
						</Heading>
						{accounts.length ? (
							accounts.map((account, i) => (
								<Option
									sx={{
										width: "85%",
										margin: "0 auto",
										height: "53px",
										display: "flex",
										mb: "10px",
										border: "1px solid",
										backgroundColor:
											account === selectedAccount ? "primary.main" : "#FFFFFF",
									}}
									onClick={() => updateAccount(account)}
									key={i}
								>
									<Heading
										sx={{
											fontSize: "20px",
											textTransform: "uppercase",
											color:
												account === selectedAccount
													? "#FFFFFF"
													: "primary.main",
										}}
										key={account.name}
									>
										{account.name}
									</Heading>
								</Option>
							))
						) : (
							<CircularProgress size="4rem" sx={{ margin: "10px auto 30px" }} />
						)}
					</>
				)}
				<Button
					sx={{
						fontFamily: "Teko",
						fontWeight: "bold",
						fontSize: "21px",
						lineHeight: "124%",
						color: "primary.main",
						width: "40%",
						m: modalState === "showWallet" ? "0 auto 30px" : "10px auto 30px",
						display: "flex",
					}}
					size="large"
					variant="outlined"
					onClick={() => {
						setModalState("");
						setModalOpen(false);
					}}
				>
					CLOSE
				</Button>
			</StyledModal>
		</Modal>
	);
};

export default WalletModal;
