import 'dotenv/config'
import { test, type Locator, type Page } from '@playwright/test'
import * as OTPAuth from 'otpauth'

test('Auto-clockin', async ({ page }) => {
  await authenticateWithGoogle(page)

  await navigateToClockinPage(page)

  while (await arePendingClockins(page)) {
    await completeNextPendingClockin(page)
    await waitUntilTheCurrentPopupIsClosed(page)
  }
})

async function authenticateWithGoogle (page: Page): Promise<void> {
  await page.goto('https://app.factorialhr.com/dashboard')
  await page.getByTitle('Google').click()

  await page.getByRole('textbox', { name: 'Email' }).click()
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.GOOGLE_EMAIL ?? '')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByLabel('Enter your password').click()
  await page.getByLabel('Enter your password').fill(process.env.GOOGLE_PASSWORD ?? '')
  await page.getByRole('button', { name: 'Next' }).click()

  while (!(await waitForALocatorToBeVisible(page.getByText('Get a verification code from the Google Authenticator app'), 5000))) {
    if (await page.getByRole('button', { name: 'Try another way' }).isVisible()) {
      await page.getByRole('button', { name: 'Try another way' }).click()
    }
  }

  await page.getByText('Get a verification code from the Google Authenticator app').click()

  const otp = await getOTP()
  await page.getByLabel('Enter code').fill(otp)
  await page.getByRole('button', { name: 'Next' }).click()
}

async function navigateToClockinPage (page: Page): Promise<void> {
  await page.getByText('Immfly Group').isVisible({ timeout: 10000 })
  await page.getByText('Immfly Group').click()
  await page.getByText('Fichaje').click()
  await page.getByRole('button', { name: 'Expandir todo' }).click()
}

async function arePendingClockins (page: Page): Promise<boolean> {
  return await page.getByTitle('-8h 07m').first().isVisible({ timeout: 5000 })
}

async function completeNextPendingClockin (page: Page): Promise<void> {
  await page.locator('//span[text()="-8h 07m"]/ancestor::tr/following-sibling::*').getByRole('button', { name: 'Añadir' }).first().click()
  await page.locator('//*[@data-radix-popper-content-wrapper]//input[@placeholder=\'--:--\']').first().click()
  await page.locator('//*[@data-radix-popper-content-wrapper]//input[@placeholder=\'--:--\']').first().fill('09:00')
  await page.locator('//*[@data-radix-popper-content-wrapper]//input[@placeholder=\'--:--\']').nth(1).click()
  await page.locator('//*[@data-radix-popper-content-wrapper]//input[@placeholder=\'--:--\']').nth(1).fill('17:07')
  await page.locator('//*[@data-radix-popper-content-wrapper]//select').selectOption({ label: 'Casa' })
  await page.locator('//*[@data-radix-popper-content-wrapper]//button/span[text() = \'Aplicar\']').click()
}

async function waitUntilTheCurrentPopupIsClosed (page: Page): Promise<void> {
  await waitForALocatorToBeHidden(page.locator('//*[@data-radix-popper-content-wrapper]//input[@placeholder=\'--:--\']'), 5000)
}

async function getOTP (): Promise<string> {
  const totp = new OTPAuth.TOTP({
    issuer: 'ACME',
    label: 'AzureDiamond',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: process.env.GOOGLE_OTP_SECRET ?? ''
  })

  const token = totp.generate()
  return token
}

async function waitForALocatorToBeVisible (locator: Locator, timeout: number): Promise<boolean> {
  const timeInterval = 1000
  let remaningTime = timeout
  while (!(await locator.isVisible()) && remaningTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, timeInterval))
    remaningTime -= timeInterval
  }
  return await locator.isVisible()
}

async function waitForALocatorToBeHidden (locator: Locator, timeout: number): Promise<boolean> {
  const timeInterval = 1000
  let remaningTime = timeout
  while (await locator.count() > 0 && remaningTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, timeInterval))
    remaningTime -= timeInterval
  }
  return !(await locator.isVisible())
}