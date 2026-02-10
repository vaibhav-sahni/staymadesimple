import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'

export default function StatCard({ title, value, subtitle, icon }: { title: string; value: React.ReactNode; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ ml: 2, color: 'primary.main' }}>{icon}</Box>
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
