# ==========================================
# Frontend Dockerfile (Production Nginx)
# ==========================================
FROM nginx:1.27-alpine

# Set working directory inside Nginx
WORKDIR /usr/share/nginx/html

# Clean up default Nginx static files
RUN rm -rf ./*

# Copy frontend static assets into Nginx web root
COPY index.html style.css app.js ./

# Document exposed HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
