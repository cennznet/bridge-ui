describe("e2e", () => {
  it("should setup metamask using private key", () => {
    cy.setupMetamask(
      "c4ddfbf9541226e000c64e6d21ec2aa92c08aa6d75d099b6f5978dbc9874efb7",
      "kovan",
      "Tester@1234"
    ).then((setupFinished) => {
      expect(setupFinished).to.be.true;
    });
  });
  it("should accept connection request to metamask", () => {
    cy.visit("/");
    cy.get("#metamask-button").click();
    cy.acceptMetamaskAccess().then((connected) => {
      expect(connected).to.be.true;
    });

    cy.get("#metamask-button").should("contain", "METAMASK");
    cy.get("#metamask-button").should("contain", "...");
  });
  it("should setup CENNZnet extension", () => {
    cy.switchToCENNZnetWindow();

    cy.setupCENNZnet().then((setupFinished) => {
      expect(setupFinished).to.be.true;
    });
  });
  it("should accept CENNZnet access", () => {
    cy.acceptCENNZnetAccess().then((accepted) => {
      expect(accepted).to.be.true;
    });
  });
  it("should select CENNZnet account and enter bridge", () => {
    cy.selectCENNZaccount().then((selected) => {
      expect(selected).to.be.true;
    });
  });
});
