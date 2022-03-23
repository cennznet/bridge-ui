import React from "react";
import { Box, Button } from "@mui/material";

const Switch: React.FC<{ isDeposit: Boolean; toggleIsDeposit: Function }> = ({
	isDeposit,
	toggleIsDeposit,
}) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "row",
				justifyContent: "center",
				alignItems: "center",
				marginTop: "10%",
			}}
		>
			{isDeposit ? (
				<>
					<Button
						style={{
							position: "static",
							maxWidth: "276px",
							left: "calc(50% - 276px/2 - 138px)",
							top: "0%",
							bottom: "0%",
							backgroundColor: "#1130FF",
							border: "4px solid #1130FF",
							flex: "none",
							order: 0,
							alignSelf: "stretch",
							flexGrow: 1,
							margin: "0px 0px",
							borderBottom: "none",
							fontFamily: "Teko",
							fontStyle: "normal",
							fontWeight: "bold",
							fontSize: "24px",
							lineHeight: "124%",
							color: "#FFFFFF",
						}}
					>
						Deposit
					</Button>
					<Button
						onClick={() => toggleIsDeposit(false)}
						style={{
							position: "static",
							maxWidth: "276px",
							left: "calc(50% - 276px/2 - 138px)",
							top: "0%",
							bottom: "0%",
							backgroundColor: "#FFFFFF",
							border: "4px solid #1130FF",
							flex: "none",
							order: 0,
							alignSelf: "stretch",
							flexGrow: 1,
							margin: "0px 0px",
							borderBottom: "none",
							fontFamily: "Teko",
							fontWeight: "bold",
							fontSize: "24px",
							lineHeight: "124%",
							color: "#1130FF",
						}}
					>
						Withdraw
					</Button>
				</>
			) : (
				<>
					<Button
						onClick={() => toggleIsDeposit(true)}
						style={{
							position: "static",
							maxWidth: "276px",
							left: "calc(50% - 276px/2 - 138px)",
							top: "0%",
							bottom: "0%",
							backgroundColor: "#FFFFFF",
							border: "4px solid #1130FF",
							flex: "none",
							order: 0,
							alignSelf: "stretch",
							flexGrow: 1,
							margin: "0px 0px",
							borderBottom: "none",
							fontFamily: "Teko",
							fontWeight: "bold",
							fontSize: "24px",
							lineHeight: "124%",
							color: "#1130FF",
						}}
					>
						Deposit
					</Button>
					<Button
						style={{
							position: "static",
							maxWidth: "276px",
							left: "calc(50% - 276px/2 - 138px)",
							top: "0%",
							bottom: "0%",
							backgroundColor: "#1130FF",
							/* Primary Blue */
							border: "4px solid #1130FF",
							/* Inside Auto Layout */
							flex: "none",
							order: 0,
							alignSelf: "stretch",
							flexGrow: 1,
							margin: "0px 0px",
							borderBottom: "none",
							fontFamily: "Teko",
							fontWeight: "bold",
							fontSize: "24px",
							lineHeight: "124%",
							color: "#FFFFFF",
						}}
					>
						Withdraw
					</Button>
				</>
			)}
		</Box>
	);
};

export default Switch;
