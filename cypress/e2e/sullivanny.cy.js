import urlsData from '../fixtures/sullivanny.json';

describe('Visual Regression Test', () => {
  Object.entries(urlsData.pages).forEach(([pageName, url]) => {
    it.only(`Visual test for ${pageName}`, () => {
      cy.visit(url);
      cy.get('.header').invoke('attr', 'style', 'position: static !important');
      cy.wait(3000);
      cy.compareSnapshot(pageName);
    });
  });
});
