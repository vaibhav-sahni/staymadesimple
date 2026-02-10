import React, { useEffect, useState } from 'react'
import { Typography, Grid, Card, CardContent, Box, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { getMyProperties, getPropertyRooms } from '../../api'

export default function PropertiesPage() {
  const [propsList, setPropsList] = useState<any[] | null>(null)
  const [roomsMap, setRoomsMap] = useState<Record<number, any[]>>({})

  useEffect(() => {
    let mounted = true
    getMyProperties()
      .then((p) => { if (mounted) setPropsList(Array.isArray(p) ? p : []) })
      .catch(() => { if (mounted) setPropsList([]) })
    return () => { mounted = false }
  }, [])

  async function loadRooms(propertyId: number) {
    if (roomsMap[propertyId]) return
    try {
      const rooms: any[] = await getPropertyRooms(propertyId)
      setRoomsMap((m) => ({ ...m, [propertyId]: Array.isArray(rooms) ? rooms : [] }))
    } catch (e) {
      setRoomsMap((m) => ({ ...m, [propertyId]: [] }))
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>My Properties</Typography>
      <Grid container spacing={2}>
        {(propsList ?? []).map((p) => (
          <Grid item xs={12} md={12} key={p.property_id ?? p.id}>
            <Accordion onChange={(_, expanded) => expanded && loadRooms(p.property_id)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">{p.property_description ?? p.address ?? 'Untitled'}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.city ?? ''} — {p.address ?? ''}</Typography>
                </Box>
                <Chip label={p.verification_status ?? 'Unknown'} size="small" sx={{ ml: 2 }} />
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="subtitle2">Rooms</Typography>
                  {(roomsMap[p.property_id] ?? []).map((r) => (
                    <Card key={r.room_id} sx={{ mb: 1 }}>
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography>{r.room_number}</Typography>
                          <Typography variant="body2" color="text.secondary">Rent: {r.rent_per_month}</Typography>
                        </Box>
                        <Box>
                          {r.is_booked ? <Chip label={r.availability_text ?? 'Booked'} color="error" /> : <Chip label="Available" color="success" />}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                  {(roomsMap[p.property_id] ?? []).length === 0 && (
                    <Typography color="text.secondary">No rooms or unable to load rooms.</Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
        {propsList && propsList.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary">You have no properties yet.</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
