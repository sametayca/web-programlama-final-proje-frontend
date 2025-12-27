import { Scanner } from '@yudiel/react-qr-scanner'
import { Box, Typography, Paper } from '@mui/material'
import { useState } from 'react'

const QRScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(true)

  // Add router hooks
  const { useSearchParams } = require('react-router-dom')
  // Note: Since this file uses ES imports, we should probably check if react-router-dom is already imported or use import syntax if top level
  // Actually, let's just inspect the imports in view_file first. 
  // Assuming the file content from step 433: import { useNavigate } from 'react-router-dom' might be missing.
  // Wait, looking at step 433-like output, imports are usually at top.
  // Let me replace the entire handling logic safely.

  // The user might be scanning a URL like https://.../meals/scan?code=XYZ
  // We need to extract XYZ.

  const handleScan = (result) => {
    if (result && result[0]?.rawValue) {
      let qrContent = result[0].rawValue;

      // Attempt to extract 'code' param if it's a URL
      try {
        if (qrContent.includes('?')) {
          const urlObj = new URL(qrContent);
          const codeParam = urlObj.searchParams.get('code');
          if (codeParam) {
            qrContent = codeParam;
          }
        }
      } catch (e) {
        // Not a valid URL, treat as raw code
        console.log('Not a URL, using raw content');
      }

      setScanning(false)
      onScan(qrContent)
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

