const axios = require('axios');
const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

const sitemapUrl = 'https://cpeonline.com/sitemap.xml';
const csvFilePath = 'cypress/reports/cache_headers.csv';  // Ensure this file is created/updated

const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Referer': 'https://cpeonline.com/',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive'
    }
});

// Function to introduce delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Write CSV header initially
fs.writeFileSync(csvFilePath, 'URL,Cache-Control-age, Cache-control-status,  Cache-status, cache-ray\n');

// Function to fetch and parse XML
async function fetchSitemapUrls(url) {
    try {
        await delay(500); // Prevents hitting the server too fast
        const response = await axiosInstance.get(url);
        const parser = new XMLParser({ ignoreAttributes: false });
        const xmlData = parser.parse(response.data);

        let urls = [];

        if (xmlData.urlset && xmlData.urlset.url) {
            urls = Array.isArray(xmlData.urlset.url) ? xmlData.urlset.url.map(u => u.loc) : [xmlData.urlset.url.loc];
        } else if (xmlData.sitemapindex && xmlData.sitemapindex.sitemap) {
            const nestedSitemaps = Array.isArray(xmlData.sitemapindex.sitemap) 
                ? xmlData.sitemapindex.sitemap.map(s => s.loc) 
                : [xmlData.sitemapindex.sitemap.loc];

            console.log(`🔄 Found nested sitemaps, fetching...`);
            let nestedResults = await Promise.all(nestedSitemaps.map(fetchSitemapUrls));
            urls = nestedResults.flat();
        } else {
            console.warn(`⚠️ Unexpected XML structure: ${url}`);
        }

        return urls;
    } catch (error) {
        console.error(`❌ Failed to fetch sitemap: ${url} - ${error.message}`);
        return [];
    }
}

// Function to fetch Cache-Control header and write each result to CSV
async function fetchCacheHeaders(url) {
    try {
        await delay(500); // Introduce delay before making the request
        const response = await axiosInstance.head(url, { timeout: 15000 });
        const cacheControl = response.headers['cache-control'] || 'Not Found';
        const cacheStatus = response.headers['cf-cache-status'] || 'Not Found';
        const cacheRay = response.headers['cf-ray'] || 'Not Found';
        console.log(`✅ URL: ${url} | Cache-Control: ${cacheControl}`);

        // Append each row to the CSV file
        fs.appendFileSync(csvFilePath, `${url},${cacheControl}, ${cacheStatus}, ${cacheRay}\n`);
    } catch (error) {
        console.warn(`⚠️ Failed to fetch cache headers for: ${url}`);
        fs.appendFileSync(csvFilePath, `${url},Not Found\n`);
    }
}

// Main function
(async () => {
    const pageUrls = await fetchSitemapUrls(sitemapUrl);
    console.log(`Total Pages Found: ${pageUrls.length}`);

    // Fetch cache headers one by one with delay, writing to CSV after each request
    for (const pageUrl of pageUrls) {
        await fetchCacheHeaders(pageUrl);
    }

    console.log(`✅ CSV file updated: ${csvFilePath}`);
})();
