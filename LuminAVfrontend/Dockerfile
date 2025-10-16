# Imagen base de Nginx
FROM nginx:1.27-alpine

# Copia la carpeta dist al servidor web de Nginx
COPY ./dist /usr/share/nginx/html

# Expone el puerto 80 (web)
EXPOSE 80

# Ejecuta Nginx
CMD ["nginx", "-g", "daemon off;"]