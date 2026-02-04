# Wish2Plan - How It Works

## Overview

Wish2Plan is a date idea aggregator that helps you save, organize, and plan date ideas from various sources (TikTok, Instagram, URLs, or manual text).

## How the App Works

### 1. **Authentication Flow**
- Sign in with GitHub OAuth (or Google if configured)
- Your user account is created in the database
- All your ideas are private to your account

### 2. **Saving Ideas**

#### Method 1: Quick Add (Dashboard)
1. Go to Dashboard (`/app`)
2. Paste a URL or type text in the "Quick Add" box
3. Click "Add Idea(s)"
4. The app automatically:
   - Extracts URLs from your text
   - Fetches metadata (title, description, image) from each URL
   - For TikTok: Uses oEmbed API
   - For other sites: Parses OpenGraph tags
   - Creates idea drafts
   - Saves them to your account

#### Method 2: Manual Entry
1. Go to Ideas → "New Idea"
2. Fill in title, description, URL, category, status manually
3. Save

### 3. **Idea Management**
- **View All Ideas**: `/app/ideas` - Browse, search, and filter your ideas
- **Edit Idea**: Click on any idea to edit details, attach a location, change category/status
- **Categories**: DATE, GIFT, MEAL
- **Status**: SAVED, PLANNED, DONE

### 4. **Location/Place Attachment**
1. Open an idea detail page
2. Click "Attach a Place"
3. Search for a location (e.g., "Central Park, New York")
4. Select a result from the dropdown
5. The place name, address, and coordinates (lat/lng) are saved
6. This enables the idea to appear on the map

### 5. **Map View** (`/app/map`)
- Shows all your ideas that have location data (lat/lng)
- Interactive Mapbox map with markers
- Click a marker to see idea details in a side panel
- Filter by category and status
- Map automatically zooms to show all your ideas

### 6. **Plans** (`/app/plans`)
- Create date plans with a title and scheduled date/time
- Add multiple ideas to a plan
- Export plans as `.ics` calendar files
- View all your plans in a list

## How the Map Works

### Technology Stack
- **Mapbox GL JS**: Interactive map library
- **Mapbox Geocoding API**: Converts place names to coordinates

### Map Features

1. **Initialization**
   - Loads Mapbox map with default center (New York)
   - Uses your `NEXT_PUBLIC_MAPBOX_TOKEN` from environment variables

2. **Markers**
   - Fetches all your ideas from `/api/ideas`
   - Filters to only ideas with `lat` and `lng` coordinates
   - Creates a marker for each idea
   - Markers are clickable and show idea details

3. **Auto-Zoom**
   - Calculates bounds of all markers
   - Automatically fits the map to show all your ideas

4. **Filtering**
   - Filter by category (DATE, GIFT, MEAL)
   - Filter by status (SAVED, PLANNED, DONE)
   - Filters update the markers in real-time

5. **Place Search** (on Idea Detail page)
   - Uses Mapbox Geocoding API
   - Searches as you type (debounced)
   - Returns top 5 matching places
   - Selecting a place saves coordinates to the idea

## Setting Up the Map

### Step 1: Get a Mapbox Token

1. **Create a Mapbox Account**
   - Go to [mapbox.com](https://www.mapbox.com/)
   - Sign up for a free account (includes 50,000 free map loads/month)

2. **Create an Access Token**
   - Go to [Account → Access Tokens](https://account.mapbox.com/access-tokens/)
   - Click "Create a token"
   - Name it (e.g., "Wish2Plan")
   - **Required scopes**:
     - `styles:read` (for map styles)
     - `fonts:read` (for map fonts)
     - `geocoding:read` (for place search)

3. **Copy Your Token**
   - Copy the token (starts with `pk.`)

### Step 2: Add Token to Environment Variables

1. **Open `.env.local`** (or create it if it doesn't exist)

2. **Add both tokens**:
   ```env
   # Public token (used in browser for map display)
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
   
   # Server token (used for geocoding API calls)
   MAPBOX_TOKEN=pk.your_token_here
   ```
   
   **Note**: You can use the same token for both, or create separate tokens for security.

3. **Save the file**

4. **Restart your dev server**:
   ```bash
   npm run dev
   ```

### Step 3: Test the Map

1. **Add an idea with a location**:
   - Go to Dashboard
   - Create an idea
   - Open the idea detail page
   - Click "Attach a Place"
   - Search for a location (e.g., "Times Square")
   - Select a result

2. **View on Map**:
   - Go to `/app/map`
   - You should see a marker for your idea
   - Click the marker to see details

## Troubleshooting the Map

### Map Not Loading

**Error**: "NEXT_PUBLIC_MAPBOX_TOKEN is not set"

**Solution**:
1. Check `.env.local` has `NEXT_PUBLIC_MAPBOX_TOKEN`
2. Restart dev server after adding the token
3. Make sure the token starts with `pk.`

### No Markers Showing

**Possible Causes**:
1. **No ideas have locations**: Ideas need `lat` and `lng` values
   - Solution: Attach a place to at least one idea

2. **Token doesn't have correct scopes**
   - Solution: Regenerate token with `styles:read`, `fonts:read`, `geocoding:read`

3. **Ideas filtered out**
   - Solution: Check category/status filters aren't hiding your ideas

### Geocoding Not Working

**Error**: "MAPBOX_TOKEN not configured"

**Solution**:
1. Add `MAPBOX_TOKEN` to `.env.local`
2. Restart dev server
3. Make sure token has `geocoding:read` scope

### Map Shows Wrong Location

**Default Center**: The map defaults to New York (`[-74.006, 40.7128]`)

**Solution**: Once you add ideas with locations, the map will auto-zoom to show all your ideas

## Data Flow

### Saving an Idea with Location

1. User pastes URL or text → `/api/ingest`
2. System extracts URLs and fetches metadata
3. User saves idea → `/api/ideas` (POST)
4. User opens idea detail → `/app/ideas/[id]`
5. User searches for place → `/api/geocode` (uses Mapbox API)
6. User selects place → `/api/ideas/[id]` (PATCH) - saves lat/lng
7. Idea now appears on map → `/app/map`

### Map Rendering

1. User visits `/app/map`
2. Component fetches ideas → `/api/ideas`
3. Filters ideas with coordinates
4. Initializes Mapbox map
5. Creates markers for each idea
6. Auto-fits map bounds to show all markers
7. User clicks marker → Shows idea details in side panel

## Key Files

- **Map Component**: `app/app/map/page.tsx`
- **Geocoding API**: `app/api/geocode/route.ts`
- **Geocoding Utility**: `lib/geocode.ts`
- **Idea Detail (Place Attachment)**: `app/app/ideas/[id]/page.tsx`

## Next Steps

1. ✅ Set up Mapbox token
2. ✅ Add it to `.env.local`
3. ✅ Restart dev server
4. ✅ Create an idea
5. ✅ Attach a location to the idea
6. ✅ View it on the map!

Enjoy planning your dates! 🗺️✨

