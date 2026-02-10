import React from 'react'
import { Box, Button, Container, Typography, Stack, Grid, Card, CardContent } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import StarIcon from '@mui/icons-material/Star'

export default function Home({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <Box>
      <Box
        sx={{
          minHeight: { xs: '60vh', md: '72vh' },
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `linear-gradient(180deg, rgba(3,6,10,0.55), rgba(3,6,10,0.55)), url('/bgimage.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'common.white',
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Find your next stay, made simple
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Browse verified properties, book securely, and manage everything from your dashboard.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="contained" size="large" onClick={() => onNavigate('login')}>Login</Button>
                <Button variant="outlined" size="large" onClick={() => onNavigate('signup')}>Sign up</Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 6 }}>
                <img src="/bgimage.jpg" alt="hero" style={{ width: '100%', display: 'block', filter: 'brightness(0.85)' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Why users love StayMadeSimple
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <SearchIcon color="primary" sx={{ fontSize: 36 }} />
                  <Typography variant="h6">Easily discover</Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Powerful search and filters help you find properties that match your needs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <HomeWorkIcon color="primary" sx={{ fontSize: 36 }} />
                  <Typography variant="h6">Verified listings</Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Each property is verified and rated so you can book with confidence.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <StarIcon color="primary" sx={{ fontSize: 36 }} />
                  <Typography variant="h6">Simple management</Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Manage bookings, communicate with hosts, and leave reviews — all in one place.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
