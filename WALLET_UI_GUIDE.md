# 💰 WALLET UI - DETAILED GUIDE

## 📦 Enhanced Wallet Component

### Features Implemented

#### 1. Balance Card
- ✅ Gradient background (purple)
- ✅ Large balance display with TRY formatting
- ✅ Currency label (Türk Lirası)
- ✅ "Add Money" button
- ✅ Loading skeleton
- ✅ Icon decoration

#### 2. Add Money Modal
- ✅ React Hook Form integration
- ✅ Yup validation (min 50 TL)
- ✅ Amount input with TRY suffix
- ✅ Quick amount buttons (50, 100, 200, 500, 1000)
- ✅ Info alert (minimum notice)
- ✅ Warning alert (Stripe redirect)
- ✅ Loading state during processing

#### 3. Transaction History
- ✅ Professional table layout
- ✅ Date + Time formatting
- ✅ Description column
- ✅ Type badges (Credit/Debit)
- ✅ Amount with +/- sign
- ✅ Balance after each transaction
- ✅ Color coding (green/red)
- ✅ Icons for transaction types
- ✅ Pagination (10 items per page)
- ✅ Loading skeleton
- ✅ Empty state

---

## 🎨 UI Components

### Balance Card
```jsx
<Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
  <CardContent>
    <Typography variant="body2">Mevcut Bakiye</Typography>
    <Typography variant="h3">{formatCurrency(balance)}</Typography>
    <Typography variant="caption">Türk Lirası (TRY)</Typography>
    <Button startIcon={<Add />}>Bakiye Yükle</Button>
  </CardContent>
</Card>
```

### Currency Formatter
```javascript
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(amount)
}
// Output: "123,45 ₺"
```

### Transaction Icons
```javascript
const getTransactionIcon = (type) => {
  return type === 'credit' ? (
    <TrendingUp color="success" />
  ) : (
    <TrendingDown color="error" />
  )
}
```

---

## 📝 Form Validation (Yup)

### Schema: `walletSchemas.js`
```javascript
export const topUpSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Tutar gereklidir')
    .min(50, 'Minimum yükleme tutarı 50 TL')
    .max(10000, 'Maximum yükleme tutarı 10,000 TL')
    .typeError('Geçerli bir tutar giriniz')
})
```

### React Hook Form Integration
```javascript
const {
  register,
  handleSubmit,
  formState: { errors },
  reset,
  setValue
} = useForm({
  resolver: yupResolver(topUpSchema),
  defaultValues: {
    amount: 50
  }
})

// Form submit
const onSubmit = async (data) => {
  const response = await walletService.topUp(data.amount)
  if (response.data.data?.paymentUrl) {
    window.location.href = response.data.data.paymentUrl
  }
}
```

---

## 🔌 API Service

### `walletService.js`
```javascript
export const walletService = {
  // Get current balance
  getBalance: () => api.get('/v1/wallet/balance'),
  
  // Top up wallet (returns Stripe payment URL)
  topUp: (amount) => api.post('/v1/wallet/topup', { amount }),
  
  // Get paginated transactions
  getTransactions: (params) => api.get('/v1/wallet/transactions', { params })
}
```

### API Calls
```javascript
// Get balance
const response = await walletService.getBalance()
// Response: { data: { balance: 150.50 } }

// Top up
const response = await walletService.topUp(100)
// Response: { data: { paymentUrl: 'https://stripe.com/...' } }

// Get transactions
const response = await walletService.getTransactions({ page: 1, limit: 10 })
// Response: { 
//   data: [...],
//   pagination: { page: 1, limit: 10, total: 45, pages: 5 }
// }
```

---

## 📊 Transaction Table Structure

### Columns
1. **Tarih** - Date + Time (formatted)
2. **Açıklama** - Description text
3. **Tür** - Type badge (Credit/Debit)
4. **Tutar** - Amount with +/- sign (colored)
5. **Bakiye** - Balance after transaction

### Example Row
```javascript
{
  id: 'uuid',
  type: 'credit',              // or 'debit'
  amount: 100.00,
  balanceAfter: 250.50,
  description: 'Bakiye yükleme - Stripe',
  createdAt: '2024-12-22T10:30:00.000Z'
}
```

### Rendering
```jsx
<TableRow>
  <TableCell>
    <Typography variant="body2">
      22 Ara 2024
    </Typography>
    <Typography variant="caption" color="text.secondary">
      10:30
    </Typography>
  </TableCell>
  <TableCell>Bakiye yükleme - Stripe</TableCell>
  <TableCell>
    <TrendingUp color="success" />
    <Chip label="Yükleme" color="success" variant="outlined" />
  </TableCell>
  <TableCell align="right" sx={{ color: 'success.main' }}>
    +100,00 ₺
  </TableCell>
  <TableCell align="right">
    250,50 ₺
  </TableCell>
</TableRow>
```

---

## 🎯 Key Features

### 1. Loading States

**Balance Card Skeleton:**
```jsx
<Skeleton variant="text" width={100} height={30} />
<Skeleton variant="text" width={200} height={60} />
<Skeleton variant="rectangular" width={150} height={36} />
```

**Table Skeleton:**
```jsx
{[...Array(5)].map((_, index) => (
  <TableRow key={index}>
    <TableCell><Skeleton width={80} /></TableCell>
    <TableCell><Skeleton width={120} /></TableCell>
    <TableCell><Skeleton width={80} /></TableCell>
    <TableCell align="right"><Skeleton width={100} /></TableCell>
    <TableCell align="right"><Skeleton width={100} /></TableCell>
  </TableRow>
))}
```

### 2. Empty State
```jsx
<Box py={8} textAlign="center">
  <Receipt sx={{ fontSize: 64, color: 'text.disabled' }} />
  <Typography variant="h6" color="text.secondary">
    Henüz işlem bulunmamaktadır
  </Typography>
  <Typography variant="body2" color="text.secondary">
    Bakiye yükleyerek işlem oluşturabilirsiniz
  </Typography>
</Box>
```

### 3. Pagination
```jsx
<Pagination 
  count={totalPages} 
  page={page} 
  onChange={(e, value) => setPage(value)}
  color="primary"
/>
```

### 4. Quick Amount Selection
```jsx
{[50, 100, 200, 500, 1000].map((amount) => (
  <Button 
    onClick={() => setValue('amount', amount)}
  >
    {amount} TL
  </Button>
))}
```

---

## 🔄 Data Flow

### Initial Load
```
1. Component mounts
2. fetchWalletData() → getBalance()
3. Display balance in card
4. fetchTransactions() → getTransactions({ page: 1, limit: 10 })
5. Render table with data
```

### Top Up Flow
```
1. User clicks "Bakiye Yükle"
2. Modal opens with form
3. User enters amount (or clicks quick button)
4. Form validation (min 50 TL)
5. Submit → walletService.topUp(amount)
6. Backend creates Stripe payment intent
7. Backend returns { paymentUrl }
8. window.location.href = paymentUrl
9. User redirected to Stripe
10. After payment → webhook updates balance
11. User returns to app → sees updated balance
```

### Pagination Flow
```
1. User clicks page 2
2. setPage(2)
3. useEffect triggers
4. fetchTransactions({ page: 2, limit: 10 })
5. Table re-renders with new data
```

---

## 🧪 Test Scenarios

### Scenario 1: View Balance & History
```
1. Student logs in
2. Navigate to /wallet
3. See current balance: "150,50 ₺"
4. See transaction history table
5. 3 transactions displayed
6. Each with date, description, type, amount, balance
```

### Scenario 2: Add Money (Full Flow)
```
1. Click "Bakiye Yükle"
2. Modal opens
3. Enter amount: "100"
4. Validation: ✓ (>= 50)
5. Click "Ödemeye Geç"
6. API call: POST /v1/wallet/topup { amount: 100 }
7. Response: { paymentUrl: "https://checkout.stripe.com/..." }
8. Redirect to Stripe
9. Complete payment on Stripe
10. Stripe webhook → backend updates balance
11. User returns to /wallet
12. Balance updated: "250,50 ₺"
13. New transaction in history: "+100,00 ₺"
```

### Scenario 3: Validation Errors
```
1. Click "Bakiye Yükle"
2. Enter amount: "25"
3. Try to submit
4. Error: "Minimum yükleme tutarı 50 TL"
5. Enter amount: "15000"
6. Error: "Maximum yükleme tutarı 10,000 TL"
7. Enter text: "abc"
8. Error: "Geçerli bir tutar giriniz"
```

### Scenario 4: Pagination
```
1. User has 25 transactions
2. Page shows 10 transactions
3. Pagination: "1 2 3" (3 pages total)
4. Click page 2
5. Table updates with transactions 11-20
6. Click page 3
7. Table updates with transactions 21-25
```

### Scenario 5: Empty State
```
1. New user with no transactions
2. Navigate to /wallet
3. Balance: "0,00 ₺"
4. Transaction table shows empty state:
   - Receipt icon
   - "Henüz işlem bulunmamaktadır"
   - Help text
```

---

## 🎨 Styling Details

### Balance Card Gradient
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

### Transaction Amount Colors
```javascript
// Credit (green)
color: 'success.main'  // +100,00 ₺

// Debit (red)
color: 'error.main'    // -50,00 ₺
```

### Table Header
```jsx
<TableRow sx={{ bgcolor: 'grey.100' }}>
  <TableCell sx={{ fontWeight: 'bold' }}>Tarih</TableCell>
  ...
</TableRow>
```

---

## ✅ Implementation Checklist

### Balance Card
- [x] Gradient background
- [x] TRY currency formatting
- [x] Large typography
- [x] Icon decoration
- [x] "Add Money" button
- [x] Loading skeleton

### Add Money Modal
- [x] React Hook Form setup
- [x] Yup validation schema
- [x] Amount input field
- [x] Min 50 TL validation
- [x] Max 10,000 TL validation
- [x] Quick amount buttons
- [x] Info/Warning alerts
- [x] Submit handler
- [x] Stripe redirect
- [x] Loading state

### Transaction Table
- [x] Professional layout
- [x] 5 columns (Date, Description, Type, Amount, Balance)
- [x] Date/Time formatting
- [x] Type badges
- [x] Color-coded amounts
- [x] Icons (TrendingUp/Down)
- [x] Pagination component
- [x] Page state management
- [x] Loading skeleton
- [x] Empty state
- [x] Hover effects

### API Integration
- [x] getBalance service
- [x] topUp service
- [x] getTransactions service
- [x] Error handling
- [x] Toast notifications
- [x] Pagination params

### Form Validation
- [x] Yup schema file
- [x] Min 50 TL rule
- [x] Max 10,000 TL rule
- [x] Type validation
- [x] Error messages
- [x] Form reset after submit

---

## 📦 Files Structure

```
src/
├── pages/wallet/
│   └── Wallet.jsx                    ✅ Enhanced with all features
├── services/
│   └── walletService.js              ✅ API methods
├── validation/
│   └── walletSchemas.js              ✅ Yup validation
└── routes (App.jsx)
    └── /wallet                       ✅ Protected (student only)
```

---

## 🎉 Summary

**Enhanced Wallet UI Complete!**

**Features:**
- ✅ Beautiful gradient balance card
- ✅ Currency formatting (TRY)
- ✅ React Hook Form + Yup validation
- ✅ Quick amount buttons (50-1000)
- ✅ Professional transaction table
- ✅ Pagination (10 per page)
- ✅ Loading skeletons
- ✅ Empty state
- ✅ Color-coded amounts
- ✅ Type badges & icons
- ✅ Stripe payment redirect
- ✅ Toast notifications
- ✅ Error handling

**Files:**
- 1 page enhanced
- 1 service file
- 1 validation schema

**Ready for production! 💰**

