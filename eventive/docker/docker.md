# Docker Deployment Guide

## Overview

This project (Eventive) is containerized using Docker for easy deployment and consistent environments across development, staging, and production.

## Architecture

- **Build Stage**: Uses Node.js 20 Alpine to build the React + Vite application
- **Production Stage**: Uses Nginx Alpine to serve the built static files
- **Multi-stage build**: Keeps final image small (~50MB vs ~1GB with full Node.js)

## Quick Start

### Production Build

```bash
# From repository root
cd c:\$projects\tsa-repository
docker-compose up -d

# Access at http://localhost:3000 (local development)
```

### Development Mode

```bash
# Run with hot reload (Vite dev server)
docker-compose --profile development up dev

# Access at http://localhost:5173 (local development)
```

### Manual Docker Commands

```bash
# Build image (from repository root)
docker build -t tsa-project .

# Run container
docker run -p 3000:80 --env-file .env tsa-project

# Stop container
docker stop <container-id>
```

## Environment Variables

Your `.env` file is at the repository root with Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The `.env` file is mounted as read-only in the container from the root directory.

**Note**: Vite embeds environment variables at **build time**, so the `.env` must be present when running `docker build`. The container mount is mainly for reference.

## Nginx Configuration

The `nginx.conf` file includes:

- **SPA Routing**: All routes fallback to `index.html` (required for React Router)
- **Gzip Compression**: Reduces bundle size by ~70%
- **Static Asset Caching**: 1 year cache for JS/CSS/images
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

## Performance Benefits

1. **Fast Builds**: Multi-stage build separates build artifacts from runtime
2. **Small Image**: ~50MB final image (Alpine Linux + Nginx)
3. **Quick Deploys**: Efficient layer caching speeds up rebuilds
4. **Production-Ready**: Nginx handles static files better than Node.js dev server

## Deployment Platforms

### Fly.io
```bash
fly launch
fly deploy
```

### Railway
```bash
railway init
railway up
```

### DigitalOcean App Platform
- Connect GitHub repository
- Set build command: `npm run build`
- Set run command: Uses Dockerfile automatically

### AWS ECS / Google Cloud Run
- Push image to ECR/GCR
- Deploy container with environment variables

## Docker Compose Services

### `web` (Production)
- Builds production-optimized image
- Serves on port 3000
- Uses Nginx for static file serving
- Auto-restarts on failure

### `dev` (Development)
- Uses Vite dev server with hot reload
- Mounts source code as volume (changes reflect instantly)
- Serves on port 5173
- Only runs with `--profile development` flag

## Health Checks

Add health check to docker-compose.yml:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:80"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs web

# Common issues:
# - Missing .env file
# - Port 3000 already in use
# - Build errors (check package.json scripts)
```

### Can't access at localhost:3000
```bash
# Check if container is running
docker ps

# Check port mapping
docker port <container-id>

# Try 127.0.0.1:3000 if localhost doesn't work
```

### Build is slow
```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker build -t tsa-project .

# Or with docker-compose
DOCKER_BUILDKIT=1 docker-compose build
```

### Environment variables not loading
- Ensure `.env` file is in the root directory
- Restart container after .env changes: `docker-compose restart`
- Check variable names start with `VITE_` prefix

## Production Checklist

- [ ] `.env` file with production Supabase credentials
- [ ] Update `VITE_SUPABASE_URL` to production URL
- [ ] Enable HTTPS (use reverse proxy like Caddy or Nginx)
- [ ] Set up monitoring (Docker logs to cloud provider)
- [ ] Configure auto-scaling (platform-specific)
- [ ] Add health checks for orchestration
- [ ] Set resource limits (CPU/memory)
- [ ] Enable log aggregation

## File Structure

```
tsa-repository/
├── .env                   # Environment variables
├── Dockerfile             # Multi-stage build config
├── docker-compose.yml     # Orchestration config
├── .dockerignore         # Build context exclusions
├── nginx.conf            # Nginx server config
├── vite.config.ts        # Vite loads .env from root
└── src/                  # Application source code
```

## Next Steps

1. Test locally: `cd c:\$projects\tsa-repository; docker-compose up`
2. Verify at `http://localhost:3000` (local development)
3. Push to GitHub
4. Deploy to cloud platform (Fly.io, Railway, etc.)
5. Configure custom domain
6. Set up CI/CD pipeline