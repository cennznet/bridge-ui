function defineModal(state: string, hash: string, setModalOpen: Function) {
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

export { defineModal };
