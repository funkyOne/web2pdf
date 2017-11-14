const awaiterCtr = (status, timeout = 60 * 1000) => async client => {
    const browserCode = 
    `return new Promise((fulfill, reject) => {
        const checkinterval = 50;
        let ctr = 0;
        const intervalId = setInterval(() => {
            if (window.status === "${status}") {
                clearInterval(intervalId);
                fulfill();
            }
            if (ctr >= ${timeout}) {
                clearInterval(intervalId);
                reject();
            }
            ctr += checkinterval;
        }, checkinterval);
    });`

    await client.Runtime.evaluate({
        expression: browserCode,
        awaitPromise: true
    });
}

module.exports = awaiterCtr