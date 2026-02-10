import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function login(email: string, password: string) {
  const res = await client.post('/login', { email, password })
  return res.data
}

export async function me() {
  const res = await client.get('/me')
  return res.data
}

export async function signup(payload: { email: string; password: string; full_name: string; role: string }) {
  const res = await client.post('/signup', payload)
  return res.data
}

export async function getMyProperties() {
  const res = await client.get('/owner/properties')
  return res.data
}

export async function getActiveBookingsForProperty(propertyId: number) {
  const res = await client.get(`/owner/properties/${propertyId}/bookings/active`)
  return res.data
}

export async function getActiveBookingsForOwner() {
  const res = await client.get('/owner/bookings/active')
  return res.data
}

export async function getMyBookings() {
  // owner bookings (dashboard) — customers use /customer/mybookings
  const res = await client.get('/owner/bookings')
  return res.data
}

export async function getCustomerBookings() {
  const res = await client.get('/customer/mybookings')
  return res.data
}

export async function getPropertyRooms(propertyId: number) {
  const res = await client.get(`/owner/properties/${propertyId}/rooms`)
  return res.data
}

export async function getOwnerBookingsCompleted() {
  const res = await client.get('/owner/bookings/completed')
  return res.data
}

export async function getCustomerBookingsWithStatus(status?: string) {
  const url = status ? `/customer/mybookings?status=${encodeURIComponent(status)}` : '/customer/mybookings'
  const res = await client.get(url)
  return res.data
}

export async function searchProperties(params?: Record<string, any>) {
  // Basic search endpoint; backend should support query params for filters
  const res = await client.get('/properties', { params })
  return res.data
}

export default client
