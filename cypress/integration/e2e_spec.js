describe("e2e", () => {
  it(`should setup metamask using private key`, () => {
    cy.setupMetamask(
      "c4ddfbf9541226e000c64e6d21ec2aa92c08aa6d75d099b6f5978dbc9874efb7",
      "kovan",
      "Tester@1234"
    ).then((setupFinished) => {
      expect(setupFinished).to.be.true;
    });
  });
  it("should setup CENNZnet extension", () => {
    cy.visit(
      "chrome-extension://feckpephlmdcjnpoclagmaogngeffafk/index.html#/"
    );
  });
  it(`should accept connection request to metamask`, () => {
    cy.visit("/");
    cy.get("[id='metamask-button']").click();
    cy.acceptMetamaskAccess().then((connected) => {
      expect(connected).to.be.true;
    });

    cy.get("[id='metamask-button']").should("contain", "METAMASK");
    cy.get("[id='metamask-button']").should("contain", "...");
  });
  it("should accept connection request to CENNZnet", () => {
    cy.get("[id='cennznet-button']").click({ force: true });

    cy.pause();
  });
});

export {};
