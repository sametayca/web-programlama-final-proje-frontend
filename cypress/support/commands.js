// ***********************************************
// Custom commands for Cypress testing
// ***********************************************

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('input[id="email"]').type(email)
  cy.get('input[id="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.contains('Çıkış Yap').click()
  cy.url().should('include', '/login')
})

// Check if user is logged in
Cypress.Commands.add('checkLoggedIn', () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem('token')).to.exist
  })
})

// Clear all storage
Cypress.Commands.add('clearStorage', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})




