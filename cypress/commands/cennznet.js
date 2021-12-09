const {
  CENNZnetWindow,
  setupLocal,
  localWindow,
  switchToCENNZnetWindow,
} = require("./puppeteer");

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
  acceptAccess: async () => {
    await setupLocal();
    await localWindow().waitForSelector("#metamask-button");
    await module.exports.click("#cennznet-button", localWindow());

    await switchToCENNZnetWindow();
    await CENNZnetWindow().waitForSelector("button");
    await module.exports.click("button");
    await localWindow().bringToFront();
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
  getElements: async (selector, page = CENNZnetWindow()) => {
    const elements = await page.$$(selector);
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
  clickByText: async (selector, page, string) => {
    const elements = await module.exports.getElements(selector, page);
    for (const el of elements) {
      const text = await page.evaluate((el) => el.textContent, el);
      if (text.toLowerCase().includes(string)) {
        await el.click();
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
  selectAccount: async () => {
    await localWindow().waitForSelector("button");
    await module.exports.clickByText("button", localWindow(), "testing");
    await localWindow().waitForTimeout(300);
    await module.exports.clickByText("button", localWindow(), "close");
    await module.exports.click("#metamask-button", localWindow());
    await localWindow().waitForTimeout(1000);
    await module.exports.clickByText("button", localWindow(), "enter bridge");

    return true;
  },
};
