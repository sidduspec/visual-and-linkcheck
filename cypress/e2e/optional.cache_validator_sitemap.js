describe("Fetch Cache Headers from Sitemap URLs", () => {
  const sitemapUrl = "https://migration.townofng.com/sitemap";
  const csvFilePath = "cypress/reports/cache_headers.csv";

  // Write CSV header before test starts
  before(() => {
    cy.writeFile(
      csvFilePath,
      "URL,Cache-Control-Age,Cache-Control-State,Cache-Status,CF-Ray,x-drupal-cache, x-drupal-dynamic-cache,Retry-Status\n",
      { encoding: "utf8" }
    );
  });

  it("Extracts URLs from Sitemap and Logs Cache Headers", () => {
    cy.request({
      method: "GET",
      url: sitemapUrl,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        Accept: "application/xml,text/xml;q=0.9",
      },
      followRedirect: true,
    }).then((response) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.body, "text/xml");
      const urlNodes = xmlDoc.getElementsByTagName("loc");
      let urls = Array.from(urlNodes).map((node) => node.textContent.trim());
    //   urls = urls.reverse();
      cy.log(`🔄 Found ${urls.length} URLs`);

      urls.forEach((pageUrl, index) => {
        cy.wait(500);
        checkCacheHeaders(pageUrl);
      });
    });
  });

  function checkCacheHeaders(pageUrl) {
    if (
      pageUrl.includes(
        "/cash-flow-statements-classification-disclosure-issues"
      ) ||
      pageUrl.includes(
        "/mergers-acquisitions-conference-current-trends-strategies"
      )
    ) {
      const urlParts = pageUrl.split("//");
      pageUrl = `${urlParts[0]}//www.${urlParts[1]}`;
    }

    cy.request({
      method: "GET", // Fetch headers only
      url: pageUrl,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-GB,en;q=0.9",
        Referer: "https://www.cpeonline.com/",
        "Cache-Control": "max-age=0",
        Connection: "keep-alive",
      },
      timeout: 60000,
      failOnStatusCode: false, // Prevent test from failing on 404s
      followRedirect: false
    }).then((res) => {
      const cacheControl = res.headers["cache-control"] || "Not Found";
      // const cacheStatus = res.headers['cache-status'] || 'Not Found';
      const cacheCfStatus = res.headers["cf-cache-status"] || "Not Found";
      const cacheRay = res.headers["cf-ray"] || "Not Found";
      const xDrupalCache = res.headers["x-drupal-cache"] || "Not Found";
      const xDrupalDynamicCache =
        res.headers["x-drupal-dynamic-cache"] || "Not Found";

      cy.log(
        `✅ URL: ${pageUrl} | Cache-Control: ${cacheControl} | CF-Cache-Status: ${cacheCfStatus}`
      );

      // Write first request result to CSV
      cy.writeFile(
        csvFilePath,
        `${pageUrl},${cacheControl},${cacheCfStatus},${cacheRay}, ${xDrupalCache},${xDrupalDynamicCache},First Try\n`,
        { flag: "a+" }
      );

      // If CF-Cache-Status is MISS, retry the request
      // if (cacheCfStatus === 'MISS') {
      //     cy.wait(2000); // Wait before retrying
      //     cy.request({
      //         method: 'HEAD',
      //         url: pageUrl,
      //         headers: {
      //             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      //             'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      //             'Accept-Language': 'en-GB,en;q=0.9',
      //             'Referer': 'https://cpeonline.com/',
      //             'Cache-Control': 'max-age=0',
      //             'Connection': 'keep-alive',
      //             'Cookie': ''
      //         },
      //         timeout: 60000,
      //         failOnStatusCode: false,
      //         followRedirect: true
      //     }).then((retryRes) => {
      //         const retryCacheControl = retryRes.headers['cache-control'] || 'Not Found';
      //         //const retryCacheStatus = retryRes.headers['cache-status'] || 'Not Found';
      //         const retryCacheCfStatus = retryRes.headers['cf-cache-status'] || 'Not Found';
      //         const retryCacheRay = retryRes.headers['cf-ray'] || 'Not Found';
      //         const retryXDrupalCache = retryRes.headers['x-drupal-cache'] || 'Not Found'
      //         const retryXDrupalDynamicCache = retryRes.headers['x-drupal-dynamic-cache'] || 'Not Found'

      //         cy.log(`🔁 Retried: ${pageUrl} | CF-Cache-Status: ${retryCacheCfStatus}`);

      //         // Append retry result to CSV
      //         cy.writeFile(csvFilePath, `${pageUrl},${retryCacheControl},${retryCacheCfStatus},${retryCacheRay}, ${retryXDrupalCache},${retryXDrupalDynamicCache},Retried\n`, { flag: 'a+' });
      //     });
      // }
    });
  }
});
