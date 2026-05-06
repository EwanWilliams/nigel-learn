const API = 'http://localhost:3000';

describe('Module Builder Page – Layout', () => {
  beforeEach(() => {
    cy.visit('/build');
  });

  it('renders the page heading', () => {
    cy.contains('h1', 'Module Creation').should('be.visible');
  });

  it('shows the Module Name input', () => {
    cy.get('input[name="moduleName"]').should('be.visible');
  });

  it('shows the Brief textarea', () => {
    cy.get('textarea[name="brief"]').should('be.visible');
  });

  it('shows the Mail section with one default row', () => {
    cy.contains('h3', 'Mail').should('be.visible');
    cy.get('select').contains('Expense').should('exist');
  });

  it('shows the Incomes section', () => {
    cy.contains('h3', 'Incomes').should('be.visible');
    cy.get('select').contains('PAYE').should('exist');
  });

  it('shows the Expenses section', () => {
    cy.contains('h3', 'Expenses').should('be.visible');
    cy.get('select').contains('Rent').should('exist');
  });

  it('shows the Weeks section', () => {
    cy.contains('h3', 'Weeks').should('be.visible');
  });

  it('shows the Quiz Questions section', () => {
    cy.contains('h3', 'Quiz Questions').should('be.visible');
  });

  it('shows the Create Module submit button', () => {
    cy.get('button[type="submit"]').contains('Create Module').should('be.visible');
  });
});

describe('Module Builder Page – Dynamic Fields', () => {
  beforeEach(() => {
    cy.visit('/build');
  });

  it('"Add Mail" adds a new mail row', () => {
    cy.contains('button', 'Add Mail').click();
    // Should now have 2 Remove buttons in the mail section
    cy.contains('h3', 'Mail').next('div').find('button').filter(':contains("Remove")').should('have.length', 2);
  });

  it('"Remove" on a mail row removes it', () => {
    cy.contains('button', 'Add Mail').click();
    cy.contains('h3', 'Mail').next('div').find('button').filter(':contains("Remove")').first().click();
    cy.contains('h3', 'Mail').next('div').find('button').filter(':contains("Remove")').should('have.length', 1);
  });

  it('"Add Income" adds a new income row', () => {
    cy.contains('button', 'Add Income').click();
    cy.contains('h3', 'Incomes').next('div').find('button').filter(':contains("Remove")').should('have.length', 2);
  });

  it('"Add Expense" adds a new expense row', () => {
    cy.contains('button', 'Add Expense').click();
    cy.contains('h3', 'Expenses').next('div').find('button').filter(':contains("Remove")').should('have.length', 2);
  });

  it('"Add Week" adds a new week row', () => {
    cy.contains('button', 'Add Week').click();
    cy.contains('h3', 'Weeks').next('div').find('button').filter(':contains("Remove")').should('have.length', 2);
  });

  it('"Add Quiz Question" adds a new question', () => {
    cy.contains('button', 'Add Quiz Question').click();
    cy.contains('h3', 'Quiz Questions').next('div').find('button').filter(':contains("Remove Question")').should('have.length', 2);
  });

  it('"Add Option" adds an option to a quiz question', () => {
    cy.contains('button', 'Add Option').first().click();
    // Default is 2 options, after click should be 3
    cy.get('[placeholder="Option 3"]').should('exist');
  });

  it('"Add Week" auto-increments the date by 7 days', () => {
    const startDate = '2025-01-06';
    cy.contains('h3', 'Weeks').next('div').find('input[type="date"]').first().type(startDate);
    cy.contains('button', 'Add Week').click();
    cy.contains('h3', 'Weeks').next('div').find('input[type="date"]').eq(1).should('have.value', '2025-01-13');
  });
});

describe('Module Builder Page – Form Validation', () => {
  beforeEach(() => {
    cy.visit('/build');
  });

  it('HTML5 required validation prevents empty submission', () => {
    cy.get('button[type="submit"]').click();
    // Browser native validation should fire – module name input should be invalid
    cy.get('input[name="moduleName"]').then(($el) => {
      expect($el[0].validity.valid).to.be.false;
    });
  });

  it('shows quiz validation error when no correct answer is marked', () => {
    // Fill in required fields minimally
    cy.get('input[name="moduleName"]').type('Test Module');
    cy.get('textarea[name="brief"]').type('A brief description');

    // Fill mail row
    cy.get('h3').contains('Mail').next('div').within(() => {
      cy.get('input[type="text"]').eq(0).type('Mail label');
      cy.get('input[type="text"]').eq(1).type('Sender Name');
      cy.get('input[type="date"]').type('2025-01-06');
      cy.get('input[type="text"]').eq(2).type('Test subject');
      cy.get('input[type="text"]').eq(3).type('Test body');
      cy.get('input[type="number"]').type('50');
    });

    // Fill income row
    cy.get('h3').contains('Incomes').next('div').within(() => {
      cy.get('input[type="text"]').first().type('Salary');
      cy.get('input[type="number"]').type('1500');
    });

    // Fill expense row
    cy.get('h3').contains('Expenses').next('div').within(() => {
      cy.get('input[type="text"]').first().type('Rent payment');
      cy.get('input[type="number"]').type('500');
    });

    // Fill week row
    cy.get('h3').contains('Weeks').next('div').within(() => {
      cy.get('input[type="date"]').type('2025-01-06');
    });

    // Fill quiz question text (required field) but mark NO option as correct
    cy.get('input[maxlength="100"]').first().type('What is a budget?');
    cy.get('[placeholder="Option 1"]').first().type('Option A');
    cy.get('[placeholder="Option 2"]').first().type('Option B');
    // Leave both checkboxes unchecked

    cy.get('button[type="submit"]').click();
    cy.contains('Select at least one correct option for this question').should('be.visible');
  });
});

describe('Module Builder Page – Successful Submission', () => {
  beforeEach(() => {
    cy.intercept('POST', `${API}/api/module/new`, {
      statusCode: 200,
      body: { message: 'Module created', id: 'mock-module-id' },
    }).as('createModule');

    cy.visit('/build');
  });

  it('submits the form and resets fields on success', () => {
    cy.get('input[name="moduleName"]').type('My Test Module');
    cy.get('textarea[name="brief"]').type('This is a brief description of the module.');

    // Mail row
    cy.get('h3').contains('Mail').next('div').within(() => {
      cy.get('input[type="text"]').eq(0).type('Repair bill');
      cy.get('input[type="text"]').eq(1).type('Workshop Ltd');
      cy.get('input[type="date"]').type('2025-01-06');
      cy.get('input[type="text"]').eq(2).type('Your bike needs repair');
      cy.get('input[type="text"]').eq(3).type('Cost is £60');
      cy.get('input[type="number"]').type('60');
    });

    // Income row
    cy.get('h3').contains('Incomes').next('div').within(() => {
      cy.get('input[type="text"]').first().type('Monthly salary');
      cy.get('input[type="number"]').type('1500');
    });

    // Expense row
    cy.get('h3').contains('Expenses').next('div').within(() => {
      cy.get('input[type="text"]').first().type('Monthly rent');
      cy.get('input[type="number"]').type('600');
    });

    // Week row
    cy.get('h3').contains('Weeks').next('div').within(() => {
      cy.get('input[type="date"]').type('2025-01-06');
    });

    // Quiz – fill question text (required) and mark one answer correct
    cy.get('input[maxlength="100"]').first().type('What is a budget?');
    cy.get('[placeholder="Option 1"]').first().type('The correct answer');
    cy.get('[placeholder="Option 2"]').first().type('A wrong answer');
    cy.get('input[type="checkbox"]').first().check();

    cy.get('button[type="submit"]').click();
    cy.wait('@createModule');

    // After success the module name should be reset
    cy.get('input[name="moduleName"]').should('have.value', '');
  });
});

describe('Module Builder Page – API Error', () => {
  beforeEach(() => {
    cy.intercept('POST', `${API}/api/module/new`, {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }).as('createModuleError');

    cy.visit('/build');
  });

  it('shows an alert on submission failure', () => {
    cy.on('window:alert', (text) => {
      expect(text).to.match(/error creating module/i);
    });

    cy.get('input[name="moduleName"]').type('Failing Module');
    cy.get('textarea[name="brief"]').type('A brief description.');

    cy.get('h3').contains('Mail').next('div').within(() => {
      cy.get('input[type="text"]').eq(0).type('Label');
      cy.get('input[type="text"]').eq(1).type('Sender');
      cy.get('input[type="date"]').type('2025-01-06');
      cy.get('input[type="text"]').eq(2).type('Subject');
      cy.get('input[type="text"]').eq(3).type('Body');
      cy.get('input[type="number"]').type('10');
    });
    cy.get('h3').contains('Incomes').next('div').within(() => {
      cy.get('input[type="text"]').first().type('Label');
      cy.get('input[type="number"]').type('1000');
    });
    cy.get('h3').contains('Expenses').next('div').within(() => {
      cy.get('input[type="text"]').first().type('Label');
      cy.get('input[type="number"]').type('100');
    });
    cy.get('h3').contains('Weeks').next('div').within(() => {
      cy.get('input[type="date"]').type('2025-01-06');
    });
    cy.get('input[maxlength="100"]').first().type('What is a budget?');
    cy.get('[placeholder="Option 1"]').first().type('Answer A');
    cy.get('[placeholder="Option 2"]').first().type('Answer B');
    cy.get('input[type="checkbox"]').first().check();

    cy.get('button[type="submit"]').click();
    cy.wait('@createModuleError');
  });
});
