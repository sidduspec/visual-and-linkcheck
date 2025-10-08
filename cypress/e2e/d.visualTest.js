// import urlsData from "../fixtures/damsafety_live.json";

// describe("Visual Regression Test", () => {
//   const sampleLimit = 30; // 🔁 Set your sample size here

//   Cypress.on('uncaught:exception', () => false);

//   Object.entries(urlsData.pages)
//     .slice(0, sampleLimit)
//     .forEach(([pageName, url]) => {
//       it(`Visual test for ${pageName}`, () => {
//         cy.viewport(1536, 695);
//         cy.visit(url, { failOnStatusCode: false });
//         // cy.scrollToBottomAndTopGradually();
//         // cy.prepareForVisualSnapshot({
//         //   hideSelectors: [],
//         //   waitAfterScroll: 3000,
//         //   scroll: false,
//         // });
//         cy.get('#scrolling-header')
//           .invoke('attr', 'style', 'position: static !important');
//        cy.wait(1000);
//         cy.compareSnapshot(pageName);
//       });
//     });
// });

import urlsData from "../fixtures/betacare-test.json";

describe("Visual Regression Test", () => {
  const sampleLimit = 25; // Set your sample size here

  Object.entries(urlsData.pages)
    .slice(0, sampleLimit)
    .forEach(([pageName, url]) => {
      it(`Visual test for ${pageName}`, () => {
        // cy.viewport(1920,1080)
        cy.visit(url, { failOnStatusCode: false });
        cy.document().its('body.scrollHeight').then((h) => {
          // cy.viewport(1920, h); // Adjust to full content height
          cy.get('[data-once="betacare-header"]').should('be.visible').invoke('attr', 'style', 'position: static !important');
          cy.wait(500); // Let layout settle
          cy.compareSnapshot(pageName);
        });
        // cy.scrollTo(0, 200);
        // cy.get('[data-once="betacare-header"]').should('be.visible').invoke('attr', 'style', 'position: static !important');
        // // cy.get('.hero-slider').should('be.visible').invoke('attr', 'style', 'transform: none !important; transition: none !important');
        // // cy.get('.member-slider').should('be.visible').invoke('attr', 'style', 'opacity: 1 !important; transition: none !important');

        // cy.wait(3000); // Small wait to allow page load
        // cy.compareSnapshot(pageName);
      });
    });
});
