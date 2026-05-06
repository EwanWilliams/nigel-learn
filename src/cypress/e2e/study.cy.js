describe('Study Page – Intro & Navigation', () => {
  beforeEach(() => {
    cy.visit('/study');
  });

  it('shows the header with an exit link', () => {
    cy.contains('a', 'Exit Simulation').should('be.visible').and('have.attr', 'href', '/');
  });

  it('shows the intro overlay before the simulation starts', () => {
    cy.get('.introOverlay').should('be.visible');
    cy.contains('h1', 'Welcome to Student Bank').should('be.visible');
    cy.contains('Start Simulation').should('be.visible');
  });

  it('does not show the simulator until simulation is started', () => {
    cy.get('.simulatorLayout').should('not.exist');
  });

  it('"Exit Simulation" link returns to the landing page', () => {
    // Suppress React cleanup errors that fire when the component unmounts mid-test
    cy.on('uncaught:exception', () => false);
    cy.contains('a', 'Exit Simulation').click({ force: true });
    cy.location('pathname').should('eq', '/');
  });
});

describe('Study Page – Payslip', () => {
  beforeEach(() => {
    cy.visit('/study');
    cy.startSimulation();
  });

  it('shows the payslip envelope after starting', () => {
    cy.get('.payslipOverlay').should('be.visible');
    cy.get('.payslipEnvelope').should('be.visible');
    cy.contains('.openHint', 'Click to open').should('be.visible');
  });

  it('opens the payslip card when the envelope is clicked', () => {
    cy.get('.payslipEnvelope').click();
    cy.get('.payslipCard', { timeout: 2000 }).should('be.visible');
    cy.contains('Payslip').should('be.visible');
    cy.contains('Gross Pay').should('be.visible');
    cy.contains('Income Tax').should('be.visible');
    cy.contains('National Insurance').should('be.visible');
    cy.contains('Net Pay').should('be.visible');
  });

  it('confirm button is disabled with empty inputs', () => {
    cy.get('.payslipEnvelope').click();
    cy.get('.payslipCard', { timeout: 2000 }).should('be.visible');
    cy.get('.btn.primary').should('be.disabled');
  });

  it('confirm button is disabled with wrong values', () => {
    cy.get('.payslipEnvelope').click();
    cy.get('.payslipCard', { timeout: 2000 }).should('be.visible');
    cy.get('.payslipInput').eq(0).type('9999');
    cy.get('.payslipInput').eq(1).type('9999');
    cy.get('.btn.primary').should('be.disabled');
  });

  it('confirm button enables with correct 20%/10% values', () => {
    cy.get('.payslipEnvelope').click();
    cy.get('.payslipCard', { timeout: 2000 }).should('be.visible');
    cy.get('.payslipEnvelope').should('not.exist');

    cy.get('.payslipRow').first().find('strong').invoke('text').then((grossText) => {
      const gross = parseFloat(grossText.replace(/[£,]/g, ''));
      const tax = (gross * 0.2).toFixed(2);
      const ni = (gross * 0.1).toFixed(2);
      cy.get('.payslipInput').eq(0).clear().type(tax);
      cy.get('.payslipInput').eq(1).clear().type(ni);
      cy.get('.btn.primary').should('not.be.disabled').and('contain', 'Confirm & Receive Pay');
    });
  });

  it('completing the payslip shows the simulator layout', () => {
    cy.completePayslip();
    cy.get('.simulatorLayout').should('be.visible');
    cy.get('.phone').should('be.visible');
  });
});

describe('Study Page – Home Screen', () => {
  beforeEach(() => {
    cy.visit('/study');
    cy.startSimulation();
    cy.completePayslip();
  });

  it('shows the Student Bank topbar', () => {
    cy.get('.topbar').should('be.visible');
    cy.contains('h2', 'Student Bank').should('be.visible');
  });

  it('shows the week indicator', () => {
    cy.contains('Week 1 of 4').should('be.visible');
  });

  it('shows all four accounts', () => {
    cy.contains('Current Account').should('be.visible');
    cy.contains('Savings Account').should('be.visible');
    cy.contains('Debit Card').should('be.visible');
    cy.contains('Credit Card').should('be.visible');
  });

  it('shows masked card numbers for card accounts', () => {
    cy.contains('•••• 4821').should('be.visible');
    cy.contains('•••• 1934').should('be.visible');
  });

  it('search filters accounts', () => {
    cy.get('.search').type('savings');
    cy.contains('Savings Account').should('be.visible');
    cy.contains('Current Account').should('not.exist');
    cy.get('.search').clear();
    cy.contains('Current Account').should('be.visible');
  });

  it('search by card last4 filters correctly', () => {
    cy.get('.search').type('4821');
    cy.contains('Debit Card').should('be.visible');
    cy.contains('Savings Account').should('not.exist');
  });

  it('clicking an account opens the detail screen', () => {
    cy.contains('.accountCard', 'Current Account').click();
    cy.get('.detail').should('be.visible');
    cy.contains('Current Account').should('be.visible');
    cy.contains('← Back').should('be.visible');
  });

  it('back button returns to the home screen', () => {
    cy.contains('.accountCard', 'Savings Account').click();
    cy.get('.backBtn').click();
    cy.get('.account-list').should('be.visible');
    cy.get('.detail').should('not.exist');
  });
});

describe('Study Page – Budget Screen', () => {
  beforeEach(() => {
    cy.visit('/study');
    cy.startSimulation();
    cy.completePayslip();
    // Toggle to budget screen via the £ button
    cy.get('.topbar-actions .iconBtn').click();
  });

  it('shows the budget screen heading and categories', () => {
    cy.contains('Monthly budget').should('be.visible');
    cy.contains('Take-home pay').should('be.visible');
    cy.contains('Left to allocate').should('be.visible');
  });

  it('shows all seven budget categories', () => {
    cy.contains('Rent / Board').should('be.visible');
    cy.contains('Travel').should('be.visible');
    cy.contains('Food').should('be.visible');
    cy.contains('Phone').should('be.visible');
    cy.contains('Subscriptions').should('be.visible');
    cy.contains('Savings').should('be.visible');
    cy.contains('Fun').should('be.visible');
  });

  it('increment button increases a category value by 10', () => {
    cy.get('.budgetRow').first().within(() => {
      cy.get('.budgetInput').invoke('val').then((initial) => {
        cy.contains('button', '+').click();
        cy.get('.budgetInput').should('have.value', String(Number(initial) + 10));
      });
    });
  });

  it('decrement button does not go below 0', () => {
    cy.get('.budgetRow').first().within(() => {
      cy.get('.budgetInput').should('have.value', '0');
      cy.contains('button', '−').click();
      cy.get('.budgetInput').should('have.value', '0');
    });
  });

  it('clicking a category row selects it', () => {
    // Click the label text, not the centre of the row (which lands on a button with stopPropagation)
    cy.get('.budgetRow').first().find('span').first().click();
    cy.get('.budgetRow').first().should('have.class', 'active');
  });

  it('toggling back to home screen shows accounts', () => {
    cy.get('.topbar-actions .iconBtn').click();
    cy.get('.account-list').should('be.visible');
  });
});

describe('Study Page – Post Panel', () => {
  beforeEach(() => {
    cy.visit('/study');
    cy.startSimulation();
    cy.completePayslip();
  });

  it('shows the post panel with mail items', () => {
    cy.get('.postPanel').should('be.visible');
    // Use class selector to avoid apostrophe encoding issues
    cy.get('.postPanelTitle').should('be.visible');
    cy.get('.mailPiece').should('have.length', 3);
  });

  it('shows a warning when budget is not fully allocated', () => {
    cy.contains('Please allocate your full budget before opening mail').should('be.visible');
  });

  it('mail cannot be opened before budget is complete', () => {
    // Click envelope – should not open because budget not allocated
    cy.get('.mailPiece').first().click();
    cy.get('.letterShell').should('not.exist');
  });
});
