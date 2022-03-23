import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useWeb3 } from "@/context/Web3Context";

const CENNZnetAccountPicker: React.FC<{
	updateSelectedAccount: Function;
}> = ({ updateSelectedAccount }) => {
	const { accounts }: any = useWeb3();
	const [accountNames, setAccountNames] = useState<string[]>([]);

	useEffect(() => {
		let names: string[] = [];
		accounts.map((account: { name: string; address: string }) => {
			names.push(account.name);
		});
		setAccountNames(names);
	}, [accounts]);

	const updateAccount = (accountName: string) => {
		accounts.forEach((account: { name: string; address: string }) => {
			if (account.name === accountName) {
				updateSelectedAccount(account);
			}
		});
	};

	return (
		<Autocomplete
			disablePortal
			options={accountNames}
			onSelect={(e: any) => updateAccount(e.target.value)}
			sx={{
				width: "80%",
			}}
			renderInput={(params) => (
				<TextField {...params} label="Destination" required />
			)}
		/>
	);
};

export default CENNZnetAccountPicker;
