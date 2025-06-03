require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3003;
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || '!!G3ng3r88';

// Security warning for default password
if (DASHBOARD_PASSWORD === '!!G3ng3r88' && !process.env.DASHBOARD_PASSWORD) {
  console.warn('⚠️  WARNING: Using default password. Set DASHBOARD_PASSWORD environment variable for production.');
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      "style-src": ["'self'", "'unsafe-inline'"]
    }
  }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'streamfinder-analytics-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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

  // Bundles table for tracking unique bundles and their counts
  db.run(`
    CREATE TABLE IF NOT EXISTS bundles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bundle_hash TEXT UNIQUE NOT NULL,
      bundle_signature TEXT NOT NULL,
      service_ids TEXT NOT NULL,
      league_ids TEXT NOT NULL,
      total_price REAL NOT NULL,
      service_count INTEGER NOT NULL,
      league_count INTEGER NOT NULL,
      first_created DATETIME NOT NULL,
      last_created DATETIME NOT NULL,
      creation_count INTEGER DEFAULT 1,
      bundle_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bundle popularity index
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_bundle_hash ON events(bundle_hash);
  `);

  // Bundle tracking indexes
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_bundles_hash ON bundles(bundle_hash);
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_bundles_creation_count ON bundles(creation_count DESC);
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_bundles_last_created ON bundles(last_created DESC);
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

      // If this is a bundle generation event, also log it to the bundles table
      if (type === 'bundle_generated' && bundleHash && data) {
        logBundle(bundleHash, timestamp, data);
      }

      res.json({ success: true, id: this.lastID });
    });

    stmt.finalize();
  } catch (error) {
    console.error('Error storing event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to log bundles to the bundles table
function logBundle(bundleHash, timestamp, data) {
  try {
    const bundleData = typeof data === 'string' ? JSON.parse(data) : data;
    const serviceIds = bundleData.serviceIds || [];
    const leagueIds = bundleData.leagueIds || [];
    const totalPrice = bundleData.totalPrice || 0;

    // Create a human-readable signature for the bundle
    const sortedServices = [...serviceIds].sort();
    const sortedLeagues = [...leagueIds].sort();
    const signature = `${sortedServices.join(',')}|${sortedLeagues.join(',')}`;

    // First, try to update existing bundle
    const updateStmt = db.prepare(`
      UPDATE bundles
      SET creation_count = creation_count + 1,
          last_created = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE bundle_hash = ?
    `);

    updateStmt.run(timestamp, bundleHash, function(err) {
      if (err) {
        console.error('Error updating bundle count:', err);
        return;
      }

      // If no rows were updated, this is a new bundle
      if (this.changes === 0) {
        const insertStmt = db.prepare(`
          INSERT INTO bundles (
            bundle_hash, bundle_signature, service_ids, league_ids,
            total_price, service_count, league_count, first_created,
            last_created, creation_count, bundle_data
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        `);

        insertStmt.run(
          bundleHash,
          signature,
          JSON.stringify(sortedServices),
          JSON.stringify(sortedLeagues),
          totalPrice,
          serviceIds.length,
          leagueIds.length,
          timestamp,
          timestamp,
          JSON.stringify(bundleData),
          function(err) {
            if (err) {
              console.error('Error inserting new bundle:', err);
            } else {
              console.log(`New bundle logged: ${signature} (${bundleHash})`);
            }
          }
        );

        insertStmt.finalize();
      } else {
        console.log(`Bundle count updated: ${signature} (${bundleHash})`);
      }
    });

    updateStmt.finalize();
  } catch (error) {
    console.error('Error logging bundle:', error);
  }
}

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

// Get bundle log - all unique bundles with creation counts
app.get('/api/bundle-log', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'creation_count',
      sortOrder = 'desc',
      search = '',
      minPrice = 0,
      maxPrice = 1000,
      minCount = 1
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const validSortColumns = ['creation_count', 'total_price', 'service_count', 'league_count', 'first_created', 'last_created'];
    const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'creation_count';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Search filter
    if (search) {
      whereClause += ' AND (bundle_signature LIKE ? OR service_ids LIKE ? OR league_ids LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Price filter
    if (parseFloat(minPrice) > 0 || parseFloat(maxPrice) < 1000) {
      whereClause += ' AND total_price BETWEEN ? AND ?';
      params.push(parseFloat(minPrice), parseFloat(maxPrice));
    }

    // Creation count filter
    if (parseInt(minCount) > 1) {
      whereClause += ' AND creation_count >= ?';
      params.push(parseInt(minCount));
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM bundles ${whereClause}`;

    db.get(countQuery, params, (err, countResult) => {
      if (err) {
        console.error('Database error (count):', err);
        return res.status(500).json({ error: 'Failed to count bundles' });
      }

      const totalBundles = countResult.total;
      const totalPages = Math.ceil(totalBundles / parseInt(limit));

      // Get bundles with pagination
      const bundlesQuery = `
        SELECT
          id,
          bundle_hash,
          bundle_signature,
          service_ids,
          league_ids,
          total_price,
          service_count,
          league_count,
          creation_count,
          first_created,
          last_created,
          bundle_data
        FROM bundles
        ${whereClause}
        ORDER BY ${orderBy} ${order}, last_created DESC
        LIMIT ? OFFSET ?
      `;

      const bundleParams = [...params, parseInt(limit), offset];

      db.all(bundlesQuery, bundleParams, (err, rows) => {
        if (err) {
          console.error('Database error (bundles):', err);
          return res.status(500).json({ error: 'Failed to fetch bundle log' });
        }

        const bundleLog = rows.map(row => ({
          id: row.id,
          bundleHash: row.bundle_hash,
          signature: row.bundle_signature,
          serviceIds: JSON.parse(row.service_ids),
          leagueIds: JSON.parse(row.league_ids),
          totalPrice: row.total_price,
          serviceCount: row.service_count,
          leagueCount: row.league_count,
          creationCount: row.creation_count,
          firstCreated: row.first_created,
          lastCreated: row.last_created,
          bundleData: JSON.parse(row.bundle_data)
        }));

        res.json({
          bundles: bundleLog,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalBundles,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1
          },
          filters: {
            search,
            minPrice: parseFloat(minPrice),
            maxPrice: parseFloat(maxPrice),
            minCount: parseInt(minCount),
            sortBy: orderBy,
            sortOrder: order.toLowerCase()
          }
        });
      });
    });
  } catch (error) {
    console.error('Error fetching bundle log:', error);
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
      // Bundle statistics from the new bundles table
      uniqueBundles: "SELECT COUNT(*) as count FROM bundles",
      totalBundleCreations: "SELECT SUM(creation_count) as total FROM bundles",
      mostPopularBundle: `
        SELECT bundle_signature, creation_count, total_price, service_ids, league_ids
        FROM bundles
        ORDER BY creation_count DESC
        LIMIT 1
      `,
      averageCreationsPerBundle: "SELECT AVG(creation_count) as avg FROM bundles",
      bundlesByCreationCount: `
        SELECT
          CASE
            WHEN creation_count = 1 THEN '1 time'
            WHEN creation_count BETWEEN 2 AND 5 THEN '2-5 times'
            WHEN creation_count BETWEEN 6 AND 10 THEN '6-10 times'
            ELSE '10+ times'
          END as frequency_range,
          COUNT(*) as bundle_count
        FROM bundles
        GROUP BY
          CASE
            WHEN creation_count = 1 THEN 1
            WHEN creation_count BETWEEN 2 AND 5 THEN 2
            WHEN creation_count BETWEEN 6 AND 10 THEN 3
            ELSE 4
          END
        ORDER BY bundle_count DESC
      `,
      popularServices: `
        SELECT
          service_id,
          COUNT(*) as usage_count
        FROM (
          SELECT json_each.value as service_id
          FROM events, json_each(json_extract(events.data, '$.serviceIds'))
          WHERE events.type = 'bundle_generated'
            AND datetime(events.timestamp) >= datetime('now', '-7 days')
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
          FROM events, json_each(json_extract(events.data, '$.leagueIds'))
          WHERE events.type = 'bundle_generated'
            AND datetime(events.timestamp) >= datetime('now', '-7 days')
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
        averageBundlePrice: results.averageBundlePrice[0]?.avg_price || 0,
        uniqueBundles: results.uniqueBundles[0]?.count || 0,
        totalBundleCreations: results.totalBundleCreations[0]?.total || 0,
        averageCreationsPerBundle: results.averageCreationsPerBundle[0]?.avg || 0
      },
      bundles: {
        mostPopular: results.mostPopularBundle[0] || null,
        byCreationCount: results.bundlesByCreationCount || []
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

// Login routes
app.get('/login', (req, res) => {
  const error = req.query.error;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>StreamFinder Analytics - Login</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .login-container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          width: 400px;
          text-align: center;
        }
        .logo {
          font-size: 2.5em;
          margin-bottom: 10px;
          color: #667eea;
        }
        h1 {
          color: #333;
          margin-bottom: 30px;
          font-size: 1.5em;
        }
        .form-group {
          margin-bottom: 20px;
          text-align: left;
        }
        label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: bold;
        }
        input[type="password"] {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          box-sizing: border-box;
          transition: border-color 0.3s;
        }
        input[type="password"]:focus {
          outline: none;
          border-color: #667eea;
        }
        .login-btn {
          width: 100%;
          padding: 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .login-btn:hover {
          background: #5a67d8;
        }
        .error {
          background: #fed7d7;
          color: #c53030;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #feb2b2;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <div class="logo">🎯</div>
        <h1>StreamFinder Analytics</h1>
        ${error ? '<div class="error">Invalid password. Please try again.</div>' : ''}
        <form method="POST" action="/login">
          <div class="form-group">
            <label for="password">Admin Password:</label>
            <input type="password" id="password" name="password" required autofocus>
          </div>
          <button type="submit" class="login-btn">Access Dashboard</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post('/login', (req, res) => {
  const { password } = req.body;

  if (password === DASHBOARD_PASSWORD) {
    req.session.authenticated = true;
    res.redirect('/dashboard');
  } else {
    res.redirect('/login?error=1');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Serve simple dashboard
app.get('/dashboard', requireAuth, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>StreamFinder Analytics Dashboard</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f5f5f5; }
        .header { background: #667eea; color: white; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header h1 { margin: 0; font-size: 1.5em; }
        .logout-btn { background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; text-decoration: none; font-size: 14px; }
        .logout-btn:hover { background: rgba(255,255,255,0.3); }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px; }
        .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat { text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; margin-top: 5px; }
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .chart-container { position: relative; height: 400px; }
        .chart-container canvas { max-height: 350px; }
        h1 { color: #333; text-align: center; }
        h2 { color: #667eea; margin-bottom: 15px; }
        .activity-chart { height: 300px; }
        .stat-card { background: #f8f9ff; padding: 20px; border-radius: 8px; border: 1px solid #e0e4ff; }
        .stat-card h3 { margin: 0 0 15px 0; color: #667eea; font-size: 1.1em; }
        .bundle-info { text-align: center; }
        .bundle-signature { font-size: 1.2em; font-weight: bold; color: #333; margin-bottom: 10px; word-break: break-word; }
        .bundle-details { margin-bottom: 15px; text-align: left; }
        .services-section, .leagues-section { margin-bottom: 8px; }
        .section-label { font-weight: bold; color: #667eea; margin-right: 8px; }
        .services-list, .leagues-list { display: inline; font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
        .bundle-stats { display: flex; justify-content: space-between; align-items: center; }
        .bundle-price { background: #e8f4fd; color: #0066cc; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
        .bundle-count { background: #f0f9e8; color: #22c55e; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
        .bundle-actions { margin-top: 20px; text-align: center; }
        .view-log-btn { background: #667eea; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold; }
        .view-log-btn:hover { background: #5a67d8; }
        .bundles-table-container { margin-bottom: 20px; }
        .bundles-table { border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; }
        .table-header { background: #f8f9fa; display: grid; grid-template-columns: 2fr 2fr 1fr 1fr; gap: 1px; padding: 0; font-weight: bold; color: #333; }
        .table-header > div { padding: 12px; background: #f8f9fa; }
        .table-body { background: white; }
        .bundle-row { display: grid; grid-template-columns: 2fr 2fr 1fr 1fr; gap: 1px; border-bottom: 1px solid #f0f0f0; }
        .bundle-row:last-child { border-bottom: none; }
        .bundle-row > div { padding: 12px; background: white; }
        .bundle-row:hover { background: #f8f9ff; }
        .bundle-row:hover > div { background: #f8f9ff; }
        .col-services, .col-leagues { font-family: monospace; font-size: 0.9em; }
        .col-price { text-align: center; font-weight: bold; color: #0066cc; }
        .col-count { text-align: center; font-weight: bold; color: #22c55e; }
        .loading { padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎯 StreamFinder Analytics Dashboard</h1>
        <a href="/logout" class="logout-btn">Logout</a>
      </div>
      <div class="container">
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
              <div class="stat-value" id="unique-bundles">-</div>
              <div class="stat-label">Unique Bundles</div>
            </div>
            <div class="stat">
              <div class="stat-value" id="social-shares">-</div>
              <div class="stat-label">Social Shares</div>
            </div>
            <div class="stat">
              <div class="stat-value" id="avg-price">-</div>
              <div class="stat-label">Avg Bundle Price</div>
            </div>
            <div class="stat">
              <div class="stat-value" id="avg-creations">-</div>
              <div class="stat-label">Avg Creations/Bundle</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>📦 Bundle Insights</h2>

          <div class="bundles-table-container">
            <h3>📋 All Unique Bundles</h3>
            <div class="bundles-table" id="bundles-table">
              <div class="table-header">
                <div class="col-services">Services</div>
                <div class="col-leagues">Leagues</div>
                <div class="col-price">Price</div>
                <div class="col-count">Times Created</div>
              </div>
              <div class="table-body" id="bundles-table-body">
                <div class="loading">Loading bundle data...</div>
              </div>
            </div>
          </div>

          <div class="charts-grid" style="margin-top: 30px;">
            <div class="stat-card">
              <h3>🏆 Most Popular Bundle</h3>
              <div id="most-popular-bundle">
                <div class="bundle-info">
                  <div class="bundle-details">
                    <div class="services-section">
                      <span class="section-label">Services:</span>
                      <div class="services-list" id="popular-services">-</div>
                    </div>
                    <div class="leagues-section">
                      <span class="section-label">Leagues:</span>
                      <div class="leagues-list" id="popular-leagues">-</div>
                    </div>
                  </div>
                  <div class="bundle-stats">
                    <span class="bundle-price" id="popular-price">-</span>
                    <span class="bundle-count" id="popular-count">-</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="chart-container">
              <h3>📊 Creation Count Distribution</h3>
              <canvas id="bundleFrequencyChart"></canvas>
            </div>
          </div>

          <div class="bundle-actions">
            <a href="/api/bundle-log" target="_blank" class="view-log-btn">📋 View Full Bundle Log (JSON)</a>
            <div class="bundle-summary" id="bundle-summary" style="margin-top: 15px; font-size: 0.9em; color: #666;">
              Loading bundle statistics...
            </div>
          </div>
        </div>

        <div class="charts-grid">
          <div class="card">
            <h2>🏆 Popular Services (7 days)</h2>
            <div class="chart-container">
              <canvas id="servicesChart"></canvas>
            </div>
          </div>

          <div class="card">
            <h2>🎯 Popular Leagues (7 days)</h2>
            <div class="chart-container">
              <canvas id="leaguesChart"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>📈 Daily Activity (30 days)</h2>
          <div class="chart-container activity-chart">
            <canvas id="activityChart"></canvas>
          </div>
        </div>
      </div>

      <script>
        let servicesChart, leaguesChart, activityChart, bundleFrequencyChart;

        // Color palettes for charts
        const serviceColors = [
          '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
          '#fa709a', '#fee140', '#f78ca0', '#96deda', '#ffb199'
        ];

        const leagueColors = [
          '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
          '#dda0dd', '#98d8c8', '#ffb199', '#f9ca24', '#6c5ce7'
        ];

        const bundleColors = [
          '#667eea', '#ff6b6b', '#22c55e', '#f59e0b'
        ];

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
            document.getElementById('unique-bundles').textContent = data.overview.uniqueBundles.toLocaleString();
            document.getElementById('avg-creations').textContent = data.overview.averageCreationsPerBundle.toFixed(2);

            // Fetch all bundles for the table
            const bundlesResponse = await fetch('/api/bundle-log?limit=100&sortBy=creation_count&sortOrder=desc');
            const bundlesData = await bundlesResponse.json();

            // Update bundle insights
            updateBundleInsights(data.bundles, bundlesData.bundles);

            // Create or update Popular Services Chart
            const servicesCtx = document.getElementById('servicesChart').getContext('2d');
            if (servicesChart) {
              servicesChart.destroy();
            }

            const serviceLabels = data.popularServices.map(item =>
              item.service_id.replace(/_/g, ' ').toUpperCase()
            );
            const serviceData = data.popularServices.map(item => item.usage_count);

            servicesChart = new Chart(servicesCtx, {
              type: 'doughnut',
              data: {
                labels: serviceLabels,
                datasets: [{
                  data: serviceData,
                  backgroundColor: serviceColors.slice(0, serviceData.length),
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      boxWidth: 15,
                      padding: 15,
                      font: {
                        size: 12
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return context.label + ': ' + context.parsed + ' uses';
                      }
                    }
                  }
                }
              }
            });

            // Create or update Popular Leagues Chart
            const leaguesCtx = document.getElementById('leaguesChart').getContext('2d');
            if (leaguesChart) {
              leaguesChart.destroy();
            }

            const leagueLabels = data.popularLeagues.map(item => item.league_id.toUpperCase());
            const leagueData = data.popularLeagues.map(item => item.usage_count);

            leaguesChart = new Chart(leaguesCtx, {
              type: 'bar',
              data: {
                labels: leagueLabels,
                datasets: [{
                  label: 'Uses',
                  data: leagueData,
                  backgroundColor: leagueColors.slice(0, leagueData.length),
                  borderWidth: 1,
                  borderRadius: 4
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return context.dataset.label + ': ' + context.parsed.y + ' uses';
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45
                    }
                  }
                }
              }
            });

            // Create or update Daily Activity Chart
            const activityCtx = document.getElementById('activityChart').getContext('2d');
            if (activityChart) {
              activityChart.destroy();
            }

            // Sort by date and prepare data
            const sortedActivity = data.dailyActivity.sort((a, b) => new Date(a.date) - new Date(b.date));
            const activityLabels = sortedActivity.map(item => {
              const date = new Date(item.date);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            const eventsData = sortedActivity.map(item => item.events);
            const sessionsData = sortedActivity.map(item => item.sessions);

            activityChart = new Chart(activityCtx, {
              type: 'line',
              data: {
                labels: activityLabels,
                datasets: [
                  {
                    label: 'Events',
                    data: eventsData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                  },
                  {
                    label: 'Sessions',
                    data: sessionsData,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    fill: true,
                    tension: 0.4
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45
                    }
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index'
                }
              }
            });

          } catch (error) {
            console.error('Failed to load dashboard:', error);
          }
        }

        function updateBundleInsights(bundlesData, allBundlesData) {
          // Update most popular bundle
          const mostPopular = bundlesData.mostPopular;
          if (mostPopular) {
            // Parse the service and league IDs from JSON strings
            const serviceIds = JSON.parse(mostPopular.service_ids || '[]');
            const leagueIds = JSON.parse(mostPopular.league_ids || '[]');

            // Display services and leagues in a clean format
            document.getElementById('popular-services').textContent = serviceIds.map(id =>
              id.replace(/_/g, ' ').toUpperCase()
            ).join(', ') || 'None';

            document.getElementById('popular-leagues').textContent = leagueIds.map(id =>
              id.replace(/_/g, ' ').toUpperCase()
            ).join(', ') || 'None';

            document.getElementById('popular-price').textContent = '$' + mostPopular.total_price.toFixed(2);
            document.getElementById('popular-count').textContent = mostPopular.creation_count + 'x created';
          } else {
            document.getElementById('popular-services').textContent = 'No services yet';
            document.getElementById('popular-leagues').textContent = 'No leagues yet';
            document.getElementById('popular-price').textContent = '-';
            document.getElementById('popular-count').textContent = '-';
          }

          // Update bundle summary
          const frequencyData = bundlesData.byCreationCount || [];
          const totalBundles = frequencyData.reduce((sum, item) => sum + item.bundle_count, 0);
          const summaryText = totalBundles > 0
            ? '📊 ' + totalBundles + ' unique bundles tracked across all frequency ranges'
            : '📊 No bundle data available yet';
          document.getElementById('bundle-summary').textContent = summaryText;

          // Create or update Bundle Frequency Chart
          const bundleCtx = document.getElementById('bundleFrequencyChart').getContext('2d');
          if (bundleFrequencyChart) {
            bundleFrequencyChart.destroy();
          }

          const frequencyLabels = frequencyData.map(item => item.frequency_range);
          const frequencyCounts = frequencyData.map(item => item.bundle_count);

          bundleFrequencyChart = new Chart(bundleCtx, {
            type: 'doughnut',
            data: {
              labels: frequencyLabels,
              datasets: [{
                data: frequencyCounts,
                backgroundColor: bundleColors.slice(0, frequencyCounts.length),
                borderWidth: 2,
                borderColor: '#fff'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 15,
                    padding: 10,
                    font: {
                      size: 11
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return context.label + ': ' + context.parsed + ' bundles';
                    }
                  }
                }
              }
            }
          });

          // Update bundles table
          const bundlesTableBody = document.getElementById('bundles-table-body');
          bundlesTableBody.innerHTML = '';

          if (allBundlesData.length === 0) {
            bundlesTableBody.innerHTML = '<div class="loading">No bundles created yet</div>';
            return;
          }

          allBundlesData.forEach(bundle => {
            const row = document.createElement('div');
            row.className = 'bundle-row';

            const servicesCell = document.createElement('div');
            servicesCell.className = 'col-services';
            servicesCell.textContent = bundle.serviceIds.map(id => id.replace(/_/g, ' ').toUpperCase()).join(', ');

            const leaguesCell = document.createElement('div');
            leaguesCell.className = 'col-leagues';
            leaguesCell.textContent = bundle.leagueIds.map(id => id.replace(/_/g, ' ').toUpperCase()).join(', ');

            const priceCell = document.createElement('div');
            priceCell.className = 'col-price';
            priceCell.textContent = '$' + bundle.totalPrice.toFixed(2);

            const countCell = document.createElement('div');
            countCell.className = 'col-count';
            countCell.textContent = bundle.creationCount + 'x';

            row.appendChild(servicesCell);
            row.appendChild(leaguesCell);
            row.appendChild(priceCell);
            row.appendChild(countCell);

            bundlesTableBody.appendChild(row);
          });
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

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  } else {
    return res.redirect('/login');
  }
}