import React, { useState, useEffect } from 'react'
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HomeIcon from '@mui/icons-material/Home'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import BusinessIcon from '@mui/icons-material/Business'
import PeopleIcon from '@mui/icons-material/People'
// removed revenue stat icon
import Inventory2Icon from '@mui/icons-material/Inventory2'
import EventNoteIcon from '@mui/icons-material/EventNote'
import StatCard from './StatCard'
import { getMyProperties, getActiveBookingsForProperty, getActiveBookingsForOwner, getMyBookings } from '../api'
import PropertiesPage from '../pages/dashboard/PropertiesPage'
import BookingsPage from '../pages/dashboard/BookingsPage'
import UsersPage from '../pages/dashboard/UsersPage'

type User = { user_id: number; email: string; role: string }

export default function DashboardLayout({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selected, setSelected] = useState<string>('overview')
  const [propsCount, setPropsCount] = useState<number | null>(null)
  const [activeBookingsCount, setActiveBookingsCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)

  useEffect(() => {
    let mounted = true
    async function loadMetrics() {
      setLoading(true)
      try {
        if (user.role === 'Owner') {
          const props: any[] = await getMyProperties()
          if (!mounted) return
          setPropsCount(props.length)
          // fetch active bookings from backend (owner-level)
          try {
            const bookings: any[] = await getActiveBookingsForOwner()
            if (!mounted) return
            setActiveBookingsCount(Array.isArray(bookings) ? bookings.length : 0)
          } catch (e) {
            // fallback to per-property fetch if backend endpoint missing
            const bookingsArrays = await Promise.all(props.map((p) => getActiveBookingsForProperty(p.property_id)))
            if (!mounted) return
            const totalActive = bookingsArrays.reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0)
            setActiveBookingsCount(totalActive)
          }
        } else {
          // for non-owners, we could fetch global counts or user-specific data
          setPropsCount(0)
          setActiveBookingsCount(0)
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadMetrics()
    return () => { mounted = false }
  }, [user])

  const commonItems = [
    { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
    { id: 'profile', label: 'Profile', icon: <AccountCircleIcon /> },
  ]

  const roleItems = user.role === 'Admin'
    ? [{ id: 'users', label: 'Users', icon: <PeopleIcon /> }, { id: 'bookings', label: 'Bookings', icon: <HomeIcon /> }]
    : user.role === 'Owner'
    ? [{ id: 'properties', label: 'My Properties', icon: <BusinessIcon /> }, { id: 'bookings', label: 'Bookings', icon: <HomeIcon /> }]
    : [{ id: 'explore', label: 'Explore', icon: <HomeIcon /> }, { id: 'mybookings', label: 'My Bookings', icon: <HomeIcon /> }]

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6">Dashboard</Typography>
      </Toolbar>
      <Divider />
      <List>
        {commonItems.map((it) => (
          <ListItem key={it.id} disablePadding>
            <ListItemButton selected={selected === it.id} onClick={() => setSelected(it.id)}>
              <ListItemIcon>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {roleItems.map((it) => (
          <ListItem key={it.id} disablePadding>
            <ListItemButton selected={selected === it.id} onClick={() => setSelected(it.id)}>
              <ListItemIcon>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Button variant="outlined" color="inherit" fullWidth onClick={onLogout}>Logout</Button>
      </Box>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            StayMadeSimple — {user.role}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 } }} open>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Toolbar />

        {selected === 'overview' && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <StatCard title="Active listings" value={propsCount ?? '—'} subtitle="Your published properties" icon={<Inventory2Icon />} />
              </Grid>
              <Grid item xs={12} md={6}>
                <StatCard title="Active bookings" value={activeBookingsCount ?? '—'} subtitle="Currently active" icon={<EventNoteIcon />} />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6">Recent activity</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Recent bookings and messages will appear here.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6">Quick actions</Typography>
                    <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
                      <Button variant="contained">Create Property</Button>
                      <Button variant="outlined">View Bookings</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {selected === 'profile' && (
          <>
            <Typography variant="h6">Profile</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>{JSON.stringify(user)}</Typography>
          </>
        )}

        {selected === 'users' && <UsersPage />}
        {selected === 'bookings' && <BookingsPage role={user.role} />}
        {selected === 'properties' && <PropertiesPage />}
        {selected === 'explore' && (
          <>
            <Typography variant="h6">Explore</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Browse available properties and listings.</Typography>
          </>
        )}
        {selected === 'mybookings' && <BookingsPage role={user.role} />}
      </Box>
    </Box>
  )
}
