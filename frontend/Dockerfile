# =============================================================================
# Depromos ERP Frontend - Dockerfile (Angular 17 + Nginx)
# Consistente con frontend v1.1.0
# =============================================================================

# --- Stage 1: Build Angular app ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --prefer-offline

# Copy source code
COPY . .

# Build for production
RUN npx ng build --configuration=production

# --- Stage 2: Serve with Nginx ---
FROM nginx:1.25-alpine

LABEL maintainer="InnovaWeb <dev@innovaweb.cl>"
LABEL description="Depromos ERP Frontend - Angular 17"
LABEL version="1.1.0"

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app from builder stage
COPY --from=builder /app/dist/depromos-erp/browser /usr/share/nginx/html

# Non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
