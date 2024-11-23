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
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;

public class CLASS_NAME_HERE {
    WebDriver driver;

    @BeforeEach
    public void setup() {
        driver = new ChromeDriver();
    }


    @AfterEach
    public void teardown() {
        driver.quit();
    }

    // --- START TESTCASE ---
    @Test
    public void TESTCASE_NAME() {
        // {{TESTCASE_GENERATED_CODE}}
    }
    // --- END TESTCASE ---

    // {{TESTCASES}}
}
