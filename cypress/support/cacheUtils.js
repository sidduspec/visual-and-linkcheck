export function fetchAndLogCacheHeaders(pageUrl, csvFilePath) {
    const headers = {
      "User-Agent": "Mozilla/5.0 ... Safari/537.36",
      Accept: "text/html,application/xhtml+xml,...",
      "Accept-Language": "en-GB,en;q=0.9",
      "Cache-Control": "max-age=0",
      Connection: "keep-alive",
    };
  
    cy.request({
      method: "GET",
      url: pageUrl,
      headers,
      timeout: 60000,
      failOnStatusCode: false,
      followRedirect: false
    }).then((res) => {
      const result = extractHeaders(pageUrl, res.headers, "First Try");
      writeCacheResultToCSV(result, csvFilePath);
  
      // Optional retry logic
      if (res.headers["cf-cache-status"] === "MISS") {
        cy.wait(2000);
        cy.request({
          method: "HEAD",
          url: pageUrl,
          headers,
          timeout: 60000,
          failOnStatusCode: false,
          followRedirect: true
        }).then((retryRes) => {
          const retryResult = extractHeaders(pageUrl, retryRes.headers, "Retried");
          writeCacheResultToCSV(retryResult, csvFilePath);
        });
      }
    });
  }
  
  function extractHeaders(url, headers, status) {
    return {
      url,
      cacheControl: headers["cache-control"] || "Not Found",
      xCache: headers["x-cache"] || "Not Found",
      xDrupalCache: headers["x-drupal-cache"] || "Not Found",
      xDrupalDynamicCache: headers["x-drupal-dynamic-cache"] || "Not Found",
      status
    };
  }
  
  export function writeCacheResultToCSV(data, filePath) {
    const line = `${data.url},${data.cacheControl},${data.xCache},${data.xDrupalCache},${data.xDrupalDynamicCache},${data.status}\n`;
    cy.writeFile(filePath, line, { flag: "a+" });
  }
  