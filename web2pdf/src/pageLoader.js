const CDP = require('chrome-remote-interface');
const windowStatusAwaiterCtr = require('./awaiters/windowStatus')

const HOST = process.env.CHROME_HOST;

function getAwaiter(opts) {
    if (opts.windowStatus) {
        return windowStatusAwaiterCtr(opts.windowStatus);
    }

    return windowStatusAwaiterCtr("ready-for-print");
}

const main = (url, opts) => {
    const awaiter = getAwaiter(opts);
    return new Promise((res, rej) => {
        CDP({ host: HOST }, async (client) => {
            const { Page } = client;

            try {
                await Page.enable();
                await Page.navigate({ url: url });
                await Page.loadEventFired();
                
                if (awaiter) {
                    await awaiter(client);
                }

                res(client)
            }
            catch (err) {
                client.close();
                rej(err);          
            }
        }).on("error", rej)
    })
}

module.exports = main;