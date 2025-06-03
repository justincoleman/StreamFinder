const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'"]
    }
  }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Initialize SQLite database
const dbPath = path.join(__dirname, 'analytics.db');
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Events table for all analytics events
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      session_id TEXT NOT NULL,
      bundle_hash TEXT,
      timestamp DATETIME NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bundle popularity index
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_bundle_hash ON events(bundle_hash);
  `);

  // Session analytics
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_session_timestamp ON events(session_id, timestamp);
  `);
});

// API Routes

// Store analytics event
app.post('/api/events', async (req, res) => {
  try {
    const { type, sessionId, bundleHash, timestamp, data } = req.body;

    if (!type || !sessionId || !timestamp || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO events (type, session_id, bundle_hash, timestamp, data)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(type, sessionId, bundleHash, timestamp, JSON.stringify(data), function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to store event' });
      }
      res.json({ success: true, id: this.lastID });
    });

    stmt.finalize();
  } catch (error) {
    console.error('Error storing event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get popular bundles
app.get('/api/popular-bundles', async (req, res) => {
  try {
    const { leagues, limit = 5 } = req.query;
    const leagueFilter = leagues ? leagues.split(',') : [];

    let query = `
      SELECT
        bundle_hash,
        COUNT(*) as popularity,
        MAX(timestamp) as last_generated,
        data
      FROM events
      WHERE type = 'bundle_generated'
        AND bundle_hash IS NOT NULL
        AND datetime(timestamp) >= datetime('now', '-30 days')
    `;

    const params = [];

    // Add league filtering if specified
    if (leagueFilter.length > 0) {
      const leagueConditions = leagueFilter.map(() => "json_extract(data, '$.leagueIds') LIKE ?").join(' OR ');
      query += ` AND (${leagueConditions})`;
      leagueFilter.forEach(league => {
        params.push(`%"${league}"%`);
      });
    }

    query += `
      GROUP BY bundle_hash
      ORDER BY popularity DESC, last_generated DESC
      LIMIT ?
    `;
    params.push(parseInt(limit));

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch popular bundles' });
      }

      const popularBundles = rows.map(row => ({
        bundleHash: row.bundle_hash,
        popularity: row.popularity,
        lastGenerated: row.last_generated,
        ...JSON.parse(row.data)
      }));

      res.json(popularBundles);
    });
  } catch (error) {
    console.error('Error fetching popular bundles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics summary for dashboard
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const queries = {
      totalEvents: "SELECT COUNT(*) as count FROM events",
      totalSessions: "SELECT COUNT(DISTINCT session_id) as count FROM events",
      bundlesGenerated: "SELECT COUNT(*) as count FROM events WHERE type = 'bundle_generated'",
      socialShares: "SELECT COUNT(*) as count FROM events WHERE type = 'social_media_export'",
      averageBundlePrice: `
        SELECT AVG(CAST(json_extract(data, '$.totalPrice') AS REAL)) as avg_price
        FROM events
        WHERE type = 'bundle_generated'
          AND json_extract(data, '$.totalPrice') IS NOT NULL
      `,
      popularServices: `
        SELECT
          service_id,
          COUNT(*) as usage_count
        FROM (
          SELECT json_each.value as service_id
          FROM events, json_each(json_extract(data, '$.serviceIds'))
          WHERE type = 'bundle_generated'
            AND datetime(timestamp) >= datetime('now', '-7 days')
        )
        GROUP BY service_id
        ORDER BY usage_count DESC
        LIMIT 10
      `,
      popularLeagues: `
        SELECT
          league_id,
          COUNT(*) as usage_count
        FROM (
          SELECT json_each.value as league_id
          FROM events, json_each(json_extract(data, '$.leagueIds'))
          WHERE type = 'bundle_generated'
            AND datetime(timestamp) >= datetime('now', '-7 days')
        )
        GROUP BY league_id
        ORDER BY usage_count DESC
        LIMIT 10
      `,
      dailyActivity: `
        SELECT
          DATE(timestamp) as date,
          COUNT(*) as events,
          COUNT(DISTINCT session_id) as sessions
        FROM events
        WHERE datetime(timestamp) >= datetime('now', '-30 days')
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `
    };

    const results = {};

    // Execute all queries
    const promises = Object.entries(queries).map(([key, query]) => {
      return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            results[key] = rows;
            resolve();
          }
        });
      });
    });

    await Promise.all(promises);

    // Format results
    const summary = {
      overview: {
        totalEvents: results.totalEvents[0]?.count || 0,
        totalSessions: results.totalSessions[0]?.count || 0,
        bundlesGenerated: results.bundlesGenerated[0]?.count || 0,
        socialShares: results.socialShares[0]?.count || 0,
        averageBundlePrice: results.averageBundlePrice[0]?.avg_price || 0
      },
      popularServices: results.popularServices || [],
      popularLeagues: results.popularLeagues || [],
      dailyActivity: results.dailyActivity || []
    };

    res.json(summary);
  } catch (error) {
    console.error('Error generating analytics summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve simple dashboard
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>StreamFinder Analytics Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat { text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; margin-top: 5px; }
        .list { list-style: none; padding: 0; }
        .list li { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
        h1 { color: #333; text-align: center; }
        h2 { color: #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎯 StreamFinder Analytics Dashboard</h1>

        <div class="card">
          <h2>📊 Overview</h2>
          <div class="stats" id="overview-stats">
            <div class="stat">
              <div class="stat-value" id="total-events">-</div>
              <div class="stat-label">Total Events</div>
            </div>
            <div class="stat">
              <div class="stat-value" id="total-sessions">-</div>
              <div class="stat-label">Unique Sessions</div>
            </div>
            <div class="stat">
              <div class="stat-value" id="bundles-generated">-</div>
              <div class="stat-label">Bundles Generated</div>
            </div>
            <div class="stat">
              <div class="stat-value" id="social-shares">-</div>
              <div class="stat-label">Social Shares</div>
            </div>
            <div class="stat">
              <div class="stat-value" id="avg-price">-</div>
              <div class="stat-label">Avg Bundle Price</div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="card">
            <h2>🏆 Popular Services (7 days)</h2>
            <ul class="list" id="popular-services"></ul>
          </div>

          <div class="card">
            <h2>🎯 Popular Leagues (7 days)</h2>
            <ul class="list" id="popular-leagues"></ul>
          </div>
        </div>

        <div class="card">
          <h2>📈 Daily Activity (30 days)</h2>
          <ul class="list" id="daily-activity"></ul>
        </div>
      </div>

      <script>
        async function loadDashboard() {
          try {
            const response = await fetch('/api/analytics/summary');
            const data = await response.json();

            // Update overview stats
            document.getElementById('total-events').textContent = data.overview.totalEvents.toLocaleString();
            document.getElementById('total-sessions').textContent = data.overview.totalSessions.toLocaleString();
            document.getElementById('bundles-generated').textContent = data.overview.bundlesGenerated.toLocaleString();
            document.getElementById('social-shares').textContent = data.overview.socialShares.toLocaleString();
            document.getElementById('avg-price').textContent = '$' + data.overview.averageBundlePrice.toFixed(2);

            // Popular services
            const servicesList = document.getElementById('popular-services');
            servicesList.innerHTML = data.popularServices.map(item =>
              \`<li><span>\${item.service_id}</span><span>\${item.usage_count} uses</span></li>\`
            ).join('');

            // Popular leagues
            const leaguesList = document.getElementById('popular-leagues');
            leaguesList.innerHTML = data.popularLeagues.map(item =>
              \`<li><span>\${item.league_id.toUpperCase()}</span><span>\${item.usage_count} uses</span></li>\`
            ).join('');

            // Daily activity
            const activityList = document.getElementById('daily-activity');
            activityList.innerHTML = data.dailyActivity.map(item =>
              \`<li><span>\${item.date}</span><span>\${item.events} events, \${item.sessions} sessions</span></li>\`
            ).join('');

          } catch (error) {
            console.error('Failed to load dashboard:', error);
          }
        }

        loadDashboard();
        setInterval(loadDashboard, 30000); // Refresh every 30 seconds
      </script>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 StreamFinder Analytics API running on port ${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down analytics server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});