const API = 'http://localhost:3000';
const CLASS_ID = 'class-test-001';

const MOCK_CLASSROOM = {
  _id: CLASS_ID,
  label: 'Period 3',
  classCode: 'ABC123',
  students: [
    { studentCode: 'A1B2' },
    { studentCode: 'C3D4' },
    { studentCode: 'E5F6' },
  ],
};

const MOCK_MARKS = [
  { studentCode: 'A1B2', mark: 85, completedAt: '2025-01-15T10:30:00.000Z' },
  { studentCode: 'C3D4', mark: 72, completedAt: '2025-01-15T11:00:00.000Z' },
  { studentCode: 'E5F6', mark: null, completedAt: null },
];

function interceptAll(classroomBody = MOCK_CLASSROOM, marksBody = MOCK_MARKS) {
  cy.intercept('GET', `${API}/api/classroom/${CLASS_ID}`, {
    statusCode: 200,
    body: classroomBody,
  }).as('getClassroom');

  cy.intercept('GET', `${API}/api/classroom/${CLASS_ID}/marks`, {
    statusCode: 200,
    body: marksBody,
  }).as('getMarks');
}

describe('Classroom Details Page – Layout', () => {
  beforeEach(() => {
    interceptAll();
    cy.visit(`/teach/classroom/${CLASS_ID}`);
    cy.wait('@getClassroom');
    cy.wait('@getMarks');
  });

  it('shows the page heading', () => {
    cy.contains('h1', 'Classroom Details').should('be.visible');
  });

  it('shows the classroom label', () => {
    cy.contains('Period 3').should('be.visible');
  });

  it('shows the class code', () => {
    cy.contains('ABC123').should('be.visible');
  });

  it('shows the "Display codes to students" button', () => {
    cy.contains('button', 'Display codes to students').should('be.visible');
  });

  it('shows the Students section heading', () => {
    cy.contains('h3', 'Students').should('be.visible');
  });

  it('shows the Live Marks section heading', () => {
    cy.contains('h3', 'Live Marks').should('be.visible');
  });

  it('shows download names file button', () => {
    cy.contains('button', 'Download names file').should('be.visible');
  });

  it('shows download marks CSV button', () => {
    cy.contains('button', 'Download marks (CSV)').should('be.visible');
  });

  it('shows the Refresh now button', () => {
    cy.contains('button', 'Refresh now').should('be.visible');
  });
});

describe('Classroom Details Page – Students Table', () => {
  beforeEach(() => {
    interceptAll();
    cy.visit(`/teach/classroom/${CLASS_ID}`);
    cy.wait('@getClassroom');
    cy.wait('@getMarks');
  });

  it('renders a row for each student', () => {
    cy.get('.teacher-table').first().find('tbody tr').should('have.length', 3);
  });

  it('shows student hex codes', () => {
    cy.contains('td', 'A1B2').should('be.visible');
    cy.contains('td', 'C3D4').should('be.visible');
    cy.contains('td', 'E5F6').should('be.visible');
  });

  it('shows a name input for each student', () => {
    cy.get('.teacher-table').first().find('input.teacher-input').should('have.length', 3);
  });

  it('entering a name persists in the input field', () => {
    cy.get('.teacher-table').first().find('tbody tr').first().find('input').type('Sam');
    cy.get('.teacher-table').first().find('tbody tr').first().find('input').should('have.value', 'Sam');
  });
});

describe('Classroom Details Page – Live Marks Table', () => {
  beforeEach(() => {
    interceptAll();
    cy.visit(`/teach/classroom/${CLASS_ID}`);
    cy.wait('@getClassroom');
    cy.wait('@getMarks');
  });

  it('renders a row for each mark', () => {
    // The marks table is the second .teacher-table on the page
    cy.get('.teacher-table').eq(1).find('tbody tr').should('have.length', 3);
  });

  it('shows the student code column', () => {
    cy.get('.teacher-table').eq(1).contains('td', 'A1B2').should('be.visible');
  });

  it('shows numeric mark values', () => {
    cy.get('.teacher-table').eq(1).contains('td', '85').should('be.visible');
    cy.get('.teacher-table').eq(1).contains('td', '72').should('be.visible');
  });

  it('shows "Not completed" for students with no completedAt', () => {
    cy.get('.teacher-table').eq(1).contains('td', 'Not completed').should('be.visible');
  });

  it('shows a formatted completion date for completed students', () => {
    // At least one td should contain a date string (not "Not completed")
    cy.get('.teacher-table').eq(1).find('tbody tr').first().find('td').last().invoke('text').should('not.equal', 'Not completed');
  });
});

describe('Classroom Details Page – Refresh Marks', () => {
  beforeEach(() => {
    interceptAll();
    cy.visit(`/teach/classroom/${CLASS_ID}`);
    cy.wait('@getClassroom');
    cy.wait('@getMarks');
  });

  it('clicking "Refresh now" triggers a new marks request', () => {
    cy.intercept('GET', `${API}/api/classroom/${CLASS_ID}/marks`, {
      statusCode: 200,
      body: MOCK_MARKS,
    }).as('refreshMarks');

    cy.contains('button', 'Refresh now').click();
    cy.wait('@refreshMarks');
  });

  it('shows the last updated time after refresh', () => {
    cy.contains('button', 'Refresh now').click();
    cy.get('.teacher-hint').should('contain.text', 'Last updated:');
  });
});

describe('Classroom Details Page – Loading & Error States', () => {
  it('shows a loading indicator while fetching', () => {
    // Use a static delayed response – avoids ECONNREFUSED when the backend isn't running
    cy.intercept('GET', `${API}/api/classroom/${CLASS_ID}`, {
      delay: 600,
      statusCode: 200,
      body: MOCK_CLASSROOM,
    }).as('slowClassroom');
    cy.intercept('GET', `${API}/api/classroom/${CLASS_ID}/marks`, { statusCode: 200, body: [] }).as('getMarks');

    cy.visit(`/teach/classroom/${CLASS_ID}`);
    cy.contains('Loading classroom').should('be.visible');
    cy.wait('@slowClassroom');
  });

  it('shows an error when the classroom fails to load', () => {
    cy.intercept('GET', `${API}/api/classroom/${CLASS_ID}`, {
      statusCode: 404,
      body: { error: 'Classroom not found' },
    }).as('notFound');

    cy.visit(`/teach/classroom/${CLASS_ID}`);
    cy.wait('@notFound');
    cy.get('.teacher-error').should('be.visible').and('contain', 'Classroom not found');
  });
});

describe('Classroom Details Page – Projection Link', () => {
  beforeEach(() => {
    interceptAll();
    cy.visit(`/teach/classroom/${CLASS_ID}`);
    cy.wait('@getClassroom');
    cy.wait('@getMarks');
  });

  it('"Display codes to students" opens the projection page in a new tab', () => {
    // Stub window.open to prevent actually opening a new tab
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });

    cy.contains('button', 'Display codes to students').click();
    cy.get('@windowOpen').should('have.been.calledWithMatch', /teach\/classroom\/projection/);
  });
});
