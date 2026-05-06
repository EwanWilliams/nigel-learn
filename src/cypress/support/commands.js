// Custom Cypress commands

/**
 * Opens the payslip envelope, reads the gross pay from the DOM,
 * calculates the correct tax (20%) and NI (10%), fills them in,
 * and clicks confirm. Resolves with the net pay value.
 */
Cypress.Commands.add('completePayslip', () => {
  // Click the envelope to open it
  cy.get('.payslipEnvelope').click();

  // Wait for the full payslip card to render (animation is ~900ms)
  cy.get('.payslipCard', { timeout: 2000 }).should('be.visible');
  cy.get('.payslipEnvelope').should('not.exist');

  // Read gross pay, compute tax/NI, enter correct values
  cy.get('.payslipRow').first().find('strong').invoke('text').then((grossText) => {
    const gross = parseFloat(grossText.replace(/[£,]/g, ''));
    const tax = (gross * 0.2).toFixed(2);
    const ni = (gross * 0.1).toFixed(2);

    cy.get('.payslipInput').eq(0).clear().type(tax);
    cy.get('.payslipInput').eq(1).clear().type(ni);
  });

  // Confirm & receive pay
  cy.get('.payslipCard .btn.primary').should('not.be.disabled').click();
});

/**
 * Starts the study simulation from the intro overlay.
 */
Cypress.Commands.add('startSimulation', () => {
  cy.get('.introOverlay').should('be.visible');
  cy.get('.introCard button').click();
});

/**
 * Allocates the minimum budget to unlock mail (fills every category with 10 each,
 * clicking + enough times to reach or exceed net income).
 * Simpler: we use the number input directly.
 */
Cypress.Commands.add('allocateFullBudget', (netIncome) => {
  // Switch to budget screen
  cy.get('.topbar-actions .iconBtn').click();

  const categories = ['rent', 'travel', 'food', 'phone', 'subscriptions', 'savings', 'fun'];
  const perCategory = Math.floor(netIncome / categories.length);
  const remainder = netIncome - perCategory * (categories.length - 1);

  cy.get('.budgetInput').each(($input, index) => {
    const amount = index === categories.length - 1 ? remainder : perCategory;
    cy.wrap($input).clear().type(amount);
  });
});
