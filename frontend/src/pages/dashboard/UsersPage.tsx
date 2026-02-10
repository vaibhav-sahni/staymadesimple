import React from 'react'
import { Typography, Box } from '@mui/material'

export default function UsersPage() {
  return (
    <Box>
      <Typography variant="h6">User Management</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Admin tools will appear here. Implement server-side admin endpoints to list and manage users.
      </Typography>
    </Box>
  )
}
