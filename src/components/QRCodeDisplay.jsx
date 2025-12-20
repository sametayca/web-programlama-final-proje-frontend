import { QRCodeSVG } from 'qrcode.react'
import { Box, Paper, Typography } from '@mui/material'

const QRCodeDisplay = ({ value, size = 256, title = 'QR Kod' }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        borderRadius: 3
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
        {title}
      </Typography>
      <Box
        sx={{
          p: 2,
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={true}
          imageSettings={{
            excavate: true,
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" align="center">
        QR kodu okutarak yoklama verebilirsiniz
      </Typography>
    </Paper>
  )
}

export default QRCodeDisplay

