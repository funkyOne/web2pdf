const pageLoader = require('./pageLoader');

const pipeline = pageProcessor => async (url, opts) => {
    let page;
    try {
        page = await pageLoader(url, opts);
    }
    catch (e) {
        console.error("Failed to load the page")
        throw e;
    }

    try {
        return await pageProcessor(page);
    }
    finally {
        await page.close();
    }
}

module.exports = pipeline