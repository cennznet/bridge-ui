import { ethers } from "ethers";
import GenericERC20TokenAbi from "@/artifacts/GenericERC20Token.json";

export const ETH = "0x0000000000000000000000000000000000000000";

export const getMetamaskBalance = async (tokenAddress, account) => {
	const provider = new ethers.providers.Web3Provider(global.ethereum);
	const signer = provider.getSigner();
	let balance, decimals;

	if (tokenAddress === ETH) {
		balance = await provider.getBalance(account);
	} else {
		const token: ethers.Contract = new ethers.Contract(
			tokenAddress,
			GenericERC20TokenAbi,
			signer
		);

		decimals = await token.decimals();

		balance = await token.balanceOf(account);
	}

	return Number(ethers.utils.formatUnits(balance, decimals));
};

export const parseERC20Amount = async (
	tokenAddress: string,
	amount: string
) => {
	const provider = new ethers.providers.Web3Provider(global.ethereum);
	const signer = provider.getSigner();

	const token: ethers.Contract = new ethers.Contract(
		tokenAddress,
		GenericERC20TokenAbi,
		signer
	);

	const decimals = await token.decimals();

	return ethers.utils.parseUnits(amount, decimals).toString();
};
