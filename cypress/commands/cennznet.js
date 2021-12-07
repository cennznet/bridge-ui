const { CENNZnetWindow } = require("./puppeteer");

module.exports = {
  setupCENNZnet: async () => {
    await module.exports.click("button");
    await module.exports.click("div.popupToggle");

    await module.exports.clickToCreateAccountPage();
    await CENNZnetWindow().waitForTimeout(300);

    await module.exports.click("input");
    await module.exports.click("button");

    await module.exports.fillAccountDetails();
    await module.exports.repeatPassword();

    await module.exports.click("button.NextStepButton-sc-26dpu8-0");

    return true;
  },
  click: async (selector) => {
    const element = await CENNZnetWindow().$(selector);
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
  clickToCreateAccountPage: async () => {
    const aDivs = await module.exports.getElements("a.Link-sc-61h66h-0");
    for (const a of aDivs) {
      const text = await CENNZnetWindow().evaluate((a) => a.textContent, a);
      if (text.toLowerCase().includes("create new account")) {
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
        await input.click({ clickCount: 3 });
        await input.type("Testing");
      } else if (text.toLowerCase().includes("a new password")) {
        await input.click({ clickCount: 3 });
        await input.type("Tester@1234");
      } else if (text.toLowerCase().includes("repeat password")) {
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
