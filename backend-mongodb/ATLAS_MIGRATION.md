# Atlas Migration Guide

## Your Atlas Connection Details:
- **Cluster:** cluster0.cxdltx.mongodb.net
- **Username:** nafim
- **Database:** tea-stall

## Complete Migration Steps:

### 1. Replace Password and Test Connection
```bash
# Edit test-atlas.js and replace YOUR_PASSWORD with your actual password
node test-atlas.js
```

### 2. Import Your Data to Atlas
```bash
# Replace YOUR_PASSWORD with your actual password
node import-atlas.js "mongodb+srv://nafim:YOUR_PASSWORD@cluster0.cxdltx.mongodb.net/tea-stall"
```

### 3. Update Your Backend Configuration
```bash
# Edit .env file and update MONGODB_URI:
MONGODB_URI=mongodb+srv://nafim:YOUR_PASSWORD@cluster0.cxdltx.mongodb.net/tea-stall?retryWrites=true&w=majority
```

### 4. Test Your Backend with Atlas
```bash
node server.js
```

## Current Status:
✅ Local data exported (12 products, 2 users)
✅ Atlas cluster created (free M0 tier)
✅ Import scripts ready
🔄 Waiting for password to complete migration

## Next: Git Push
Once migration is complete, we'll push everything to Git!