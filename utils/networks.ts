const networks = ["Mainnet/Mainnet", "Ropsten/Rata", "Kovan/Nikau"];

export const updateNetworks = async (selectedNetwork, updateNetwork) => {
  const { ethereum }: any = window;
  let ethereumNetwork;
  switch (selectedNetwork) {
    default:
    case networks[0]:
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }],
      });
      ethereumNetwork = "Mainnet";
      break;
    case networks[1]:
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x3" }],
      });
      ethereumNetwork = "Ropsten";
      break;
    case networks[2]:
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2a" }],
      });
      ethereumNetwork = "Kovan";
      break;
  }
  updateNetwork(ethereum, ethereumNetwork);
};
