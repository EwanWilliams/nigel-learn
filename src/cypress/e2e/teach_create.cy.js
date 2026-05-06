const API = 'http://localhost:3000';

const MOCK_MODULES = [
  { _id: 'module-111', title: 'Budgeting Basics' },
  { _id: 'module-222', title: 'Advanced Finance' },
];

describe('Create Classroom Page – Layout', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/module/list`, {
      statusCode: 200,
      body: MOCK_MODULES,
    }).as('listModules');

    cy.visit('/teach/create');
    cy.wait('@listModules');
  });

  it('shows the page heading', () => {
    cy.contains('h1', 'Create Classroom').should('be.visible');
  });

  it('shows the classroom label input', () => {
    cy.contains('label', 'Classroom label').should('be.visible');
    cy.get('.teacher-input').first().should('be.visible');
  });

  it('shows the module selector populated with modules from the API', () => {
    cy.get('.teacher-select').should('be.visible');
    cy.get('.teacher-select option').should('have.length', 2);
    cy.contains('option', 'Budgeting Basics').should('exist');
    cy.contains('option', 'Advanced Finance').should('exist');
  });

  it('shows the class size input with a default of 10', () => {
    cy.contains('label', 'Number of students').should('be.visible');
    cy.get('input[type="number"]').should('have.value', '10');
  });

  it('shows the Create classroom submit button', () => {
    cy.contains('button[type="submit"]', 'Create classroom').should('be.visible');
  });
});

describe('Create Classroom Page – Validation', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/module/list`, {
      statusCode: 200,
      body: MOCK_MODULES,
    }).as('listModules');

    cy.visit('/teach/create');
    cy.wait('@listModules');
  });

  it('submit button is disabled when label is empty', () => {
    cy.contains('button[type="submit"]', 'Create classroom').should('be.disabled');
  });

  it('submit button is enabled after label is entered', () => {
    cy.get('.teacher-input').first().type('Period 3');
    cy.contains('button[type="submit"]', 'Create classroom').should('not.be.disabled');
  });
});

describe('Create Classroom Page – No Modules', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/module/list`, {
      statusCode: 200,
      body: [],
    }).as('listModulesEmpty');

    cy.visit('/teach/create');
    cy.wait('@listModulesEmpty');
  });

  it('shows the no modules hint', () => {
    cy.contains('No modules found. Create a module first').should('be.visible');
  });

  it('module select is disabled when no modules exist', () => {
    cy.get('.teacher-select').should('be.disabled');
  });
});

describe('Create Classroom Page – Successful Submission', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/module/list`, {
      statusCode: 200,
      body: MOCK_MODULES,
    }).as('listModules');

    cy.intercept('POST', `${API}/api/classroom/new`, {
      statusCode: 200,
      body: { classroomId: 'new-class-789', message: 'Classroom created' },
    }).as('createClassroom');

    // Stub the subsequent classroom details fetch after redirect
    cy.intercept('GET', `${API}/api/classroom/new-class-789`, {
      statusCode: 200,
      body: { _id: 'new-class-789', label: 'Period 3', classCode: 'XYZ789', students: [] },
    }).as('getClassroom');
    cy.intercept('GET', `${API}/api/classroom/new-class-789/marks`, { statusCode: 200, body: [] }).as('getMarks');

    cy.visit('/teach/create');
    cy.wait('@listModules');
  });

  it('submits the form and redirects to the new classroom', () => {
    cy.get('.teacher-input').first().type('Period 3');
    cy.get('.teacher-select').select('Budgeting Basics');
    cy.get('input[type="number"]').clear().type('25');

    cy.contains('button[type="submit"]', 'Create classroom').click();
    cy.wait('@createClassroom');

    cy.url().should('include', '/teach/classroom/new-class-789');
  });

  it('sends correct payload to the API', () => {
    cy.get('.teacher-input').first().type('Science Class');
    cy.get('.teacher-select').select('module-222');
    cy.get('input[type="number"]').clear().type('20');

    cy.contains('button[type="submit"]', 'Create classroom').click();
    cy.wait('@createClassroom').its('request.body').should('deep.include', {
      label: 'Science Class',
      moduleId: 'module-222',
      classSize: 20,
    });
  });
});

describe('Create Classroom Page – API Error', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/module/list`, {
      statusCode: 200,
      body: MOCK_MODULES,
    }).as('listModules');

    cy.intercept('POST', `${API}/api/classroom/new`, {
      statusCode: 500,
      body: { error: 'Failed to create classroom' },
    }).as('createClassroomError');

    cy.visit('/teach/create');
    cy.wait('@listModules');
  });

  it('shows an error message when creation fails', () => {
    cy.get('.teacher-input').first().type('Period 3');
    cy.contains('button[type="submit"]', 'Create classroom').click();
    cy.wait('@createClassroomError');
    cy.get('.teacher-error').should('be.visible').and('contain', 'Failed to create classroom');
  });

  it('re-enables the submit button after a failed submission', () => {
    cy.get('.teacher-input').first().type('Period 3');
    cy.contains('button[type="submit"]', 'Create classroom').click();
    cy.wait('@createClassroomError');
    cy.contains('button[type="submit"]', 'Create classroom').should('not.be.disabled');
  });
});

describe('Create Classroom Page – Modules Load Error', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/module/list`, {
      statusCode: 503,
      body: { error: 'Service unavailable' },
    }).as('listModulesError');

    cy.visit('/teach/create');
    cy.wait('@listModulesError');
  });

  it('shows an error when modules fail to load', () => {
    cy.get('.teacher-error').should('be.visible');
  });
});
