# ==============================================================================
# Frontend Dockerfile for MyGarage
# Nginx Alpine base for high performance & ultra-small footprint
# ==============================================================================
FROM nginx:alpine

# Copy custom Nginx configuration with reverse proxy for /api and /uploads
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static website files into Nginx public directory
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/

# Expose port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
