# StreamFinder v3 Deployment Guide

## 🚀 **Production Deployment Architecture**

StreamFinder v3 consists of two applications:

1. **Frontend (Vue.js)** - Can be deployed on Netlify
2. **Backend (Express.js + Analytics)** - Requires Node.js hosting

---

## 📱 **Frontend Deployment (Netlify)**

### **Automated Netlify Deployment**

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   ```
   Base directory: StreamFinder
   Build command: npm run build
   Publish directory: StreamFinder/dist
   ```

### **Manual Deployment**

```bash
cd StreamFinder
npm install
npm run build
# Upload 'dist' folder to Netlify
```

### **Environment Variables (Frontend)**

- No additional environment variables needed
- All configuration is handled in the Vue.js app

---

## 🖥️ **Backend Deployment (Analytics Dashboard)**

The analytics backend requires a Node.js hosting service. **Netlify cannot host the backend.**

### **Recommended: Render.com (Free Tier)**

1. **Create Web Service on Render.com**
2. **Connect GitHub Repository**
3. **Configure Service:**

   ```
   Name: streamfinder-analytics
   Root Directory: StreamFinder/analytics-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables:**
   ```
   DASHBOARD_PASSWORD=your_secure_password_here
   SESSION_SECRET=minimum_32_character_secret_key_for_sessions
   NODE_ENV=production
   PORT=3003
   ```

### **Alternative Hosting Options:**

- **Railway.app** - Easy deployment, good free tier
- **Fly.io** - Global edge deployment
- **DigitalOcean App Platform** - Reliable, good pricing
- **Heroku** - Classic choice (paid plans only)

---

## 🔧 **Production Configuration**

### **Frontend Configuration**

The frontend automatically adapts to detect if analytics backend is available:

- If backend is deployed: Full analytics features
- If backend is not deployed: Frontend-only mode (bundle builder still works)

### **Backend Configuration**

Create production environment variables:

```bash
# Required for production
DASHBOARD_PASSWORD=create_secure_password_here
SESSION_SECRET=create_32_plus_character_secret_here
NODE_ENV=production

# Optional
PORT=3003 # or use hosting provider's PORT
```

### **Database**

- Uses SQLite (file-based database)
- Automatically created on first run
- Data persists in `analytics.db` file

---

## 🌐 **Complete Deployment Workflow**

### **Option 1: Frontend Only (Netlify)**

✅ **Deploy frontend to Netlify**

- Bundle builder works perfectly
- Popular bundles will show "No data yet" until backend is deployed
- Social media export works
- No analytics dashboard

### **Option 2: Frontend + Backend (Recommended)**

✅ **Deploy frontend to Netlify**
✅ **Deploy backend to Render.com (or similar)**

- Full featured application
- Analytics dashboard available
- Bundle tracking and popularity
- Complete social media integration

---

## 📋 **Deployment Checklist**

### **Pre-Deployment**

- [ ] Code is merged to `main` branch
- [ ] All tests pass locally
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend starts successfully (`npm start`)

### **Frontend Deployment**

- [ ] Netlify site connected to GitHub repo
- [ ] Build settings configured correctly
- [ ] Domain configured (if custom domain)
- [ ] HTTPS enabled

### **Backend Deployment (if using)**

- [ ] Hosting service account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] Health check endpoint working

### **Post-Deployment Testing**

- [ ] Frontend loads correctly
- [ ] Bundle builder works
- [ ] Popular bundles section displays
- [ ] Social media export functions
- [ ] Analytics dashboard accessible (if backend deployed)
- [ ] Mobile responsiveness verified

---

## 🔐 **Security Considerations**

### **Production Environment Variables**

```bash
# Generate secure passwords
DASHBOARD_PASSWORD=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 48)
```

### **HTTPS Configuration**

- Netlify automatically provides HTTPS for frontend
- Ensure backend hosting service enables HTTPS
- Update CORS settings if frontend and backend are on different domains

---

## 📊 **Monitoring & Maintenance**

### **Frontend (Netlify)**

- Automatic deployments on git push
- Build logs available in Netlify dashboard
- Edge CDN for global performance

### **Backend (Render/etc)**

- Monitor server logs for errors
- Database grows over time (SQLite file)
- Consider log rotation for production

---

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Build Fails**: Check Node.js version compatibility (use Node 18+)
2. **CORS Errors**: Update backend CORS settings for frontend domain
3. **Database Issues**: Ensure write permissions for SQLite file
4. **Memory Issues**: Monitor backend memory usage with user growth

### **Support**

- Check application logs
- Verify environment variables
- Test API endpoints individually
- Monitor network requests in browser dev tools

---

## 🎉 **Success!**

Once deployed, your StreamFinder v3 application will be available globally with:

- ⚡ Lightning-fast frontend via CDN
- 📊 Real-time analytics and bundle tracking
- 📱 Perfect mobile responsiveness
- 🚀 Production-ready performance
