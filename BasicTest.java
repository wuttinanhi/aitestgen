import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Duration;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.junit.jupiter.api.Assertions;

public class BasicTest {
    WebDriver driver;

    @BeforeEach
    public void setup() {
        driver = new ChromeDriver();
    }


    @AfterEach
    public void teardown() {
        driver.quit();
    }
@Test
    public void SimpleTest() {
        driver = new ChromeDriver();
browser.get("https://www.selenium.dev/selenium/web/web-form.html");

WebElement textInput = browser.findElement(By.cssSelector("#my-text-id"));
WebElement submitButton = browser.findElement(By.cssSelector(".btn"));
textInput.sendKeys("hello");
submitButton.click();
new WebDriverWait(driver, Duration.ofSeconds(10)).until(
webDriver -> ((JavascriptExecutor) webDriver).executeScript("return document.readyState").equals("complete")
);



WebElement successMessage = browser.findElement(By.cssSelector("#message"));
String successMessage_text = successMessage.getText();
assertEquals("Received!", successMessage_text);

browser.quit();

    }
}