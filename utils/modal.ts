function defineTxModal(state: string, hash: string, setModalOpen: Function) {
  setModalOpen(true);
  const modal = {
    state: state,
    text: "",
    hash: hash,
  };
  switch (state) {
    case "approve":
      modal.text = "Approving your transaction...";
      break;
    case "deposit":
      modal.text = "Depositing your tokens...";
      break;
    case "relayer":
      modal.text = "Your tokens will appear on CENNZnet soon!";
      break;
    case "withdrawCENNZside":
      modal.text = "Burning your tokens for withdrawal from CENNZnet...";
      break;
    case "withdrawETHside":
      modal.text = "Withdrawing your tokens...";
      break;
    case "finished":
      modal.text = "Done! You may now close this window";
      break;
    case "error":
      if (hash === "noTokenSelected") modal.text = "Please select a token";
      else modal.text = "Whoops! Please try again";
      break;
    default:
      modal.text = "Whoops! Please try again";
      break;
  }

  return modal;
}

function defineWeb3Modal(state: string, setModalOpen: Function) {
  setModalOpen(true);
  const modal = {
    state,
    text: "",
    subText: "",
  };
  switch (state) {
    case "noExtension":
      modal.text = "Please install the CENNZnet Wallet Extension";
      modal.subText = "Refresh this page after installing the extension";
      break;
    case "noAccounts":
      modal.text = "Your wallet currently has zero accounts";
      modal.subText = "Please create an account in the wallet extension";
      break;
    case "selectAccount":
      modal.text = "Please select a CENNZnet account";
      break;
    case "showWallet":
      modal.text = "CENNZnet Wallet";
      break;
    default:
      modal.text = "Whoops! Please try again";
      break;
  }

  return modal;
}

export { defineTxModal, defineWeb3Modal };
