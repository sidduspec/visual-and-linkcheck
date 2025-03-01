describe('Fetch Cache Headers from Sitemap URLs', () => {
    const sitemapUrl = 'https://cpeonline.com/sitemap.xml';
    const csvFilePath = 'cypress/reports/cache_headers.csv';

    // Write CSV header before test starts
    before(() => {
        cy.writeFile(csvFilePath, 'URL,Cache-Control,CF-Cache-Status,CF-Ray\n', { encoding: 'utf8' });
    });

    it('Extracts URLs from Sitemap and Logs Cache Headers', () => {
        cy.request({
            method: 'GET',
            url: sitemapUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                'Accept': 'application/xml,text/xml;q=0.9'
            }
        }).then((response) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response.body, 'text/xml');
            const urlNodes = xmlDoc.getElementsByTagName('loc');
            const urls = Array.from(urlNodes).map(node => node.textContent.trim());

            cy.log(`🔄 Found ${urls.length} URLs`);

            // Iterate through each page URL and fetch cache headers
            urls.forEach((pageUrl) => {
                cy.wait(500); // Prevents hitting the server too fast
                cy.request({
                    method: 'HEAD', // HEAD is sufficient for fetching headers
                    url: pageUrl,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                        'Accept-Language': 'en-GB,en;q=0.9',
                        'Referer': 'https://cpeonline.com/',
                        'Cache-Control': 'max-age=0',
                        'Connection': 'keep-alive'
                    },
                    failOnStatusCode: false // Prevent test from failing on 404s
                }).then((res) => {
                    const cacheControl = res.headers['cache-control'] || 'Not Found';
                    const cacheStatus = res.headers['cf-cache-status'] || 'Not Found';
                    const cacheRay = res.headers['cf-ray'] || 'Not Found';

                    cy.log(`✅ URL: ${pageUrl} | Cache-Control: ${cacheControl}`);

                    // Append to CSV file
                    cy.writeFile(csvFilePath, `${pageUrl},${cacheControl},${cacheStatus},${cacheRay}\n`, { flag: 'a+' });
                });
            });
        });
    });
});
