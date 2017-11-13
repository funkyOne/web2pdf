const CDP = require('chrome-remote-interface');
const fs = require('fs');

async function awaiter(client) {
    const browserCode = () => {
        return new Promise((fulfill, reject) => {
            setInterval(() => { if (window.status === "ready-for-print") fulfill() }, 50);
        });
    };
    await client.Runtime.evaluate({
        expression: `(${browserCode})()`,
        awaitPromise: true
    });
}

function fn(url) {
    return new Promise((res, rej) => {
        let out;
        CDP({ host: "chrome" }, async (client) => {
            const { Page } = client;
            try {
                await Page.enable();
                await Page.navigate({ url: url });
                await Page.loadEventFired();
                await awaiter(client);
                const { data } = await Page.printToPDF({
                    landscape: false,
                    printBackground: true,
                    marginTop: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    marginRight: 0
                });

                out = Buffer.from(data, 'base64');
            } catch (err) {
                console.error(err);
                rej(err);
            } finally {
                await client.close();                
                res(out);
            }
        }).on('error', (err) => {
            console.error(err);
            rej(err);
        });
    })
}

module.exports = fn
