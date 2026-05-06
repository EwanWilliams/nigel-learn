describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the page title and tagline', () => {
    cy.contains('h1', 'Budgeting simulation for the classroom').should('be.visible');
    cy.contains('.routeBadge', 'Student Bank').should('be.visible');
    cy.contains('p', 'Students can join the simulation').should('be.visible');
  });

  it('shows three navigation links', () => {
    cy.contains('a', 'Join Classroom').should('be.visible');
    cy.contains('a', 'Teacher Login').should('be.visible');
    cy.contains('a', 'Module Builder').should('be.visible');
  });

  it('"Join Classroom" navigates to /study', () => {
    cy.contains('a', 'Join Classroom').click();
    cy.url().should('include', '/study');
  });

  it('"Teacher Login" navigates to /teach/classes', () => {
    cy.contains('a', 'Teacher Login').click();
    cy.url().should('include', '/teach/classes');
  });

  it('"Module Builder" navigates to /build', () => {
    cy.contains('a', 'Module Builder').click();
    cy.url().should('include', '/build');
  });

  it('/teach redirects to /teach/classes', () => {
    cy.visit('/teach');
    cy.url().should('include', '/teach/classes');
  });

  it('unknown routes redirect back to landing page', () => {
    cy.visit('/this-route-does-not-exist');
    cy.contains('h1', 'Budgeting simulation for the classroom').should('be.visible');
  });

  it('links have correct href attributes', () => {
    cy.contains('a', 'Join Classroom').should('have.attr', 'href', '/study');
    cy.contains('a', 'Teacher Login').should('have.attr', 'href', '/teach/classes');
    cy.contains('a', 'Module Builder').should('have.attr', 'href', '/build');
  });
});
