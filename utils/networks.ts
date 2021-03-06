const networks = ["Mainnet/Mainnet", "Ropsten/Rata", "Kovan/Nikau"];

export const updateNetworks = async (selectedNetwork) => {
	let network;
	switch (selectedNetwork) {
		default:
		case networks[0]:
			await global.ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: "0x1" }],
			});
			network = "Mainnet";
			break;
		case networks[1]:
			await global.ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: "0x3" }],
			});
			network = "Ropsten";
			break;
		case networks[2]:
			await global.ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: "0x2a" }],
			});
			network = "Kovan";
			break;
	}
	window.localStorage.setItem("ethereum-network", network);
	window.location.reload();
};
