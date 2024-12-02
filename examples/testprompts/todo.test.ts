import puppeteer, { Browser, Frame, Page } from "puppeteer";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("Todo Website Test", () => {
  let browser: Browser;

  beforeEach(async () => {
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
    });
  });

  afterEach(async () => {
    await browser.close();
  });
  it("Should add a todo", async () => {
    let page = await browser.newPage();

    await page.goto("https://microsoftedge.github.io/Demos/demo-to-do/");

    const newTaskInput = await page.waitForSelector(`#new-task`);
    const addTaskButton = await page.waitForSelector(`input:nth-child(3)`);
    const taskList = await page.waitForSelector(`#tasks`);
    await newTaskInput!.type("Cook Dinner");
    await addTaskButton!.click();

    const addedTodo = await page.waitForSelector(`.task > label`);
    const addedTodoText = await page.waitForSelector(`.text`);

    var addedTodoTextText = await addedTodoText!.evaluate((e) => e.textContent);
    expect(addedTodoTextText).toBe("Cook Dinner");
  });
});
