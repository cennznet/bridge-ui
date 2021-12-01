const extensionLoader = require("cypress-browser-extension-plugin/loader");

module.exports = (on) => {
  on("before:browser:launch", extensionLoader.load("./cennznet-extension"));
};

// cypress/support/command.js
const addExtensionCommands = require("cypress-browser-extension-plugin/commands");
addExtensionCommands(Cypress);

// cypress/integration/my_spec.js or cypress/support/index.js
beforeEach(() => {
  cy.clearExtensionStorage("local");
});
