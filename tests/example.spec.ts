import { test, expect } from '@playwright/test';
const AREA = 'Παγκράτι';

test('ΧΕ-QA', async ({ page }) => {
  await page.goto('https://www.xe.gr/property');

  // Cookies banner
  await page.getByRole('button', { name: 'ΣΥΜΦΩΝΩ', exact: true }).click();

  await expect(page.getByTestId('property-transaction-name')).toHaveText('Ενοικίαση');
  await expect(page.getByTestId('property-type-name')).toHaveText('Κατοικία');


  const inputField = page.getByTestId('area-input');

  const dropdownPanel = page.getByTestId('geo_place_id_dropdown_panel');
  const dropdownButtons = dropdownPanel.locator('button');

  await inputField.click();
  await inputField.fill(AREA);

  await dropdownPanel.waitFor();

  const buttonCount = await dropdownButtons.count();
  console.log("count of buttons: " + buttonCount);

  for (let i = 0; i < buttonCount; i++) {
    const button = dropdownButtons.nth(i);
    await expect(button).toBeEnabled();
    await button.click();

    // await page.waitForTimeout(500);

    await inputField.click();
    await inputField.fill(AREA);
  }
});
