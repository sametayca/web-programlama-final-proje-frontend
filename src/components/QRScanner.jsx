import { Scanner } from '@yudiel/react-qr-scanner'
import { Box, Typography, Paper } from '@mui/material'
import { useState } from 'react'

const QRScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(true)

  const handleScan = (result) => {
    if (result && result[0]?.rawValue) {
      setScanning(false)
      onScan(result[0].rawValue)
      // Reset after 2 seconds
      setTimeout(() => setScanning(true), 2000)
    }
  }

  const handleError = (error) => {
    console.error('QR Scan Error:', error)
    if (onError) onError(error)
  }

  return (
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        QR Kod Tarayıcı
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        QR kodu kamera önüne tutun
      </Typography>
      <Box sx={{ maxWidth: 400, mx: 'auto' }}>
        {scanning ? (
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={{
              facingMode: 'environment'
            }}
            scanDelay={500}
          />
        ) : (
          <Box sx={{ p: 4, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="h6" color="white">
              ✓ Tarandı!
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default QRScanner

