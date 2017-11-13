const CDP = require('chrome-remote-interface'); 
const fs = require("fs"); 
const os = require("os"); 
const path = require("path"); 
const uuidv1 = require('uuid/v1'); 
const dlMasterDir = path.join(os.tmpdir(), "dlCapture"); 

if (!fs.existsSync(dlMasterDir)) {
    fs.mkdirSync(dlMasterDir);
}

async function awaiter(client) {
    const browserCode = () => {
        return new Promise((fulfill, reject) => {
            setInterval(() => {
                if (window.status === "ready-for-print") fulfill()
            }, 50);
        });
    };
    await client.Runtime.evaluate({
        expression: `(${browserCode})()`,
        awaitPromise: true
    });
}
const waitDownloadComplete = async (path, waitTimeSpanMs = 1000, timeoutMs = 60 * 1000) => {
    return new Promise((resolve, reject) => {
        const wait = (waitTimeSpanMs, totalWaitTimeMs) => setTimeout(
            () => isDownloadComplete(path).then(
                (completed) => {
                    if (completed) {
                        resolve();
                    } else {
                        const nextTotalTime = totalWaitTimeMs + waitTimeSpanMs;
                        if (nextTotalTime >= timeoutMs) {
                            reject('timeout');
                        }
                        const nextSpan = Math.min(
                            waitTimeSpanMs,
                            timeoutMs - nextTotalTime
                        );
                        wait(nextSpan, nextTotalTime);
                    }
                }
            ).catch(
                (err) => {
                    reject(err);
                }
            ),
            waitTimeSpanMs
        );
        wait(waitTimeSpanMs, 0);
    });
};
const isDownloadComplete = async (path) => {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) {
                reject(err);
            } else {
                if (files.length === 0) {
                    resolve(/* completed */ false);
                    return;
                }
                for (let file of files) {
                    if (/.*\.crdownload$/.test(file)) {
                        resolve(/* completed */ false);
                        return;
                    }
                }
                resolve(/* completed */ true);
            }
        });
    });
};
//TODO clean up dlCapture folders on schedule

async function getDownload(url) {
    const protocol = await CDP({port: 9222});
    try {
        const dlDir = path.join(dlMasterDir, uuidv1());
        fs.mkdirSync(dlDir);
        const {Page} = protocol;
        await Page.enable();
        await protocol.send('Page.setDownloadBehavior', {behavior: "allow", downloadPath: dlDir});
        Page.navigate({url: url});
        await Page.loadEventFired();
        console.log("page loaded");
        await awaiter(protocol);
        await waitDownloadComplete(dlDir)
            .catch((err) => console.error(err));
        const files = fs.readdirSync(dlDir);
        return path.join(dlDir, files[0]);
    } catch (err) {
        console.error(err);
    } finally {
        protocol.close();
    }
}
module.exports = getDownload;
