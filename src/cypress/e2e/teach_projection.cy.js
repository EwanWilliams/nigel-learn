const API = 'http://localhost:3000';
const CLASS_ID = 'proj-class-001';

const MOCK_CLASSROOM = {
  _id: CLASS_ID,
  label: 'Period 3',
  classCode: 'XYZ999',
  students: [
    { studentCode: 'A1B2' },
    { studentCode: 'C3D4' },
    { studentCode: 'E5F6' },
  ],
};

describe('Classroom Projection Page – Layout', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/classroom/${CLASS_ID}`, {
      statusCode: 200,
      body: MOCK_CLASSROOM,
    }).as('getClassroom');

    cy.visit(`/teach/classroom/projection?id=${CLASS_ID}`);
    cy.wait('@getClassroom');
  });

  it('shows the class code in the heading', () => {
    cy.contains('h1', 'Class code:').should('be.visible');
    cy.contains('XYZ999').should('be.visible');
  });

  it('renders a list item for each student code', () => {
    cy.get('ul li').should('have.length', 3);
  });

  it('shows each student hex code', () => {
    cy.contains('li', 'A1B2').should('be.visible');
    cy.contains('li', 'C3D4').should('be.visible');
    cy.contains('li', 'E5F6').should('be.visible');
  });

  it('student codes are rendered with monospace class', () => {
    cy.get('li.teacher-mono').should('have.length.at.least', 1);
  });
});

describe('Classroom Projection Page – Display Names', () => {
  beforeEach(() => {
    // Pre-seed localStorage with display names matching the classCode
    cy.intercept('GET', `${API}/api/classroom/${CLASS_ID}`, {
      statusCode: 200,
      body: MOCK_CLASSROOM,
    }).as('getClassroom');

    // Set localStorage names before the page loads.
    // The app stores names under key: names_<classCode> (see localNames.mjs)
    cy.visit('/');
    cy.window().then((win) => {
      const key = `names_${MOCK_CLASSROOM.classCode}`;
      win.localStorage.setItem(key, JSON.stringify({ A1B2: 'Alice', C3D4: 'Bob' }));
    });

    cy.visit(`/teach/classroom/projection?id=${CLASS_ID}`);
    cy.wait('@getClassroom');
  });

  it('shows display names next to student codes when stored in localStorage', () => {
    cy.contains('li', 'Alice').should('be.visible');
    cy.contains('li', 'Bob').should('be.visible');
  });

  it('does not show a name for students without a stored name', () => {
    // E5F6 has no name – only the code should appear, no colon or name text
    cy.get('ul li').eq(2).should('contain.text', 'E5F6').and('not.contain.text', ':');
  });
});

describe('Classroom Projection Page – Loading & Error States', () => {
  it('shows a loading indicator while fetching', () => {
    // Use a static delayed response – avoids ECONNREFUSED when the backend isn't running
    cy.intercept('GET', `${API}/api/classroom/${CLASS_ID}`, {
      delay: 600,
      statusCode: 200,
      body: MOCK_CLASSROOM,
    }).as('slowClassroom');

    cy.visit(`/teach/classroom/projection?id=${CLASS_ID}`);
    cy.contains('Loading').should('be.visible');
    cy.wait('@slowClassroom');
  });

  it('shows an error message when the classroom fails to load', () => {
    cy.intercept('GET', `${API}/api/classroom/${CLASS_ID}`, {
      statusCode: 404,
      body: { error: 'Classroom not found' },
    }).as('notFound');

    cy.visit(`/teach/classroom/projection?id=${CLASS_ID}`);
    cy.wait('@notFound');
    cy.get('.teacher-error').should('be.visible').and('contain', 'Classroom not found');
  });

  it('shows nothing when no id query param is provided', () => {
    cy.visit('/teach/classroom/projection');
    cy.get('h1').should('not.exist');
    cy.get('ul').should('not.exist');
  });
});

describe('Classroom Projection Page – Empty Class', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/api/classroom/${CLASS_ID}`, {
      statusCode: 200,
      body: { ...MOCK_CLASSROOM, students: [] },
    }).as('getEmptyClassroom');

    cy.visit(`/teach/classroom/projection?id=${CLASS_ID}`);
    cy.wait('@getEmptyClassroom');
  });

  it('renders no list items when classroom has no students', () => {
    cy.get('ul li').should('have.length', 0);
  });

  it('still shows the class code heading', () => {
    cy.contains('XYZ999').should('be.visible');
  });
});
