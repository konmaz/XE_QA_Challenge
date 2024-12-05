import {expect, Locator, Page, test} from '@playwright/test';

const AREA = 'Παγκράτι';

const PriceMin = 200;
const PriceMax = 700;

const SquareFootageMin = 75;
const SquareFootageMax = 150;

const PicturesCount = 30;

test('ΧΕ-QA', async ({page}) => {
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

Cl
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

async function assertNumber(page: Page, type: string, locator: string, numberMin: number, numberMax: number) {

    const Element = page.locator(locator);
    await expect(Element).toBeVisible()
    const Text = await Element.textContent();
    const Match = Text?.match(/\b\d+\b/g);
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

async function validate_ad(page: Page, url: string, max_price: number) {
    await page.goto(url);

    await assertNumber(page, 'SquareFootage', '[data-testid="basic-info"] .title h1', SquareFootageMin, SquareFootageMax);
    const price = await assertNumber(page, 'Price', '[data-testid="basic-info"] .price h2', PriceMin, PriceMax);
    await assertNumber(page, 'PicturesCount', '[data-testid="image-count-icon"] span', 0, PicturesCount);

    if (max_price === undefined) {
        max_price = price;  // Initialize max_price with the first price
    } else if (price > max_price) {
        // If price is greater than max_price, the list is not sorted in descending order
        throw new Error(`Ads are not sorted in descending order. The previous ad price (${max_price}) was greater than the current one (${price}).\nAd URL:\n${url}`);
    } else {
        max_price = price;
    }

    await page.goBack();
    return max_price;
}

test('2', async ({page}) => {
    await page.goto('https://www.xe.gr/property/results?geo_place_ids%5B%5D=ChIJy1stSUK9oRQRi9ObJcOmO20&item_type=re_residence&maximum_price=700&maximum_size=150&minimum_price=200&minimum_size=75&transaction_name=rent');
    await page.getByRole('button', {name: 'ΣΥΜΦΩΝΩ', exact: true}).click();

    let max_price: number = undefined;

    await page.getByTestId('open-property-sorting-dropdown').click()
    await page.getByTestId('price_desc').click();
    await waitForResponse(page);


    let has_next_page = false;

    do {
        let lazyLoadWrappers = await page.locator('.lazyload-wrapper').all();
        
        for (let i = 0; i < lazyLoadWrappers.length; i++) {
            lazyLoadWrappers = await page.locator('.lazyload-wrapper').all();
            await lazyLoadWrappers[i].scrollIntoViewIfNeeded();
            await page.waitForTimeout(50);
        }
        
        const elements = await page.getByTestId('property-ad-url').all();
        
        // Extract unique URLs
        const urls = await extracted_Urls(elements);
        
        console.log('Unique URLs found:', urls.size);
        
        // Visit each unique URL
        for (const url of Array.from(urls)) {
            console.log('Visiting:', url);
            await page.goto(url);
        
            const modalTitle = await page.getByTestId('xe-modal-title').textContent();
            if (modalTitle.includes('Αγγελίες για αυτό το ακίνητο')) { // multiple ads by different brokerage offices
                const sub_elements = await page.getByTestId('unique-ad-url').all();
                const sub_urls = await extracted_Urls(sub_elements);
        
                for (const sub_url of Array.from(sub_urls)) {
                    max_price = await validate_ad(page, sub_url, max_price);
                }
        
            } else {
                max_price = await validate_ad(page, url, max_price);
            }
        
            await page.goBack();
        }
        const nextPageButton = page.locator('.pager-next a');
        has_next_page = await page.locator('.pager-next a').isVisible();

        if (has_next_page) {
            await nextPageButton.click();
            await waitForResponse(page);
        }

    } while (has_next_page)

})

async function waitForResponse(page: Page) {
    await page.waitForResponse(response => response.url().includes('https://www.xe.gr/property/results/map_search') && response.status() === 200
    );
}
