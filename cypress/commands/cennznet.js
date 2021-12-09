const {
  CENNZnetWindow,
  puppeteerBrowser,
  switchToCENNZnetNotification,
} = require("./puppeteer");
const { acceptAccess } = require("./metamask");

module.exports = {
  setupCENNZnet: async () => {
    await module.exports.click("button");
    await module.exports.click("div.popupToggle");

    await module.exports.clickToImportAccountPage();
    await CENNZnetWindow().waitForTimeout(300);

    await module.exports.type(
      "textarea",
      "raccoon green tooth pact expire crime knee metal border sport myself pelican"
    );
    await CENNZnetWindow().waitForTimeout(1000);
    await module.exports.click("button");

    await module.exports.fillAccountDetails();
    await module.exports.repeatPassword();

    await module.exports.click("button.NextStepButton-sc-26dpu8-0");

    return true;
  },
  click: async (selector, page = CENNZnetWindow()) => {
    const element = await page.$(selector);
    element.evaluate((el) => el.click());
  },
  type: async (selector, value) => {
    const element = await CENNZnetWindow().$(selector);
    element.type(value);
  },
  getElements: async (selector) => {
    const elements = await CENNZnetWindow().$$(selector);
    return elements;
  },
  clickToImportAccountPage: async () => {
    const aDivs = await module.exports.getElements("a.Link-sc-61h66h-0");
    for (const a of aDivs) {
      const text = await CENNZnetWindow().evaluate((a) => a.textContent, a);
      if (text.toLowerCase().includes("import account")) {
        await a.click();
        break;
      }
    }
  },
  fillAccountDetails: async () => {
    const inputDivs = await module.exports.getElements(
      "div.Label-sc-1m5io7b-0"
    );
    for (const div of inputDivs) {
      const text = await CENNZnetWindow().evaluate(
        (div) => div.textContent,
        div
      );
      const input = await div.$("input");
      if (text.toLowerCase().includes("a descriptive name")) {
        await input.type("Testing");
      } else if (text.toLowerCase().includes("a new password")) {
        await input.type("Tester@1234");
      }
    }
  },
  repeatPassword: async () => {
    const inputDivs = await module.exports.getElements(
      "div.Label-sc-1m5io7b-0"
    );
    for (const div of inputDivs) {
      const text = await CENNZnetWindow().evaluate(
        (div) => div.textContent,
        div
      );
      const input = await div.$("input");
      if (text.toLowerCase().includes("repeat password")) {
        await input.type("Tester@1234");
      }
    }
  },
};
