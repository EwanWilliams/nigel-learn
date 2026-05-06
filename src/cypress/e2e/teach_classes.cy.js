const API = 'http://localhost:3000';

const MOCK_CLASSES = [
  { _id: 'class-abc-123', label: 'Period 3', completed: 5, total: 10 },
  { _id: 'class-def-456', label: 'Period 5', completed: 0, total: 15 },
];

describe('Teacher Classes Page – Layout', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/classroom/userClasses/*`, {
      statusCode: 200,
      body: MOCK_CLASSES,
    }).as('getClasses');

    cy.visit('/teach/classes');
    cy.wait('@getClasses');
  });

  it('shows the page heading', () => {
    cy.contains('h1', 'My Classes').should('be.visible');
  });

  it('shows the create classroom button', () => {
    cy.contains('button', '+ Create a classroom').should('be.visible');
  });

  it('navigates to /teach/create when create button is clicked', () => {
    cy.intercept('GET', `${API}/api/module/list`, { statusCode: 200, body: [] }).as('listModules');
    cy.contains('button', '+ Create a classroom').click();
    cy.url().should('include', '/teach/create');
  });

  it('shows the hint text', () => {
    cy.contains('Open a class to view students and live marks').should('be.visible');
  });
});

describe('Teacher Classes Page – Classes List', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/classroom/userClasses/*`, {
      statusCode: 200,
      body: MOCK_CLASSES,
    }).as('getClasses');

    cy.visit('/teach/classes');
    cy.wait('@getClasses');
  });

  it('renders a table with class data', () => {
    cy.get('.teacher-table').should('be.visible');
    cy.contains('td', 'Period 3').should('be.visible');
    cy.contains('td', 'Period 5').should('be.visible');
  });

  it('shows completed/total counts', () => {
    cy.contains('td', '5/10').should('be.visible');
    cy.contains('td', '0/15').should('be.visible');
  });

  it('each row has an Open button', () => {
    cy.get('.teacher-table tbody tr').should('have.length', 2);
    cy.get('.teacher-table tbody').find('button').filter(':contains("Open")').should('have.length', 2);
  });

  it('clicking Open navigates to the classroom detail page', () => {
    cy.intercept('GET', `${API}/api/classroom/class-abc-123`, {
      statusCode: 200,
      body: { _id: 'class-abc-123', label: 'Period 3', classCode: 'ABC123', students: [] },
    }).as('getClassroom');
    cy.intercept('GET', `${API}/api/classroom/class-abc-123/marks`, { statusCode: 200, body: [] }).as('getMarks');

    cy.get('.teacher-table tbody tr').first().contains('button', 'Open').click();
    cy.url().should('include', '/teach/classroom/class-abc-123');
  });
});

describe('Teacher Classes Page – Empty State', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/classroom/userClasses/*`, {
      statusCode: 200,
      body: [],
    }).as('getClassesEmpty');

    cy.visit('/teach/classes');
    cy.wait('@getClassesEmpty');
  });

  it('shows the empty state message', () => {
    cy.contains('No classes loaded yet').should('be.visible');
  });

  it('does not show a table when no classes exist', () => {
    cy.get('.teacher-table').should('not.exist');
  });
});

describe('Teacher Classes Page – API Error', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/classroom/userClasses/*`, {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('getClassesError');

    cy.visit('/teach/classes');
    cy.wait('@getClassesError');
  });

  it('shows an error message', () => {
    cy.get('.teacher-error').should('be.visible');
  });
});
