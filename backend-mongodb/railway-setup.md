# Railway.app MongoDB Setup Guide

## Free MongoDB Hosting on Railway

### 1. Sign up at Railway.app
- Visit: https://railway.app
- Sign up with GitHub account
- No card required for free tier

### 2. Create MongoDB Service
- Click "New Project"
- Select "Deploy from Template"
- Search for "MongoDB"
- Deploy free MongoDB instance

### 3. Get Connection Details
- Click on your MongoDB service
- Go to "Variables" tab
- Copy MONGO_URL connection string

### 4. Free Tier Limits
- $5 monthly credit (enough for small projects)
- 512MB RAM
- 1GB disk space
- No card required initially

### 5. Connection String Format
```
mongodb://username:password@host:port/database
```

### 6. Update Your .env File
```
MONGODB_URI=your_railway_mongodb_url
```