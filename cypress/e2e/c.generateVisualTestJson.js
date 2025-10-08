describe("Generate Visual Test JSON", () => {
    const csvPath = 'cypress/reports/link-checks.csv';
    const baseUrl = 'https://www.icp.org/';
    const outputPath = 'cypress/fixtures/icp_prod.json';
  
    it("Should generate the cpelive.json fixture from CSV", () => {
      cy.task('generateVisualTestJson', { csvPath, baseUrl, outputPath })
        .then((msg) => {
          cy.log(msg || "✅ JSON generation completed");
        });
    });
  });
  