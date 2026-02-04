export interface GeocodeResult {
  id: string
  placeName: string
  placeAddress: string
  lat: number
  lng: number
}

export async function geocodePlace(query: string): Promise<GeocodeResult[]> {
  const token = process.env.MAPBOX_TOKEN
  if (!token) {
    throw new Error('MAPBOX_TOKEN not configured')
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=5`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`)
    }

    const data = await response.json()
    
    return data.features.map((feature: any) => ({
      id: feature.id,
      placeName: feature.text || feature.place_name,
      placeAddress: feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0],
    }))
  } catch (error) {
    console.error('Geocoding error:', error)
    throw error
  }
}

