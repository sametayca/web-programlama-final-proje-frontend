describe('Course Catalog', () => {
  beforeEach(() => {
    cy.clearStorage()
  })

  it('should require authentication to view courses', () => {
    cy.visit('/courses')
    cy.url().should('include', '/login')
  })

  // Uncomment when you have valid test credentials
  /*
  it('should display course catalog', () => {
    cy.login('test@example.com', 'TestPassword123')
    cy.visit('/courses')
    cy.contains('Ders Kataloğu').should('be.visible')
  })

  it('should search for courses', () => {
    cy.login('test@example.com', 'TestPassword123')
    cy.visit('/courses')
    cy.get('input[placeholder*="Ara"]').type('CSE')
    cy.get('.course-card').should('have.length.greaterThan', 0)
  })

  it('should filter courses by department', () => {
    cy.login('test@example.com', 'TestPassword123')
    cy.visit('/courses')
    cy.get('select').select('Computer Science')
    cy.get('.course-card').should('have.length.greaterThan', 0)
  })

  it('should view course details', () => {
    cy.login('test@example.com', 'TestPassword123')
    cy.visit('/courses')
    cy.get('.course-card').first().click()
    cy.url().should('include', '/courses/')
    cy.contains('Ders Bilgileri').should('be.visible')
  })
  */
})



