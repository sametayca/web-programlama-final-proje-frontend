describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearStorage()
  })

  it('should display login page', () => {
    cy.visit('/login')
    cy.contains('Giriş Yap').should('be.visible')
    cy.get('input[id="email"]').should('be.visible')
    cy.get('input[id="password"]').should('be.visible')
  })

  it('should show validation errors for empty login form', () => {
    cy.visit('/login')
    cy.get('button[type="submit"]').click()
    cy.contains('E-posta zorunludur').should('be.visible')
    cy.contains('Şifre zorunludur').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.visit('/login')
    cy.get('input[id="email"]').type('invalid@example.com')
    cy.get('input[id="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    // Toast or error message should appear
    cy.contains(/Geçersiz e-posta veya şifre|Invalid credentials/i, { timeout: 5000 })
  })

  it('should navigate to register page', () => {
    cy.visit('/login')
    cy.contains(/Kayıt Ol|Hesap oluştur/i).click()
    cy.url().should('include', '/register')
    cy.contains(/Kayıt Ol|Register/i).should('be.visible')
  })

  it('should navigate to forgot password page', () => {
    cy.visit('/login')
    cy.contains(/Şifremi Unuttum|Forgot Password/i).click()
    cy.url().should('include', '/forgot-password')
  })
})

describe('Registration Flow', () => {
  beforeEach(() => {
    cy.clearStorage()
    cy.visit('/register')
  })

  it('should display registration form', () => {
    cy.contains(/Kayıt Ol|Register/i).should('be.visible')
  })

  it('should show validation errors for incomplete form', () => {
    cy.get('button[type="submit"]').click()
    // Multiple validation errors should appear
  })

  it('should navigate back to login', () => {
    cy.contains(/Giriş Yap|Login/i).click()
    cy.url().should('include', '/login')
  })
})

