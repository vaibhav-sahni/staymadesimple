import React, { useEffect, useState } from 'react'
import { Typography, Grid, Card, CardContent, Box, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { getMyBookings, getCustomerBookingsWithStatus, getOwnerBookingsActive, getOwnerBookingsCompleted } from '../../api'

type Props = { role?: string }

export default function BookingsPage({ role }: Props) {
  const [bookings, setBookings] = useState<any[] | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        let data: any[] = []
        if (role === 'Owner') {
          if (filter === 'active') data = await getOwnerBookingsActive()
          else if (filter === 'completed') data = await getOwnerBookingsCompleted()
          else data = await getMyBookings()
        } else {
          // customer
          if (filter === 'active') data = await getCustomerBookingsWithStatus('Active')
          else if (filter === 'completed') data = await getCustomerBookingsWithStatus('Completed')
          else data = await getCustomerBookingsWithStatus()
        }
        if (mounted) setBookings(Array.isArray(data) ? data : [])
      } catch (e) {
        if (mounted) setBookings([])
      }
    }
    load()
    return () => { mounted = false }
  }, [role, filter])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Bookings</Typography>
        <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="completed">Completed</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2}>
        {(bookings ?? []).map((bk) => (
          <Grid item xs={12} key={bk.booking_id ?? bk.id}>
            <Card>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1">{bk.property_id ? `${bk.property_id} — ${bk.room_number}` : bk.room_number ?? 'Booking'}</Typography>
                  <Typography variant="body2" color="text.secondary">{bk.start_date} → {bk.end_date}</Typography>
                  <Typography variant="body2" color="text.secondary">Guest: {bk.customer_name ?? bk.customer_id}</Typography>
                </Box>
                <Box>
                  <Typography color={bk.booking_status === 'Active' ? 'success.main' : bk.booking_status === 'Cancelled' ? 'error.main' : 'text.primary'}>{bk.booking_status}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {bookings && bookings.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary">No bookings found for the selected filter.</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
