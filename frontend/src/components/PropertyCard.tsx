import React from 'react'
import { Card, CardContent, Typography, Box, CardMedia, Button } from '@mui/material'

export default function PropertyCard({ property }: { property: any }) {
  const photos: string[] = property.photos ?? (property.images ?? (property.image_url ? [property.image_url] : []))
  return (
    <Card>
      {photos && photos.length > 0 ? (
        <Box>
          <CardMedia component="img" height="160" image={photos[0]} alt={property.address} />
          <Box sx={{ display: 'flex', gap: 0.5, p: 1 }}>
            {photos.slice(0, 3).map((src, i) => (
              <Box key={i} sx={{ width: 56, height: 40, bgcolor: 'action.hover', overflow: 'hidden', borderRadius: 1 }}>
                <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`thumb-${i}`} />
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ height: 160, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No photos</Typography>
        </Box>
      )}
      <CardContent>
        <Typography variant="subtitle1">{property.property_description ?? property.address ?? 'Property'}</Typography>
        <Typography variant="body2" color="text.secondary">{property.city ?? ''}</Typography>
        {property.average_rent !== undefined && property.average_rent !== null && (
          <Typography variant="h6" sx={{ mt: 1 }}>
            Avg rent: {Math.round(property.average_rent).toLocaleString()} / month
          </Typography>
        )}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button size="small">View</Button>
          <Button variant="contained" size="small">Book</Button>
        </Box>
      </CardContent>
    </Card>
  )
}
