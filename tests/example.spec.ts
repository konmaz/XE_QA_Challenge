import { test, expect } from '@playwright/test';
const AREA = 'Παγκράτι';

const PriceMin = '200';
const PriceMax = '700';

const SquareFootageMin = '75';
const SquareFootageMax = '150';

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

  for (let i = 0; i < buttonCount; i++) {
    const button = dropdownButtons.nth(i);
    await expect(button).toBeEnabled();
    await button.click();

    await inputField.click();
    await inputField.fill(AREA);
  }

  await page.getByTestId('submit-input').click();
  // Set a price range
  await page.getByTestId('price-filter-button').click();
  await page.getByTestId('minimum_price_input').click();
  await page.getByTestId('minimum_price_input').fill(PriceMin);
  await page.getByTestId('maximum_price_input').click();
  await page.getByTestId('maximum_price_input').fill(PriceMax);
  await page.getByTestId('maximum_price_input').press('Enter');

  // Set a square footage range
  await page.getByTestId('size-filter-button').click();
  await page.getByTestId('minimum_size_input').click();
  await page.getByTestId('minimum_size_input').fill(SquareFootageMin);
  await page.getByTestId('maximum_size_input').click();
  await page.getByTestId('maximum_size_input').fill(SquareFootageMax);
  await page.getByTestId('maximum_size_input').press('Enter');

  // main task:For each listing
  // Check if it is in range of the specified Price and SquareFootage
  // Check if listing has fewer than 30 images

  // for each page
  // each listing is inside a div
  // when a listing is clicked it shows a pop-up
  // there are two kinds of pop-ups
  //  1. one a simpler one that has all the listing info we need
  //  2. and the other one is for the Πολλαπλές αγγελίες this one is for listing from different vendors.
  //     For each vendor we open the popup and we see a type 1 listing, and then we extract the info we want
  //     1. price / square footage and 2. the number of photos < 30

  // for page in pages
  //    for listing in listings
  //      click on listing
  //      if listing.type == multiple listings
  //         for each sublisting check
  //                regular_check_listing()
  //      else
  //         regular_check_listing()

  //regular_check_listing
  // price and square footage and the number of photos < 30
  // check phone number optionally




  // square footage is at the data-testid = property-ad-title, but it is in a weird format  `Διαμέρισμα 76 τ.μ.` so regex is needed to extract the price and compare it
  // price is at the data-testid = property-ad-price


  // each listing image is inside a slick-slide so I guess we need to make sure that slick-slide count < 30


});
