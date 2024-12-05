# XE QA Challenge

[Test.webm](https://github.com/user-attachments/assets/27068c36-e1f5-44e5-9490-6d0f9a3d1486)

This suite verifies basic functionality of the [xe.gr](https://www.xe.gr/property/) website using the [playwright](https://playwright.dev/) framework.

## How to run it

### Requirements
- Node.js 18+

## Setup Instructions
1. Clone the repository:
    ```bash
    git clone git@github.com:konmaz/XE_QA_Challenge.git
    cd XE_QA_Challenge
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Install Playwright browsers:
    ```bash
    npx playwright install
    ```

## Running the Test
_Before running check the values price, squareFootage adn picturesCount on of the file `tests/example.spec.ts`_

Headless mode without seeing the browser
```bash
npx playwright test
```
In order to see the browser while the tests are running it:
```bash
npx playwright test --headed
```

You can also run it using the UI mode
```bash
npx playwright test --ui
```

To view trace
```bash
npx playwright show-trace
```
For more info refer to [documentation](https://playwright.dev/docs/intro)


## Process:
1. **For each page:**
    - Each listing is inside a div.
    - When a listing is clicked, it shows a pop-up.

2. **There are two types of pop-ups:**
    - **Type 1**: A simple pop-up containing all the listing information we need.
    - **Type 2**: A pop-up for "Πολλαπλές αγγελίες" (multiple listings from different vendors).
        - For each vendor:
            - Open the pop-up.
            - See a Type 1 listing and extract the required information:
                - Price
                - Square footage
                - The number of photos (should be < 30)

## Steps:
1. For each page:
    - For each listing:
        - Click on the listing.
        - If the listing type is "multiple listings":
            - For each sublisting, check:
                - `regular_check_listing()`
        - Else, perform a `regular_check_listing()`.

## `regular_check_listing()`:
- Check:
    - Price withing range 
    - Square footage
    - if photos exists
      - The number of photos (< 30) 
    - ~~Optionally, check the phone number.~~ to prevent the anti-bot behavior this has not been implemented


## Future improvements - extensions 
- Add threading
- Break it to smaller tests
- Add it to a CI/CD pipeline
