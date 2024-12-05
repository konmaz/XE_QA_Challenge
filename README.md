# XE QA Challenge

This TestNG suite verifies basic functionality of the [xe.gr](https://www.xe.gr/property/) website using the [Selenium](https://www.selenium.dev/downloads/#:~:text=API%20Docs-,Java,-Stable%3A%204.27.0) framework.

## How to run it

TODO

## Basic functionality



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
    - Price
    - Square footage
    - The number of photos (< 30)
    - ~~Optionally, check the phone number.~~


