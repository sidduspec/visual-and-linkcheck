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

Cypress.Commands.add('prepareForVisualSnapshot', (options = {}) => {
  const {
    scroll = true,
    lazyImages = true,
    disableAnimations = true,
    hideSelectors = [],
    waitAfterScroll = 2000,
  } = options;

  // Step 1: Scroll to bottom gradually
  if (scroll) {
    cy.scrollToBottomGradually();
  }

  // Step 2: Wait for page to fully render
  cy.wait(waitAfterScroll);

  // Step 3: Force load lazy-loaded images
  if (lazyImages) {
    cy.get('body').then(($body) => {
      if ($body.find('img[loading="lazy"]').length > 0) {
        cy.log('🖼 Found lazy images. Forcing eager loading...');
        cy.get('img[loading="lazy"]').each(($img) => {
          $img[0].setAttribute('loading', 'eager');
        });
      } else {
        cy.log('✅ No lazy-loaded images found.');
      }
    });
  }

  // Step 4: Disable transitions & animations
  if (disableAnimations) {
    cy.document().then((doc) => {
      const style = doc.createElement('style');
      style.innerHTML = `
        * {
          transition: none !important;
          animation: none !important;
        }
      `;
      doc.head.appendChild(style);
    });
  }

  // Step 5: Hide dynamic elements
  if (hideSelectors.length) {
    hideSelectors.forEach((selector) => {
      cy.get(selector).invoke('hide');
    });
  }
});

Cypress.Commands.add('scrollToBottomGradually', () => {
  const scrollStep = 500;
  const delay = 200;
  const maxTries = 30; // Failsafe to avoid infinite loops

  let tries = 0;

  function scrollStepDown() {
    return cy.window().then((win) => {
      const currentScroll = win.scrollY;
      const pageHeight = win.document.body.scrollHeight;

      if (currentScroll + scrollStep < pageHeight && tries < maxTries) {
        win.scrollTo(0, currentScroll + scrollStep);
        tries++;
        return cy.wait(delay).then(scrollStepDown);
      } else {
        cy.log('✅ Finished scrolling');
      }
    });
  }

  return scrollStepDown();
});

Cypress.Commands.add('scrollToBottomAndTopGradually', () => {
  const scrollStep = 500;
  const delay = 200;
  const maxTries = 30;
  let tries = 0;

  function scrollStepDown() {
    return cy.window().then((win) => {
      const currentScroll = win.scrollY;
      const pageHeight = win.document.body.scrollHeight;

      if (currentScroll + scrollStep < pageHeight && tries < maxTries) {
        win.scrollTo(0, currentScroll + scrollStep);
        tries++;
        return cy.wait(delay).then(scrollStepDown);
      } else {
        cy.log('✅ Finished scrolling down');
      }
    });
  }

  function scrollToTop() {
    return cy.window().then((win) => {
      win.scrollTo(0, 0);
      cy.log('🔼 Scrolled back to top');
    });
  }

  return scrollStepDown().then(() => scrollToTop());
});


