interface MetadataResult {
  title: string
  description: string | null
  imageUrl: string | null
}

export async function fetchTikTokMetadata(url: string): Promise<MetadataResult | null> {
  try {
    // TikTok oEmbed endpoint
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Wish2Plan/1.0)',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      title: data.title || 'TikTok Video',
      description: data.author_name ? `by ${data.author_name}` : null,
      imageUrl: data.thumbnail_url || null,
    }
  } catch (error) {
    console.error('TikTok oEmbed error:', error)
    return null
  }
}

export async function fetchOpenGraphMetadata(url: string): Promise<MetadataResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Wish2Plan/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    
    // Extract OpenGraph tags
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                        html.match(/<meta\s+name=["']og:title["']\s+content=["']([^"']+)["']/i)
    const ogDescriptionMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
                               html.match(/<meta\s+name=["']og:description["']\s+content=["']([^"']+)["']/i)
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                        html.match(/<meta\s+name=["']og:image["']\s+content=["']([^"']+)["']/i)
    
    // Fallback to standard meta tags
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i) ||
                      html.match(/<meta\s+name=["']title["']\s+content=["']([^"']+)["']/i)
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)

    const title = ogTitleMatch?.[1] || titleMatch?.[1] || new URL(url).hostname
    const description = ogDescriptionMatch?.[1] || descriptionMatch?.[1] || null
    const imageUrl = ogImageMatch?.[1] || null

    return {
      title: title.trim(),
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
    }
  } catch (error) {
    console.error('OpenGraph fetch error:', error)
    // Return basic metadata from URL
    return {
      title: new URL(url).hostname,
      description: null,
      imageUrl: null,
    }
  }
}

export async function fetchMetadata(url: string, source: 'TIKTOK' | 'INSTAGRAM' | 'OTHER'): Promise<MetadataResult> {
  if (source === 'TIKTOK') {
    const tiktokMetadata = await fetchTikTokMetadata(url)
    if (tiktokMetadata) {
      return tiktokMetadata
    }
    // Fallback to OpenGraph if oEmbed fails
  }

  return fetchOpenGraphMetadata(url)
}

