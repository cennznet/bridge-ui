function defineTxModal(state: string, hash: string, setModalOpen: Function) {
  setModalOpen(true);
  const modal = {
    state: state,
    text: "",
    hash: hash,
  };
  switch (state) {
    case "approve":
      modal.text = "APPROVING YOUR TRANSACTION...";
      break;
    case "deposit":
      modal.text = "DEPOSITING YOUR TOKENS...";
      break;
    case "relayer":
      modal.text = "YOUR TOKENS WILL APPEAR ON CENNZnet SOON!";
      break;
    case "withdrawCENNZside":
      modal.text =
        "CLAIMING YOUR TOKENS FOR WITHDRAWAL FROM CENNZnet. PLEASE STAY ON THIS PAGE";
      break;
    case "withdrawETHside":
      modal.text = "WITHDRAWING YOUR TOKENS...";
      break;
    case "finished":
      modal.text = "DONE! YOU MAY NOW CLOSE THIS WINDOW.";
      break;
    case "bridgePaused":
      modal.text =
        "TOKEN BRIDGE IS PAUSED FOR MAINTENANCE. PLEASE TRY AGAIN LATER.";
      break;
    case "error":
      modal.text = "WHOOPS! PLEASE TRY AGAIN";
      break;
    default:
      modal.text = "WHOOPS! PLEASE TRY AGAIN";
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
