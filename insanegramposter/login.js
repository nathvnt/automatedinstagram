const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());



function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

function getRandomFileFromFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  const randomIndex = Math.floor(Math.random() * files.length);
  return path.join(folderPath, files[randomIndex]);
}


async function login() {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' //chrome path might differ depending on system 
    });
    const page = await browser.newPage();

    let target = `https://www.instagram.com/accounts/login/`;
    await page.goto(target);

    await delay(3000);

    ///////////////////////////////////////////////
    //INPUT ACCOUNT CREDENTIALS FOR INSTAGRAM LOGIN
    ///////////////////////////////////////////////
    let pw = "password";
    let un = "email@emailprovider.cum";

    //xpath selectors
    const USERNAME_XPATH = "//input[@name='username' and contains(@aria-label, 'username, or email')]";
    const PASSWORD_XPATH = "//input[@name='password' and contains(@aria-label, 'Password')]";
    const LOGIN_BTN = "//button[@type='submit']";
    const NOT_NOW_BUTTON = "//div[@role='button' and contains(text(), 'Not Now')]"; 
    const NOT_NOW_BUTTON2 = "//button[contains(text(), 'Not Now')]"; 
    // const NEW_POST_BTN = "//svg[@aria-label='New post']/ancestor::a";
    // const CROP_IMAGE_BTN = "//svg[contains(@aria-label, 'Select crop')]";
    // const SELECT_PORTRAIT_CROP = "//svg[contains(@aria-label, 'Crop portrait icon')]";
    const NEXT_BTN = "//div[@role='button' and contains(text(), 'Next')]"; 
    const SHARE_BTN = "//div[@role='button' and contains(text(), 'Share')]"; 
    // const CLOSE_BTN = "//svg[contains(@aria-label, 'Close')]";


    // Typing in username
    await delay(3000);
    const [usernameField] = await page.$x(USERNAME_XPATH);
    if (usernameField) {
      await usernameField.type(un);
      console.log("ENTERED USERNAME");
    }

    // Typing in password
    await delay(3000);
    const [passwordField] = await page.$x(PASSWORD_XPATH);
    if (passwordField) {
      await passwordField.type(pw);
      console.log("ENTERED PW");
    }

    //clicking login button
    await delay(3000);
    const [loginBTN] = await page.$x(LOGIN_BTN);
    if (loginBTN) {
      await loginBTN.click();
      console.log("CLICKED LOGIN");
    }

    // Clicking the 'Not Now' button (avoid saving password)
    await delay(10000);
    const [notNowButton] = await page.$x(NOT_NOW_BUTTON);
    if (notNowButton) {
      await notNowButton.click();
      console.log("CLICKED NOT NOW 1");
    }

    //clicking second 'Now Now' button (avoid notifications settings)
    await delay(8000);
    const [notNowButton2] = await page.$x(NOT_NOW_BUTTON2);
    if (notNowButton2) {
      await notNowButton2.click();
      console.log("CLICKED NOT NOW 2");
    }

    await delay(8000);
    await page.evaluate(() => {
        let elements = document.querySelectorAll('svg[aria-label="New post"]');
        if (elements.length > 0) {
            elements[0].closest('a').click(); // Assuming the SVG is within an <a> tag
        }
    });

    // Select a random file from the 'mems' folder
    const folderPath = path.join(__dirname, 'mems'); // Adjust if your folder is elsewhere
    const filePath = getRandomFileFromFolder(folderPath);

    // Waiting for the file input to be available and uploading the file
    const fileInputSelector = 'input[type="file"]';
    await page.waitForSelector(fileInputSelector);
    const [fileChooser] = await page.$x('//input[@type="file"]');
    await fileChooser.uploadFile(filePath);

    //select crop image
    await delay(5000);
    await page.evaluate(() => {
      const selectCropButton = document.querySelector('svg[aria-label="Select crop"]');
      selectCropButton?.closest('button')?.click();
    });

    //select portrait crop
    await delay(5000);
    await page.evaluate(() => {
      const cropPortraitIcon = document.querySelector('svg[aria-label="Crop portrait icon"]');
      cropPortraitIcon?.closest('div[role="button"]')?.click();
    });

    //select next
    await delay(5000);
    const [next1] = await page.$x(NEXT_BTN);
    if (next1) {
      await next1.click();
      console.log("CLICKED FIRST NEXT STEP");
    }

     //select next
    await delay(5000);
    const [next2] = await page.$x(NEXT_BTN);
    if (next2) {
      await next2.click();
      console.log("CLICKED SECOND NEXT STEP");
    }

    //select Share
    await delay(5000);
    const [selectShare] = await page.$x(SHARE_BTN);
    if (selectShare) {
      await selectShare.click();
      console.log("CLICKED SHARE");
    }

    //select Close
    await delay(5000);
    await page.evaluate(() => {
      const closeButton = document.querySelector('svg[aria-label="Close"]');
      if (closeButton) {
        const buttonToClick = closeButton.closest('div[role="button"]');
        if (buttonToClick) {
            buttonToClick.click();
        }
      }
    });

    fs.unlinkSync(filePath);
    await delay(45000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

login();