describe("Generate Visual Test JSON", () => {
    const csvPath = 'cypress/reports/link-checks.csv';
    const baseUrl = 'https://neriviospain.dev-drreddys.acsitefactory.com/es-es';
    const outputPath = 'cypress/fixtures/nerivio_es_dev.json';
  
    it("Should generate the cpelive.json fixture from CSV", () => {
      cy.task('generateVisualTestJson', { csvPath, baseUrl, outputPath })
        .then((msg) => {
          cy.log(msg || "✅ JSON generation completed");
        });
    });
  });
  