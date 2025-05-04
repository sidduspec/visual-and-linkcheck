describe("Recording 4/21/2025 at 4:49:30 PM", () => {
  it("tests Recording 4/21/2025 at 4:49:30 PM", () => {
    cy.viewport(1520, 342);
    cy.visit("https://dev-damsafety.specbee.site/user/login");
    cy.get("#edit-name").click();
    cy.get("#edit-name").type("nupur@specbee.com");
    cy.get("#edit-pass").type("Ch@NG3+h!$");
    cy.get("#edit-submit").click();
    cy.location("href").should("eq", "https://dev-damsafety.specbee.site/u/bharathspecbeecom-0?check_logged_in=1");
    cy.get("#menu-footer > div:nth-of-type(2) button").click();
    cy.get("#menu-footer li:nth-of-type(3) span").click();
    cy.location("href").should("eq", "https://dev-damsafety.specbee.site/u/bharathspecbeecom-0");
  });
});
