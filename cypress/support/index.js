import "./commands";
import { configure } from "@testing-library/cypress";
import { WsProvider } from "@polkadot/api";
import { web3Enable } from "@polkadot/extension-dapp";
import { injectExtension } from "@polkadot/extension-inject";

configure({ testIdAttribute: "data-testid" });

// dont fail tests on uncaught exceptions of websites
Cypress.on("uncaught:exception", () => {
  if (!process.env.FAIL_ON_ERROR) {
    return false;
  }
});

Cypress.on("window:before:load", (win) => {
  win.injectedWeb3 = {
    "polkadot-js": {
      name: "polkadot-js",
      version: "0.37.3-12",
      provider: new WsProvider("wss://nikau.centrality.me/public/ws"),
      enable: web3Enable,
    },
  };
  win.injectedWeb3["polkadot-js"].enable("Bridge");

  cy.stub(win.console, "error").callsFake((message) => {
    cy.now("task", "error", message);
    // fail test on browser console error
    if (process.env.FAIL_ON_ERROR) {
      throw new Error(message);
    }
  });

  cy.stub(win.console, "warn").callsFake((message) => {
    cy.now("task", "warn", message);
  });
});

before(() => {
  if (!Cypress.env("SKIP_METAMASK_SETUP")) {
    cy.setupMetamask();
  }
});
