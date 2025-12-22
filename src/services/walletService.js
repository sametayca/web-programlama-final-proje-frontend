import api from './api'

export const walletService = {
  // Get wallet balance
  getBalance: () => api.get('/v1/wallet/balance'),
  
  // Top up wallet (create Stripe payment intent)
  topUp: (amount) => api.post('/v1/wallet/topup', { amount }),
  
  // Get transaction history with pagination
  getTransactions: (params) => api.get('/v1/wallet/transactions', { params })
}

export default walletService

