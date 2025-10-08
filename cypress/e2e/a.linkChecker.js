describe("Link Checker Test",{taskTimeout:60000000}, () => {
    it.only("should check for broken links on the base URL", () => {
      cy.checkBrokenLinksDomain();
    });
     it("should check for broken links from the list", () => {
      cy.checkBrokenLinksJson('semi_url_1.txt');
    });
  });
  