const cors_proxy = require('cors-anywhere');

const host = '0.0.0.0'; // Listen on all network interfaces
const port = 8080; // Change this if needed

cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, () => {
    console.log(`CORS Anywhere proxy is running at http://${host}:${port}`);
});
