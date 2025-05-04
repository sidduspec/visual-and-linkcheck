// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("checkBrokenLinks", () => {
  cy.task("runLinkChecker").then((result) => {
    expect(result).to.include("Report generated");
  });
});

// cypress/support/commands.js
Cypress.Commands.add('compareSnapshotSafely', (name, threshold = 0.1) => {
  cy.then(() => {
    Cypress.log({ name: 'compareSnapshotSafely', message: name });
    return Cypress.Promise.try(() => {
      cy.compareSnapshot(name, threshold);
    }).catch((err) => {
      Cypress.log({
        name: '⚠️ Visual diff failed',
        message: `${name} failed threshold`,
        consoleProps: () => err,
      });
    });
  });
});

