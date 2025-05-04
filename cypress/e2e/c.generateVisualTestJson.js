describe("Generate Visual Test JSON", () => {
    const csvPath = 'cypress/reports/link-checks.csv';
    const baseUrl = 'https://cpeonline.com/';
    const outputPath = 'cypress/fixtures/cpelive.json';
  
    it("Should generate the cpelive.json fixture from CSV", () => {
      cy.task('generateVisualTestJson', { csvPath, baseUrl, outputPath })
        .then((msg) => {
          cy.log(msg || "✅ JSON generation completed");
        });
    });
  });
  