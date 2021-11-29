import { ethers } from "ethers";

const ETH = "0x0000000000000000000000000000000000000000";
const minABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];

export const getMetamaskBalance = async (ethereum, tokenAddress, account) => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  let balance;

  if (tokenAddress === ETH) {
    balance = await provider.getBalance(account);
  } else {
    const token: ethers.Contract = new ethers.Contract(
      tokenAddress,
      minABI,
      signer
    );

    balance = await token.balanceOf(account);
  }

  return Number(ethers.utils.formatEther(balance));
};
