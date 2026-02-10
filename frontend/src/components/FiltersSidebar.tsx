import React, { useEffect, useState } from 'react'
import { Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Slider, TextField, Select, MenuItem, InputLabel, FormHelperText } from '@mui/material'

type Props = {
  onChange?: (params: Record<string, any>) => void
}

const PROPERTY_TYPES = ['Guest House', 'Boys PG', 'Girls PG', 'Serviced Apartment']

export default function FiltersSidebar({ onChange }: Props) {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [propertyType, setPropertyType] = useState<string | ''>('')
  const [price, setPrice] = useState<number[]>([0, 1000000])
  const [minRating, setMinRating] = useState<number>(0)
  const [available, setAvailable] = useState<'any' | 'true' | 'false'>('any')
  const [availableFrom, setAvailableFrom] = useState<string>('')
  const [availableTo, setAvailableTo] = useState<string>('')
  const [qDirty, setQDirty] = useState(false)
  const [cityDirty, setCityDirty] = useState(false)
  const [propertyTypeDirty, setPropertyTypeDirty] = useState(false)
  const [priceDirty, setPriceDirty] = useState(false)
  const [minRatingDirty, setMinRatingDirty] = useState(false)
  const [availableDirty, setAvailableDirty] = useState(false)
  const [dateDirty, setDateDirty] = useState(false)

  // emit params when changed (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      const params: Record<string, any> = {}
      if (q) { params.q = q }
      else if (qDirty) { params.q = q }

      if (city) { params.city = city }
      else if (cityDirty) { params.city = city }

      if (propertyType) { params.property_type = propertyType }
      else if (propertyTypeDirty) { params.property_type = propertyType }

      // include price bounds if user interacted with price slider (even if 0/2000)
      if (priceDirty) {
        params.min_price = price[0]
        params.max_price = price[1]
      } else {
        if (price[0] > 0) params.min_price = price[0]
        if (price[1] < 1000000) params.max_price = price[1]
      }

      if (minRatingDirty) params.min_rating = minRating
      else if (minRating > 0) params.min_rating = minRating

      if (available === 'true') params.available = true
      else if (available === 'false') params.available = false
      else if (availableDirty) params.available = available === 'true'

      if (availableFrom) { params.available_from = availableFrom }
      else if (dateDirty && availableFrom === '') { params.available_from = availableFrom }
      if (availableTo) { params.available_to = availableTo }
      else if (dateDirty && availableTo === '') { params.available_to = availableTo }

      // avoid emitting an empty param set on mount which would reset search
      if (Object.keys(params).length > 0) {
        if (onChange) onChange(params)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [q, city, propertyType, price, minRating, available, availableFrom, availableTo, onChange, qDirty, cityDirty, propertyTypeDirty, priceDirty, minRatingDirty, availableDirty, dateDirty])
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <TextField
        label="Search"
        value={q}
        onChange={(e) => { setQDirty(true); setQ(e.target.value) }}
        size="small"
        fullWidth
        placeholder="Search description or features"
      />

      <TextField
        label="City"
        value={city}
        onChange={(e) => { setCityDirty(true); setCity(e.target.value) }}
        size="small"
        fullWidth
      />

      <FormControl size="small">
        <InputLabel>Property type</InputLabel>
        <Select value={propertyType} label="Property type" onChange={(e) => { setPropertyTypeDirty(true); setPropertyType(e.target.value || '') }}>
          <MenuItem value="">Any</MenuItem>
          {PROPERTY_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </Select>
        <FormHelperText>Select property type</FormHelperText>
      </FormControl>

      <FormControl>
        <FormLabel sx={{ mb: 1 }}>Price range (₹)</FormLabel>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="Min"
            type="number"
            size="small"
            value={price[0]}
            onChange={(e) => {
              const v = Number(e.target.value || 0)
              const clamped = Math.max(0, Math.min(1000000, Math.floor(v)))
              setPriceDirty(true)
              setPrice([clamped, Math.max(clamped, price[1])])
            }}
            inputProps={{ min: 0, max: 1000000 }}
            sx={{ width: '50%' }}
          />

          <TextField
            label="Max"
            type="number"
            size="small"
            value={price[1]}
            onChange={(e) => {
              const v = Number(e.target.value || 0)
              const clamped = Math.max(0, Math.min(1000000, Math.floor(v)))
              setPriceDirty(true)
              setPrice([Math.min(price[0], clamped), clamped])
            }}
            inputProps={{ min: 0, max: 1000000 }}
            sx={{ width: '50%' }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Slider
            value={price}
            onChange={(e, v) => { setPriceDirty(true); setPrice(v as number[]) }}
            valueLabelDisplay="auto"
            min={0}
            max={1000000}
            step={500}
          />
        </Box>
      </FormControl>

      <FormControl>
        <FormLabel>Minimum rating</FormLabel>
        <Slider
          value={minRating}
          onChange={(e, v) => { setMinRatingDirty(true); setMinRating(v as number) }}
          valueLabelDisplay="auto"
          min={0}
          max={5}
          step={0.5}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Availability (current)</FormLabel>
        <RadioGroup value={available} onChange={(e) => { setAvailableDirty(true); setAvailable(e.target.value as 'any' | 'true' | 'false') }}>
          <FormControlLabel value="any" control={<Radio />} label="Any" />
          <FormControlLabel value="true" control={<Radio />} label="Available now" />
          <FormControlLabel value="false" control={<Radio />} label="Fully booked" />
        </RadioGroup>
      </FormControl>

      <TextField
        label="From"
        type="date"
        value={availableFrom}
        onChange={(e) => { setDateDirty(true); setAvailableFrom(e.target.value) }}
        InputLabelProps={{ shrink: true }}
        size="small"
        fullWidth
      />

      <TextField
        label="To"
        type="date"
        value={availableTo}
        onChange={(e) => { setDateDirty(true); setAvailableTo(e.target.value) }}
        InputLabelProps={{ shrink: true }}
        size="small"
        fullWidth
      />
    </Box>
  )
}
