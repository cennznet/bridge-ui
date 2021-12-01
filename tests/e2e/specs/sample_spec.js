describe("My First Test", () => {
  it(`should setup metamask using private key`, () => {
    cy.setupMetamask(Cypress.env("PRIVATE_KEY"), "kovan", "Tester@1234").then(
      (setupFinished) => {
        expect(setupFinished).to.be.true;
      }
    );
  });
  it(`should accept connection request to metamask`, () => {
    cy.visit("/");
    cy.contains("CONNECT METAMASK WALLET").click();
    cy.acceptMetamaskAccess().then((connected) => {
      expect(connected).to.be.true;
    });
  });
});
