function defineModal(state: string, hash: string, setModalOpen: Function) {
  setModalOpen(true);
  console.log("relayer state", state);
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
