import { writeCacheResultToCSV, fetchAndLogCacheHeaders } from "../support/cacheUtils";


describe("Fetch Cache Headers from Fixture URLs", () => {
  const csvFilePath = "cypress/reports/cache_headers.csv";
  let urls = [];

  before(() => {
    // Write CSV header
    cy.writeFile(
      csvFilePath,
      "URL,Cache-Control-Age,Cache-Control-State,x-cache,x-drupal-cache,x-drupal-dynamic-cache,Retry-Status\n",
      { encoding: "utf8" }
    );

  // before(() => {
  //   // Write CSV header
  //   cy.writeFile(
  //     csvFilePath,
  //     "URL,Cache-Control-Age,Cache-Control-State,cf-cache, \n",
  //     { encoding: "utf8" }
  //   );

    // Fetch filtered URLs using the same task logic
    cy.task('getFilteredUrls').then((data) => {
      urls = data.map(d => d.url); // Only the URL values
      cy.log(`🔄 Found ${urls.length} filtered URLs`);
    });
  });
  
    it("Reads URLs from Fixture and Logs Cache Headers", () => {
      // Load URLs from fixture file
      urls.forEach((pageUrl) => {
        cy.wait(500);
        fetchAndLogCacheHeaders(pageUrl, csvFilePath);
      });
    });
  });
  