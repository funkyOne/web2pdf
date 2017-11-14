async function pdfPageHandler(client) {
    const { Page } = client;
    
    const { data } = await Page.printToPDF({
        landscape: false,
        printBackground: true,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0
    });

    return Buffer.from(data, 'base64');
}

module.exports = pdfPageHandler;