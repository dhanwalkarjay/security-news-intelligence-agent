# Security News Intelligence Agent - Startup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account configured (connection strings in .env)
- Groq API key in .env

## Installation & Startup

### Backend Setup
```bash
cd backend
npm install
npm run dev    # Starts on port 5000
```

Expected output:
```
Server running on http://localhost:5000
MongoDB connected successfully
```

### Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev    # Starts on port 3000
```

Expected output:
```
  ▲ Next.js 16.1.4
  - Local:        http://localhost:3000
```

## API Endpoints

### 1. GET /health
Check backend status
```bash
curl http://localhost:5000/health
```
Response: `{"status":"ok","mongo":"connected"}`

### 2. POST /api/news/fetch
Fetch articles for keyword
```bash
curl -X POST http://localhost:5000/api/news/fetch \
  -H "Content-Type: application/json" \
  -d '{"keyword":"ransomware"}'
```

### 3. GET /api/news/articles
Get all stored articles
```bash
curl http://localhost:5000/api/news/articles
```

### 4. POST /api/ai/analyze
Analyze an article
```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"articleId":"<article_id>","skills":"Python, networking"}'
```

## Test Checklist

### TC01: Valid Keyword
1. Open http://localhost:3000
2. Enter "ransomware" in keyword field
3. Click "Fetch"
4. ✅ Should show articles in dropdown

### TC02: Empty Keyword Validation
1. Clear keyword field
2. "Fetch" button should be disabled
3. ✅ No API call made

### TC03: AI Analysis
1. Select an article from dropdown
2. Enter skills (e.g., "SOC, Linux, Python")
3. Click "Analyze Selected Article"
4. ✅ Should show 3 tabs: Executive, Technical, Beginner
5. ✅ Each tab shows formatted analysis

### TC04: Job Recommendations
1. After analysis, scroll to "Suggested Security Jobs"
2. ✅ Should show 3 job recommendations
3. ✅ Each with role name and description

## Troubleshooting

### MongoDB Connection Failed
- Check .env file has MONGO_URI or MONGO_DIRECT_URI
- Ensure IP is whitelisted in MongoDB Atlas
- Check network/ISP isn't blocking port 27017
- Backend will fallback to local JSON storage if DB fails

### Groq API Error
- Verify GROQ_API_KEY starts with "gsk_"
- Check token limits haven't been exceeded
- Verify article content isn't empty (cleaned)

### Frontend shows loading forever
- Check browser console for 404 errors
- Verify backend is running on port 5000
- Check NEXT_PUBLIC_API_BASE_URL in frontend/.env.local

## Fixed Issues
✅ Added PORT to .env
✅ Fixed Article schema (added content, keyword fields, indices)
✅ Added keyword to article save in newsRoutes
✅ Enhanced jobAgent error handling
✅ Added root "/" route
✅ Added frontend .env.local
✅ Added nodemon and dev script to backend
