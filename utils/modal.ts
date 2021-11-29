function defineTxModal(state: string, data: any, setModalOpen: Function) {
  setModalOpen(true);
  const modal = {
    state,
    text: "",
    data,
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
    default:
      modal.text = "WHOOPS! PLEASE TRY AGAIN";
      break;
  }

  return modal;
}

export { defineTxModal };
