import { test } from '@playwright/test'
import { getOTP } from '../src/otpGenerate'

test.setTimeout(60 * 60 * 1000)

test('Clockin', async ({ page }) => {
  await page.goto('https://app.factorialhr.com/dashboard')
  await page.getByTitle('Google').click()

  await page.getByRole('textbox', { name: 'Email' }).click()
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.GOOGLE_EMAIL ?? '')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByLabel('Enter your password').click()
  await page.getByLabel('Enter your password').fill(process.env.GOOGLE_PASSWORD ?? '')
  await page.getByRole('button', { name: 'Next' }).click()

  while (!(await page.getByText('Get a verification code from the Google Authenticator app').isVisible())) {
    await page.getByRole('button', { name: 'Try another way' }).click()
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  await page.getByText('Get a verification code from the Google Authenticator app').click()

  const otp = await getOTP()
  await page.getByLabel('Enter code').fill(otp)
  await page.getByRole('button', { name: 'Next' }).click()
  await new Promise((resolve) => setTimeout(resolve, 10000))

  while (!(await page.getByText('Immfly Group').isVisible())) {
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  await page.getByText('Immfly Group').click()
  await page.getByText('Fichaje').click()

  await page.getByRole('button', { name: 'Expandir todo' }).click()

  await page.getByTitle('-8h 07m').isVisible()

  await page.locator('//span[text()="-8h 07m"]/ancestor::tr/following-sibling::*').getByRole('button', { name: 'Añadir' }).click()
  await new Promise((resolve) => setTimeout(resolve, 5000))
})

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/')

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click()

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible()
// })

// import { getOTP } from '../../common/utilities/totpGenerator';

// test("should allow user to login through google social login", async ({page}) => {
//      page.goto("your application url which embeds gmail sign-in");
//      await page.getByRole("button", { name: "Google logo Sign in with"}).click();
//      // Handle Google Authentication Popup
//      const popup = await page.waitForEvent("popup");
//      await popup.waitForSelector("#identifierId");
//      await popup.getByLabel("Email or Phone").fill("letzdotesting@gmail.com");
//      await popup.getByRole("button", { name: "Next" }).click();
//      await popup.getByLabel("Enter your password").fill("Password123");
//      await popup.getByLabel("Enter your password").press("Enter");
//      // OTP value is returned from getOTP method in totpGenerator.ts file
//      const otp = await getOTP();
//      await popup.getByLabel("Enter code").fill(otp);
//      await popup.getByLabel("Enter code").press("Enter");
//      await popup.getByRole("button", { name: "Continue" }).click();
//      // Validate profile page
//      await expect(page).toHaveURL(/\/profile/);
//    });
