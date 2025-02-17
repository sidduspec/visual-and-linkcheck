describe("Link Checker Test",{taskTimeout:600000}, () => {
    it("should check for broken links on the base URL", () => {
      cy.checkBrokenLinks();
    });
  });
  