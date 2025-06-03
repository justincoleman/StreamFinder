# StreamFinder Analytics Backend

Anonymous analytics tracking system for StreamFinder bundle generation and user behavior insights.

## 🚀 Features

- **Anonymous Tracking** - No personal data collected, session-based analytics
- **Bundle Analytics** - Track popular bundle combinations and patterns
- **Social Media Metrics** - Monitor sharing behavior and formats
- **Real-time Dashboard** - Web-based analytics dashboard
- **Smart Recommendations** - Popular bundle suggestions based on user selections
- **SQLite Storage** - Lightweight, file-based database
- **REST API** - Clean API for frontend integration

## 📊 Tracked Events

### Bundle Generation

- Service combinations and pricing
- League selection patterns and preferences
- Coverage metrics and weighted scores
- User subscription context

### Social Media Exports

- Export format preferences (Instagram vs Twitter/Facebook)
- Bundle sharing frequency
- Popular bundle characteristics for sharing

### User Interactions

- Device and platform analytics
- Budget range preferences
- Session flow patterns

## 🛠️ Setup

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
cd analytics-backend
npm install
```

### Development

```bash
npm run dev
```

Server starts on `http://localhost:3002`

### Production

```bash
npm start
```

## 📈 Dashboard

Access the analytics dashboard at:

```
http://localhost:3002/dashboard
```

Dashboard includes:

- **Overview Stats** - Total events, sessions, bundles, shares
- **Popular Services** - Most used services (7-day window)
- **Popular Leagues** - Most selected leagues (7-day window)
- **Daily Activity** - Events and sessions over 30 days
- **Real-time Updates** - Auto-refresh every 30 seconds

## 🔗 API Endpoints

### Store Event

```http
POST /api/events
Content-Type: application/json

{
  "type": "bundle_generated",
  "sessionId": "session_abc123",
  "bundleHash": "bundle_def456",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "serviceCount": 3,
    "serviceIds": ["espn_plus", "paramount_plus", "peacock"],
    "totalPrice": 29.97,
    "leagueCount": 5,
    "leagueIds": ["nfl", "nba", "mlb", "nhl", "mls"],
    "leaguePreferences": { "nfl": 5, "nba": 4, "mlb": 3, "nhl": 2, "mls": 1 }
  }
}
```

### Get Popular Bundles

```http
GET /api/popular-bundles?leagues=nfl,nba&limit=5
```

### Analytics Summary

```http
GET /api/analytics/summary
```

### Health Check

```http
GET /health
```

## 🗄️ Database Schema

### Events Table

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,               -- 'bundle_generated', 'social_media_export', etc.
  session_id TEXT NOT NULL,         -- Anonymous session identifier
  bundle_hash TEXT,                 -- Unique bundle combination hash
  timestamp DATETIME NOT NULL,      -- Event timestamp
  data TEXT NOT NULL,               -- JSON event data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Privacy & Anonymization

- **No Personal Data** - Only anonymous session IDs and aggregated metrics
- **Session-based Tracking** - Temporary identifiers, no cross-device tracking
- **Bundle Hashing** - Service combinations hashed for duplicate detection
- **Anonymized Preferences** - League preferences without user identification
- **No IP Storage** - Server logs only show request patterns, no IP retention

## 🎯 Smart Recommendations

The system enables smart bundle recommendations by:

1. **Analyzing Popular Combinations** - Most frequently generated bundles
2. **League-based Filtering** - Recommendations based on selected leagues
3. **Preference Weighting** - Considering importance rankings
4. **Budget-aware Suggestions** - Price-appropriate recommendations
5. **Recency Scoring** - Prefer recently popular combinations

## 🔧 Configuration

### Environment Variables

```bash
PORT=3002                           # Server port (default: 3002)
NODE_ENV=production                 # Environment mode
```

### Frontend Integration

```javascript
// In your .env file
VITE_ANALYTICS_API=http://localhost:3002/api
```

## 📋 Development Notes

- **SQLite Database** - Stored as `analytics.db` in backend directory
- **Rate Limiting** - 1000 requests per 15-minute window per IP
- **JSON Validation** - Required fields validated on event storage
- **Error Handling** - Graceful failure with optional analytics
- **CORS Enabled** - Allows frontend requests from any origin

## 🚀 Deployment

For production deployment:

1. **Choose hosting platform** (Heroku, DigitalOcean, AWS, etc.)
2. **Set environment variables** (PORT, NODE_ENV)
3. **Database persistence** - Ensure analytics.db is preserved
4. **Process management** - Use PM2 or similar for process monitoring
5. **Reverse proxy** - Consider nginx for SSL and caching

## 📊 Analytics Insights

The system provides insights into:

- **Bundle Popularity Trends** - Which combinations work best
- **League Preferences** - Sport popularity and importance weighting
- **Service Usage Patterns** - Most valuable streaming services
- **Price Sensitivity** - Budget range preferences
- **Sharing Behavior** - Social media export patterns
- **User Journey Flow** - How users interact with the application

Perfect for understanding user behavior and optimizing the StreamFinder experience! 🎯
