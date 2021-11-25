const networks = ["Mainnet/Mainnet", "Ropsten/Rata", "Kovan/Nikau"];

export const updateNetworks = async (selectedNetwork, updateNetwork) => {
  const { ethereum }: any = window;
  switch (selectedNetwork) {
    default:
    case networks[0]:
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }],
      });
      updateNetwork(ethereum, "Mainnet");
      window.localStorage.setItem("ethereum-network", "Mainnet");
      break;
    case networks[1]:
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x3" }],
      });
      updateNetwork(ethereum, "Ropsten");
      window.localStorage.setItem("ethereum-network", "Ropsten");
      break;
    case networks[2]:
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2a" }],
      });
      updateNetwork(ethereum, "Kovan");
      window.localStorage.setItem("ethereum-network", "Kovan");
      break;
  }
};
