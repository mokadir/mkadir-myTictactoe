# ============================================================
# NEON TIC TAC TOE — DOCKERFILE
# Multi-stage build serving static files via Nginx
# ============================================================

# ---- Stage 1: Base (nginx-alpine) ----
FROM nginx:stable-alpine AS base

# Remove default Nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy application files into the Nginx document root
COPY index.html /usr/share/nginx/html/
COPY css/        /usr/share/nginx/html/css/
COPY js/         /usr/share/nginx/html/js/

# ---- Stage 2: Production ----
FROM nginx:stable-alpine

# Copy custom Nginx configuration (optional, use defaults for simple static)
COPY --from=base /usr/share/nginx/html /usr/share/nginx/html

# Expose port 80 (default Nginx)
EXPOSE 80

# Health check to verify the server is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]