describe('Dashboard Navigation', () => {
  beforeEach(() => {
    // This test requires a logged-in user
    // You would need to either:
    // 1. Use cy.login() command with valid credentials
    // 2. Mock the authentication state
    cy.clearStorage()
  })

  it('should redirect to login when not authenticated', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  // Uncomment these tests when you have valid test credentials
  /*
  it('should display dashboard after login', () => {
    cy.login('test@example.com', 'TestPassword123')
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })

  it('should navigate to profile page', () => {
    cy.login('test@example.com', 'TestPassword123')
    cy.contains('Profil').click()
    cy.url().should('include', '/profile')
  })

  it('should navigate to courses page', () => {
    cy.login('test@example.com', 'TestPassword123')
    cy.contains('Dersler').click()
    cy.url().should('include', '/courses')
  })

  it('should logout successfully', () => {
    cy.login('test@example.com', 'TestPassword123')
    cy.logout()
  })
  */
})




