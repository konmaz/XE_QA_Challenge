import {test, expect, Locator, Page} from '@playwright/test';
const AREA = 'Παγκράτι';


const PriceMin = 200;
const PriceMax = 700;

const SquareFootageMin = 75;
const SquareFootageMax = 150;

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
  await page.getByTestId('minimum_price_input').fill(String(PriceMin));
  await page.getByTestId('maximum_price_input').click();
  await page.getByTestId('maximum_price_input').fill(String(PriceMax));
  await page.getByTestId('maximum_price_input').press('Enter');

  // Set a square footage range
  await page.getByTestId('size-filter-button').click();
  await page.getByTestId('minimum_size_input').click();
  await page.getByTestId('minimum_size_input').fill(String(SquareFootageMin));
  await page.getByTestId('maximum_size_input').click();
  await page.getByTestId('maximum_size_input').fill(String(SquareFootageMax));
  await page.getByTestId('maximum_size_input').press('Enter');

  console.log(page.url())

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

async function extracted_Urls(elements: Array<Locator>) {
  const urls = new Set<string>();
  for (const element of elements) {
    const href = await element.getAttribute('href');
    if (href) {
      urls.add('https://www.xe.gr' + href);
    }
  }
  return urls;
}
async function assertNumber(page: Page, locator:string, numberMin : number, numberMax: number) {

  const Element = await page.locator(locator);
  await expect(Element).toBeVisible()
  const Text = await Element.textContent();
  const Match = Text.match(/\b\d+\b/g);
  const number = Match ? parseInt(Match[0]) : null;

  if (number != null) {

    expect(number).toBeGreaterThanOrEqual(numberMin);
    expect(number).toBeLessThanOrEqual(numberMax);

    console.log(`Assertion passed: ${number} is within the range.`);
  } else {
    // Throw an error Playwright can catch
    throw new Error(`No number for ${locator} this found.`);
  }
}
async function assertSquareFootage(page) {

  const squareFootageElement = await page.locator('[data-testid="basic-info"] .title h1');
  await expect(squareFootageElement).toBeVisible()
  const squareFootageText = await squareFootageElement.textContent();
  const squareFootageMatch = squareFootageText.match(/\b\d+(?=\s*τ\.μ\.)/);
  const squareFootage = squareFootageMatch ? parseInt(squareFootageMatch[0], 10) : null;

  if (squareFootage != null) {

    expect(squareFootage).toBeGreaterThanOrEqual(SquareFootageMax);
    expect(squareFootage).toBeLessThanOrEqual(SquareFootageMax);

    console.log(`Assertion passed: The square footage ${squareFootage} is within the range.`);
  } else {
    // Throw an error Playwright can catch
    throw new Error("No square footage found in the text.");
  }
}

test('2', async ({page}) => {
  await page.goto('https://www.xe.gr/property/results?transaction_name=rent&item_type=re_residence&geo_place_ids%5B%5D=ChIJy1stSUK9oRQRi9ObJcOmO20&geo_place_ids%5B%5D=ChIJcyLG2JZ1YBMRlfY6uga4eQk&geo_place_ids%5B%5D=EjLOoM6xzrPOus-BzrHPhM6vzr_PhSwgzpXPjc6_z4POvM6_z4IsIM6VzrvOu86szrTOsSIuKiwKFAoSCVeywIjmOagUETmG_DOKdLOvEhQKEgmXm0ei_jmoFBGApLniLL0ABA&geo_place_ids%5B%5D=ChIJcRjeopKHWxMRiC8Bbj-rL20&geo_place_ids%5B%5D=EjDOoM6xzrPOus-BzrHPhM6vzr_PhSwgzprOv862zqzOvc63LCDOlc67zrvOrM60zrEiLiosChQKEglJUXaNDNJZExFbS81X5XsGfhIUChIJRzc-jW3SWRMR3dkNbk2r7EI&minimum_price=200&maximum_price=700&minimum_size=75&maximum_size=150');
  await page.getByRole('button', { name: 'ΣΥΜΦΩΝΩ', exact: true }).click();

  let lazyLoadWrappers = await page.locator('.lazyload-wrapper').all();

  for (let i = 0; i < lazyLoadWrappers.length; i++) {
    lazyLoadWrappers = await page.locator('.lazyload-wrapper').all();
    await lazyLoadWrappers[i].scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
  }

  // for page in pages
  // for listing in listings

  // Get all elements
  const elements = await page.getByTestId('property-ad-url').all();

  // Extract unique URLs
  const urls = await extracted_Urls(elements);

  console.log('Unique URLs found:', urls.size);

  // Visit each unique URL
  for (const url of Array.from(urls)) {
    console.log('Visiting:', url);
    await page.goto(url);

    const modalTitle = await page.getByTestId('xe-modal-title').textContent();
    if (modalTitle.includes('Αγγελίες για αυτό το ακίνητο')){ // multiple ads
      const sub_elements = await page.getByTestId('unique-ad-url').all();
      const sub_urls = await extracted_Urls(sub_elements);

      for (const sub_url of Array.from(sub_urls)){
        await page.goto(sub_url);



        const priceElement = await page.locator('[data-testid="basic-info"] .price h2');
        const priceText = await priceElement.textContent();
        const priceMatch = priceText.match(/(\d+)\s*€/);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/\D/g, ''), 10) : null;


        assertSquareFootage(page);
        assertNumber(page,'',SquareFootageMin, SquareFootageMax)
        assertNumber(page,'',SquareFootageMin, SquareFootageMax)

        await page.goBack();
      }

    }else {

      const info = await page.getByTestId('basic-info').textContent();
      console.log('Basic Info:', info);
    }

    await page.goBack();
  }

  // await expect(page.getByTestId('xe-modal-title')).toContainText('Αγγελίες για αυτό το ακίνητο');



})

test('3', async ({page}) => {
  await page.goto('https://www.xe.gr/property/results?transaction_name=rent&item_type=re_residence&geo_place_ids%5B%5D=ChIJy1stSUK9oRQRi9ObJcOmO20&geo_place_ids%5B%5D=ChIJcyLG2JZ1YBMRlfY6uga4eQk&geo_place_ids%5B%5D=EjLOoM6xzrPOus-BzrHPhM6vzr_PhSwgzpXPjc6_z4POvM6_z4IsIM6VzrvOu86szrTOsSIuKiwKFAoSCVeywIjmOagUETmG_DOKdLOvEhQKEgmXm0ei_jmoFBGApLniLL0ABA&geo_place_ids%5B%5D=ChIJcRjeopKHWxMRiC8Bbj-rL20&geo_place_ids%5B%5D=EjDOoM6xzrPOus-BzrHPhM6vzr_PhSwgzprOv862zqzOvc63LCDOlc67zrvOrM60zrEiLiosChQKEglJUXaNDNJZExFbS81X5XsGfhIUChIJRzc-jW3SWRMR3dkNbk2r7EI&minimum_price=200&maximum_price=700&minimum_size=75&maximum_size=150');
  await page.getByRole('button', { name: 'ΣΥΜΦΩΝΩ', exact: true }).click();

  // Get all lazyload-wrapper elements

  let lazyLoadWrappers = await page.locator('.lazyload-wrapper').all();

  for (let i = 12; i < lazyLoadWrappers.length; i++) {
    lazyLoadWrappers = await page.locator('.lazyload-wrapper').all();
    const wrapper = lazyLoadWrappers[i];
    await wrapper.scrollIntoViewIfNeeded();

    const hasSaveSearchWidget = await wrapper.locator('[data-testid="save-search-widget"]').count() > 0; // it is not a add but a text e.g Θες να ενημερώνεσαι πρώτος για νέα ακίνητα;
    if(hasSaveSearchWidget) continue; // skip that

    // Wait for the `property-ad-url` to appear in this wrapper
    await wrapper.locator('[data-testid="property-ad-url"]').nth(0).waitFor({ state: 'attached', timeout: 30_000 });

    // Open modal
    await wrapper.locator('[data-testid="property-ad-url"]').first().click();

    let modalTitle = await page.getByTestId('xe-modal-title').textContent();

    while (modalTitle.includes('Loading...')) {

      await page.waitForTimeout(500);
      modalTitle = await page.getByTestId('xe-modal-title').textContent();
    }


    console.log(i)
    console.log('Modal title:', modalTitle);


    await page.waitForTimeout(2000);

    await page.waitForSelector('[data-testid="xe-modal-close"]');
    await page.locator('[data-testid="xe-modal-close"]').click();

    await page.waitForTimeout(500);
  }

  console.log('All ads processed.');
})

test('4', async ({page}) => {
  await page.goto('https://www.xe.gr/property/results?transaction_name=rent&item_type=re_residence&geo_place_ids%5B%5D=ChIJy1stSUK9oRQRi9ObJcOmO20&geo_place_ids%5B%5D=ChIJcyLG2JZ1YBMRlfY6uga4eQk&geo_place_ids%5B%5D=EjLOoM6xzrPOus-BzrHPhM6vzr_PhSwgzpXPjc6_z4POvM6_z4IsIM6VzrvOu86szrTOsSIuKiwKFAoSCVeywIjmOagUETmG_DOKdLOvEhQKEgmXm0ei_jmoFBGApLniLL0ABA&geo_place_ids%5B%5D=ChIJcRjeopKHWxMRiC8Bbj-rL20&geo_place_ids%5B%5D=EjDOoM6xzrPOus-BzrHPhM6vzr_PhSwgzprOv862zqzOvc63LCDOlc67zrvOrM60zrEiLiosChQKEglJUXaNDNJZExFbS81X5XsGfhIUChIJRzc-jW3SWRMR3dkNbk2r7EI&minimum_price=200&maximum_price=700&minimum_size=75&maximum_size=150');
  await page.getByRole('button', { name: 'ΣΥΜΦΩΝΩ', exact: true }).click();


  let lazyLoadWrappers = await page.locator('.lazyload-wrapper').all();

  for (let i = 0; i < lazyLoadWrappers.length; i++) {
    lazyLoadWrappers = await page.locator('.lazyload-wrapper').all();
    const wrapper = lazyLoadWrappers[i];
    await wrapper.scrollIntoViewIfNeeded();

    const hasSaveSearchWidget = await wrapper.locator('[data-testid="save-search-widget"]').count() > 0; // it is not a add but a text e.g Θες να ενημερώνεσαι πρώτος για νέα ακίνητα;
    if(hasSaveSearchWidget) continue; // skip that

    // Wait for the `property-ad-url` to appear in this wrapper
    await wrapper.locator('[data-testid="property-ad-url"]').nth(0).waitFor({ state: 'attached', timeout: 20000 });

    // Open modal
    await wrapper.locator('[data-testid="property-ad-url"]').first().click();

    let modalTitle = await page.getByTestId('xe-modal-title').textContent();

    while (modalTitle.includes('Loading...')) {
      await page.waitForTimeout(500);
      modalTitle = await page.getByTestId('xe-modal-title').textContent();
    }

    console.log(i)
    console.log('Modal title:', modalTitle);


    await page.waitForTimeout(2000);


    await page.waitForSelector('[data-testid="xe-modal-close"]');

    await page.locator('[data-testid="xe-modal-close"]').click();


    await page.waitForTimeout(500);
  }

  console.log('All ads processed.');
})



