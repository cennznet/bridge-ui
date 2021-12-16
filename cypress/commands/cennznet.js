const {
  CENNZnetWindow,
  setupLocal,
  localWindow,
  switchToCENNZnetWindow,
  switchToCENNZnetNotification,
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

    await CENNZnetWindow().waitForTimeout(1000);

    await module.exports.click("button.NextStepButton-sc-26dpu8-0");

    return true;
  },
  acceptAccess: async () => {
    await setupLocal();
    await localWindow().waitForSelector('[data-testid="metamask-button"]');
    await module.exports.click(
      '[data-testid="cennznet-button"]',
      localWindow()
    );

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
  type: async (selector, value, page = CENNZnetWindow()) => {
    const element = await page.$(selector);
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

    return true;
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

    return true;
  },
  selectAccount: async () => {
    await localWindow().waitForSelector("button");
    await module.exports.clickByText("button", localWindow(), "testing");
    await localWindow().waitForSelector("button");
    await module.exports.clickByText("button", localWindow(), "close");
    await module.exports.click(
      '[data-testid="metamask-button"]',
      localWindow()
    );
    await localWindow().waitForTimeout(1000);
    await module.exports.clickByText("button", localWindow(), "enter bridge");
    await localWindow().waitForSelector('[data-testid="token-picker"]');

    return true;
  },
  pickToken: async (symbol) => {
    let tokenPicker = await localWindow().$('[data-testid="token-picker"]');
    await tokenPicker.click();
    await localWindow().waitForSelector("li");
    let list = await localWindow().$$("li");
    for (const li of list) {
      let text = await localWindow().evaluate((li) => li.textContent, li);
      if (text === symbol) {
        await li.click();
        break;
      }
    }

    return true;
  },
  pickAccountAndDeposit: async () => {
    let cennzAccountPicker = await localWindow().$("#cennznet-account-picker");
    await cennzAccountPicker.type("T");
    await localWindow().keyboard.press("ArrowDown");
    await localWindow().keyboard.press("Enter");

    await localWindow().waitForSelector('[data-testid="deposit-button"]');
    let button = await localWindow().$('[data-testid="deposit-button"]');
    await localWindow().waitForTimeout(3000);
    await button.click();

    return true;
  },
  depositETH: async (amount) => {
    await module.exports.pickToken("ETH");
    await module.exports.type("#token-amount", amount, localWindow());
    await localWindow().waitForTimeout(500);
    await module.exports.pickAccountAndDeposit();

    return true;
  },
  depositDAI: async (amount) => {
    await module.exports.click('[data-testid="network-button"]', localWindow());
    await module.exports.clickByText("button", localWindow(), "kovan/nikau");
    await localWindow().waitForTimeout(1000);
    await localWindow().waitForSelector('[data-testid="token-picker"]');
    await module.exports.pickToken("DAI");
    await module.exports.type("#token-amount", amount, localWindow());
    await localWindow().waitForTimeout(500);
    await module.exports.pickAccountAndDeposit();

    return true;
  },
  confirmDeposit: async () => {
    await localWindow().waitForSelector('[data-testid="tx-close-button"]');
    let closeButton = await localWindow().$('[data-testid="tx-close-button"]');
    await closeButton.click();

    return true;
  },
  checkTokenBalance: async (symbol) => {
    let tokenBalance;
    const walletButton = await localWindow().$(
      '[data-testid="cennznet-wallet-button"]'
    );
    await walletButton.click();

    let pageContent = await localWindow().content();
    if (pageContent.includes(`${symbol} Balance`)) {
      await localWindow().waitForSelector(`[data-testid="${symbol}-balance"]`);
      const balanceDiv = await localWindow().$(
        `[data-testid="${symbol}-balance"]`
      );
      const tokenBalanceString = await localWindow().evaluate(
        (balanceDiv) => balanceDiv.textContent,
        balanceDiv
      );
      tokenBalance = tokenBalanceString.split(":")[1];
    } else {
      tokenBalance = "0";
    }

    const closeButton = await localWindow().$(
      '[data-testid="wallet-close-button"]'
    );
    await closeButton.click();

    return tokenBalance;
  },
  testAmountWarning: async () => {
    await module.exports.click('[data-testid="network-button"]', localWindow());
    await module.exports.clickByText("button", localWindow(), "kovan/nikau");
    await localWindow().waitForTimeout(1000);
    await localWindow().waitForSelector('[data-testid="token-picker"]');
    await module.exports.pickToken("ETH");
    await module.exports.type("#token-amount", "1000", localWindow());
    await localWindow().waitForTimeout(3000);

    let pageContent = await localWindow().content();
    return Boolean(pageContent.includes("Account balance too low"));
  },
  withdrawToken: async ({ tokenSymbol, amount }) => {
    await module.exports.clickByText("button", localWindow(), "withdraw");
    await localWindow().waitForSelector('[data-testid="token-picker"]');
    await module.exports.pickToken(tokenSymbol);
    await module.exports.type("#token-amount", amount, localWindow());

    await localWindow().waitForSelector('[data-testid="withdraw-button"]');
    let withdrawButton = await localWindow().$(
      '[data-testid="withdraw-button"]'
    );
    await localWindow().waitForTimeout(3000);
    await withdrawButton.click();

    return true;
  },
  signWithdrawal: async () => {
    const popup = await switchToCENNZnetNotification();

    await module.exports.type("input", "Tester@1234", popup);

    await popup.waitForTimeout(500);
    debugger;
    await module.exports.click("button", popup);
  },
};
