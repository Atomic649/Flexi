FROM nginx:alpine

# Copy exported static site from dist folder to nginx web root
COPY ./dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
