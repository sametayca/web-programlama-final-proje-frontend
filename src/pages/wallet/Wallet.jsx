import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Pagination,
  Skeleton,
  Divider,
  InputAdornment
} from '@mui/material'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import walletService from '../../services/walletService'
import { topUpSchema } from '../../validation/walletSchemas'
import { 
  AccountBalanceWallet, 
  Add, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Receipt
} from '@mui/icons-material'

const Wallet = () => {
  const [balance, setBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [topUpDialog, setTopUpDialog] = useState(false)
  const [processing, setProcessing] = useState(false)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  // React Hook Form
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

  useEffect(() => {
    fetchWalletData()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [page])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const balanceRes = await walletService.getBalance()
      setBalance(balanceRes.data.data.balance)
    } catch (err) {
      setError(err.response?.data?.error || 'Bakiye yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true)
      const response = await walletService.getTransactions({ 
        page, 
        limit 
      })
      
      setTransactions(response.data.data || [])
      
      // Calculate total pages from pagination info
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages || 1)
      }
    } catch (err) {
      console.error('Transactions fetch error:', err)
    } finally {
      setTransactionsLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setProcessing(true)
      
      // Direct balance top-up (no Stripe)
      const response = await walletService.devTopUp(data.amount)
      
      if (response.data.success) {
        toast.success(`${data.amount} TL bakiye başarıyla eklendi!`)
        setTopUpDialog(false)
        reset()
        fetchWalletData()
        fetchTransactions()
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Bakiye yükleme başarısız'
      toast.error(errorMessage)
      console.error('Top-up error:', err)
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getTransactionIcon = (type) => {
    return type === 'credit' ? (
      <TrendingUp color="success" />
    ) : (
      <TrendingDown color="error" />
    )
  }

  const getTransactionColor = (type) => {
    return type === 'credit' ? 'success' : 'error'
  }

  const handleQuickAmount = (amount) => {
    setValue('amount', amount)
  }

  const renderBalanceCard = () => {
    if (loading) {
      return (
        <Card elevation={4}>
          <CardContent sx={{ py: 4 }}>
            <Skeleton variant="text" width={100} height={30} />
            <Skeleton variant="text" width={200} height={60} sx={{ mt: 1 }} />
            <Skeleton variant="rectangular" width={150} height={36} sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      )
    }

    return (
      <Card 
        elevation={4}
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <CardContent sx={{ py: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Mevcut Bakiye
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {formatCurrency(balance || 0)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                Türk Lirası (TRY)
              </Typography>
            </Box>
            <AccountBalanceWallet sx={{ fontSize: 72, opacity: 0.3 }} />
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setTopUpDialog(true)}
            sx={{ 
              mt: 3, 
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Bakiye Yükle
          </Button>
        </CardContent>
      </Card>
    )
  }

  const renderTransactionsTable = () => {
    if (transactionsLoading && transactions.length === 0) {
      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell align="right"><Skeleton width={100} /></TableCell>
                <TableCell align="right"><Skeleton width={100} /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={120} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell align="right"><Skeleton width={100} /></TableCell>
                  <TableCell align="right"><Skeleton width={100} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    }

    if (transactions.length === 0) {
      return (
        <Box py={8} textAlign="center">
          <Receipt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Henüz işlem bulunmamaktadır
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bakiye yükleyerek veya yemek rezervasyonu yaparak işlem oluşturabilirsiniz
          </Typography>
        </Box>
      )
    }

    return (
      <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Açıklama</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tür</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Tutar</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bakiye</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(tx.createdAt).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(tx.createdAt).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {tx.description || 'İşlem'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getTransactionIcon(tx.type)}
                      <Chip 
                        label={tx.type === 'credit' ? 'Yükleme' : 'Harcama'}
                        size="small"
                        color={getTransactionColor(tx.type)}
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      color: tx.type === 'credit' ? 'success.main' : 'error.main',
                      fontWeight: 'bold'
                    }}
                  >
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(tx.balanceAfter)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </>
    )
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Cüzdanım
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Bakiyenizi yönetin ve işlem geçmişinizi görüntüleyin
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Balance Card */}
        <Box mb={4}>
          {renderBalanceCard()}
        </Box>

        {/* Transactions */}
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                İşlem Geçmişi
              </Typography>
              {transactions.length > 0 && (
                <Chip 
                  label={`${transactions.length} işlem`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            {renderTransactionsTable()}
          </CardContent>
        </Card>

        {/* Top Up Dialog */}
        <Dialog 
          open={topUpDialog} 
          onClose={() => !processing && setTopUpDialog(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <CreditCard color="primary" />
                <Typography variant="h6">Bakiye Yükle</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Alert severity="info" sx={{ mb: 3 }}>
                Minimum yükleme tutarı 50 TL'dir. Seçtiğiniz tutar bakiyenize eklenecektir.
              </Alert>
              
              <TextField
                fullWidth
                type="number"
                label="Yüklenecek Tutar"
                {...register('amount')}
                error={!!errors.amount}
                helperText={errors.amount?.message}
                InputProps={{
                  endAdornment: <InputAdornment position="end">TRY</InputAdornment>,
                  inputProps: { 
                    min: 50, 
                    step: 10 
                  }
                }}
                sx={{ mb: 2 }}
              />

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Hızlı seçim:
                </Typography>
                <Grid container spacing={1}>
                  {[50, 100, 200, 500, 1000].map((amount) => (
                    <Grid item key={amount}>
                      <Button 
                        size="small"
                        variant="outlined"
                        onClick={() => handleQuickAmount(amount)}
                      >
                        {amount} TL
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>

            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setTopUpDialog(false)}
                disabled={processing}
              >
                İptal
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                disabled={processing}
                startIcon={processing ? <CircularProgress size={20} /> : <CreditCard />}
              >
                {processing ? 'Yükleniyor...' : 'Bakiye Yükle'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default Wallet
