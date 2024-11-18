import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Duration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

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
    driver.get("https://www.selenium.dev/selenium/web/web-form.html");

    WebElement textInput = driver.findElement(By.cssSelector("#my-text-id"));

    WebElement submitButton = driver.findElement(By.cssSelector(".btn"));

    textInput.sendKeys("hello");

    submitButton.click();

    new WebDriverWait(driver, Duration.ofSeconds(10)).until(webDriver -> ((JavascriptExecutor) webDriver).executeScript("return document.readyState").equals("complete"));

    WebElement successMessage = driver.findElement(By.cssSelector("#message"));
    String textsuccessMessage = successMessage.getText();
    assertEquals("Received!", textsuccessMessage);

    driver.quit();
  }
}
