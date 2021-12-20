describe("e2e", () => {
  it("should setup metamask using private key", () => {
    cy.setupMetamask(
      "c4ddfbf9541226e000c64e6d21ec2aa92c08aa6d75d099b6f5978dbc9874efb7",
      "kovan",
      "Tester@1234"
    ).then((setupFinished) => {
      expect(setupFinished).to.be.true;
    });

    cy.metamaskAddTokenDAI().then((added) => {
      expect(added).to.be.true;
    });
  });
  it("should accept connection request to metamask", () => {
    cy.visit("/");
    cy.get('[data-testid="metamask-button"]').click();
    cy.acceptMetamaskAccess().then((connected) => {
      expect(connected).to.be.true;
    });

    cy.get('[data-testid="metamask-button"]').should("contain", "METAMASK");
    cy.get('[data-testid="metamask-button"]').should("contain", "...");
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
  it("should deposit ETH", () => {
    const depositAmount = "0.5";
    let balance;

    return new Promise((resolve, reject) => {
      (async () => {
        balance = await cy.checkTokenBalance("ETH");
      })();
      cy.depositETH(depositAmount).then((depositSubmitted) => {
        expect(depositSubmitted).to.be.true;
      });

      cy.confirmMetamaskTransaction().then((confirmed) => {
        expect(confirmed).to.be.true;
      });

      cy.confirmCENNZnetTransaction().then((confirmed) => {
        expect(confirmed).to.be.true;
      });

      cy.wait(40000);

      cy.checkTokenBalance("ETH").then((newBalance) => {
        expect(Number(newBalance)).to.equal(
          Number(balance) + Number(depositAmount)
        );
        resolve();
      });
    });
  });
  it("should deposit DAI", () => {
    const depositAmount = "15";
    let balance;

    return new Promise((resolve, reject) => {
      (async () => {
        balance = await cy.checkTokenBalance("DAI");
      })();
      cy.depositDAI(depositAmount).then((depositSubmitted) => {
        expect(depositSubmitted).to.be.true;
      });

      cy.confirmMetamaskPermissionToSpend().then((confirmed) => {
        expect(confirmed).to.be.true;
      });

      cy.wait(40000);

      cy.confirmMetamaskTransaction().then((confirmed) => {
        expect(confirmed).to.be.true;
      });

      cy.confirmCENNZnetTransaction().then((confirmed) => {
        expect(confirmed).to.be.true;
      });

      cy.wait(40000);

      cy.checkTokenBalance("DAI").then((newBalance) => {
        expect(Number(newBalance)).to.equal(
          Number(balance) + Number(depositAmount)
        );
        resolve();
      });
    });
  });
  it("should warn user if token balance too low", () => {
    cy.CENNZnetTestAmountWarning("deposit").then((warning) => {
      expect(warning).to.be.true;
    });
  });
  it("should withdraw ETH", () => {
    const withdrawAmount = "0.5";
    let balance;

    return new Promise((resolve, reject) => {
      (async () => {
        balance = await cy.checkTokenBalance("ETH");
      })();

      cy.withdrawToken("ETH", withdrawAmount).then((withdrawSubmitted) => {
        expect(withdrawSubmitted).to.be.true;
      });

      cy.CENNZnetSignWithdrawal().then((signed) => {
        expect(signed).to.be.true;
      });

      cy.wait(20000);

      cy.confirmMetamaskTransaction().then((confirmed) => {
        expect(confirmed).to.be.true;
      });

      cy.confirmCENNZnetTransaction().then((confirmed) => {
        expect(confirmed).to.be.true;
      });

      cy.checkTokenBalance("ETH").then((newBalance) => {
        expect(Number(newBalance)).to.equal(
          Number(balance) - Number(withdrawAmount)
        );
        resolve();
      });
    });
  });
  it("should withdraw DAI", () => {
    const withdrawAmount = "15";
    let balance;

    return new Promise((resolve, reject) => {
      (async () => {
        balance = await cy.checkTokenBalance("DAI");
      })();

      cy.withdrawToken("DAI", withdrawAmount).then((withdrawSubmitted) => {
        expect(withdrawSubmitted).to.be.true;
      });

      cy.CENNZnetSignWithdrawal().then((signed) => {
        expect(signed).to.be.true;
      });

      cy.wait(20000);

      cy.confirmMetamaskTransaction().then((confirmed) => {
        expect(confirmed).to.be.true;
      });

      cy.confirmCENNZnetTransaction().then((confirmed) => {
        expect(confirmed).to.be.true;
      });

      cy.checkTokenBalance("DAI").then((newBalance) => {
        expect(Number(newBalance)).to.equal(
          Number(balance) - Number(withdrawAmount)
        );
        resolve();
      });
    });
  });
  it("should warn user if token balance too low", () => {
    cy.CENNZnetTestAmountWarning("withdraw").then((warning) => {
      expect(warning).to.be.true;
    });
  });
});
