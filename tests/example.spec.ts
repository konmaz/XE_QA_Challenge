import {expect, Locator, Page, test} from '@playwright/test';

const AREA = 'Παγκράτι';

const priceMin = 200;
const priceMax = 700;

const squareFootageMin = 75;
const squareFootageMax = 150;

const picturesCount = 30;

async function setPriceAndSquareFootageFilters(page: Page) {
    // Set a price range
    await page.getByTestId('price-filter-button').click();
    await page.getByTestId('minimum_price_input').click();
    await page.getByTestId('minimum_price_input').fill(String(priceMin));
    await page.getByTestId('maximum_price_input').click();
    await page.getByTestId('maximum_price_input').fill(String(priceMax));
    await page.getByTestId('maximum_price_input').press('Enter');

    // Set a square footage range
    await page.getByTestId('size-filter-button').click();
    await page.getByTestId('minimum_size_input').click();
    await page.getByTestId('minimum_size_input').fill(String(squareFootageMin));
    await page.getByTestId('maximum_size_input').click();
    await page.getByTestId('maximum_size_input').fill(String(squareFootageMax));
    await page.getByTestId('maximum_size_input').press('Enter');
    await page.getByTestId('maximum_size_input').press('Escape');
}

async function extractedURLs(elements: Array<Locator>) {
    const urls = new Set<string>();
    for (const element of elements) {
        const href = await element.getAttribute('href');
        if (href) {
            urls.add('https://www.xe.gr' + href);
        }
    }
    return urls;
}

async function assertNumber(page: Page, type: string, locator: string, numberMin: number, numberMax: number): Promise<number> {

    const Element = page.locator(locator);
    await expect(Element).toBeVisible()
    const Text = await Element.textContent();
    const Match = Text?.replace(/\./g, '').match(/\d+/); // remove dot and find number, if number is float ignore the decimal part
    const number = Match ? parseInt(Match[0]) : null;

    if (number !== null) {

        expect(number,
            `Expected ${type} value (${number}) to be greater than or equal to the minimum allowed value (${numberMin}).\nAd URL:\n${page.url()}`
        ).toBeGreaterThanOrEqual(numberMin);

        expect(number,
            `Expected ${type} value (${number}) to be less than or equal to the maximum allowed value (${numberMax}).\n\nAd URL:\n${page.url()}`
        ).toBeLessThanOrEqual(numberMax);

        console.log(`Assertion for ${type} passed: ${number} is within the range.`);
        return number;
    } else {
        // Throw an error Playwright can catch
        throw new Error(`No ${type} value found for the locator "${locator}".\nAd URL:\n${page.url()}`);
    }

}
 
async function validateAd(page: Page, url: string, maxPrice: number | undefined): Promise<number> {
    await page.goto(url);

    await assertNumber(page, 'SquareFootage', '[data-testid="basic-info"] .title h1', squareFootageMin, squareFootageMax);
    const price = await assertNumber(page, 'Price', '[data-testid="basic-info"] .price h2', priceMin, priceMax);
    const addHasImages = await page.locator('a[data-testid="gallery-photo"].deactive').count() == 0;
    if (addHasImages) {
        await assertNumber(page, 'picturesCount', '[data-testid="image-count-icon"] span', 0, picturesCount);
    }


    if (maxPrice === undefined) {
        maxPrice = price;  // Initialize maxPrice with the first price
    } else if (price > maxPrice) {
        // If price is greater than maxPrice, the list is not sorted in descending order
        throw new Error(`Ads are not sorted in descending order. The previous ad price (${maxPrice}) was greater than the current one (${price}).\nAd URL:\n${url}`);
    } else {
        maxPrice = price;
    }

    await page.goBack();
    return maxPrice;
}

async function waitForResponse(page: Page) {
    await page.waitForResponse(response => response.url().includes('https://www.xe.gr/property/results/map_search') && response.status() === 200
    );
}

test('main-test', async ({page}) => {
    await page.goto('https://www.xe.gr/property');

    // Cookies banner
    await page.getByRole('button', {name: 'ΣΥΜΦΩΝΩ', exact: true}).click();

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
    await setPriceAndSquareFootageFilters(page);


    let maxPrice: number | undefined = undefined;


    await page.getByTestId('open-property-sorting-dropdown').click()
    await page.getByTestId('price_desc').click();
    await waitForResponse(page);


    let nextPageExists = false;

    do {
        let lazyLoadWrappers = await page.locator('.lazyload-wrapper').all();

        for (let i = 0; i < lazyLoadWrappers.length; i++) {
            lazyLoadWrappers = await page.locator('.lazyload-wrapper').all();
            await lazyLoadWrappers[i].scrollIntoViewIfNeeded();
            await page.waitForTimeout(50);
        }

        const elements = await page.getByTestId('property-ad-url').all();

        // Extract unique URLs
        const urls = await extractedURLs(elements);

        console.log('Unique URLs found:', urls.size);

        // Visit each unique URL
        for (const url of Array.from(urls)) {
            console.log('Visiting:', url);
            await page.goto(url);
            const modalTitle = await page.getByTestId('xe-modal-title').textContent();
            if (modalTitle.includes('Αγγελίες για αυτό το ακίνητο')) { // multiple ads by different brokerage offices
                const subElements = await page.getByTestId('unique-ad-url').all();
                const subUrls = await extractedURLs(subElements);

                for (const subUrl of Array.from(subUrls)) {
                    maxPrice = await validateAd(page, subUrl, maxPrice);
                }

            } else {
                maxPrice = await validateAd(page, url, maxPrice);
            }

            await page.goBack();
        }
        const nextPageButton = page.locator('.pager-next a');
        nextPageExists = await page.locator('.pager-next a').isVisible();

        if (nextPageExists) {
            await nextPageButton.click();
            await waitForResponse(page);
        }

    } while (nextPageExists)

});
