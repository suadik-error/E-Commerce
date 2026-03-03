# Deployment Plan

## Tasks
- [ ] Fix Dockerfile to properly copy root package.json for production dependencies
- [ ] Create production environment variables checklist
- [ ] Verify health check endpoint works
- [ ] Deploy to Fly.io

## Environment Variables Required (to be set on Fly.io)
- MONGO_URL
- JWT_SECRET
- UPSTASH_REDIS_URL (optional)
- CLOUDINARY_CLOUD_NAME (optional)
- CLOUDINARY_API_KEY (optional)
- CLOUDINARY_API_SECRET (optional)
- RESEND_API_KEY (optional)
- RESEND_FROM_EMAIL (optional)
- TWILIO_ACCOUNT_SID (optional)
- TWILIO_AUTH_TOKEN (optional)
- TWILIO_FROM_NUMBER (optional)
- STRIPE_SECRET_KEY (optional)
- STRIPE_WEBHOOK_SECRET (optional)

## Status: In Progress
