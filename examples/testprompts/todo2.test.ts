import puppeteer, { Browser } from "puppeteer";
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
  it("Should remove a todo", async () => {
    let page = await browser.newPage();

    await page.goto("https://microsoftedge.github.io/Demos/demo-to-do/");

    var newTaskInput = await page.waitForSelector(`#new-task`);
    var addTaskButton = await page.waitForSelector(`label`);
    var taskList = await page.waitForSelector(`#tasks`);
    var firstTask = await page.waitForSelector(`#tasks li`);
    await newTaskInput!.type("Cook Dinner");
    await addTaskButton!.click();

    taskList = await page.waitForSelector(`#tasks`);

    var taskListText = await taskList!.evaluate((e) => e.textContent);
    expect(taskListText).toBe("No tasks defined");

    await page.close();
  });
  it("Should add a todo", async () => {
    let page = await browser.newPage();

    await page.goto("https://microsoftedge.github.io/Demos/demo-to-do/");

    var newTaskInput = await page.waitForSelector(`#new-task`);
    var addTaskButton = await page.waitForSelector(`input:nth-child(3)`);
    var taskList = await page.waitForSelector(`#tasks`);
    await newTaskInput!.type("Cook Dinner");
    await addTaskButton!.click();

    var addedTodo = await page.waitForSelector(`.task > label`);
    var addedTodoText = await page.waitForSelector(`.text`);

    var addedTodoTextText = await addedTodoText!.evaluate((e) => e.textContent);
    expect(addedTodoTextText).toBe("Cook Dinner");
  });
});
