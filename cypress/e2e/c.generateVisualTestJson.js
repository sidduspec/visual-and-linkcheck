describe("Generate Visual Test JSON", () => {
    const csvPath = 'cypress/reports/link-checks.csv';
    const baseUrl = Cypress.config('baseUrl');
    const outputPath = 'cypress/fixtures/livine.json';
  
    it("Should generate the cpelive.json fixture from CSV", () => {
      cy.task('generateVisualTestJson', { csvPath, baseUrl, outputPath })
        .then((msg) => {
          cy.log(msg || "✅ JSON generation completed");
        });
    });
  });
  