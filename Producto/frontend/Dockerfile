# 1. Etapa de Construcción (Build)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # Esto genera la carpeta 'dist' que acabas de probar

# 2. Etapa de Servidor (Production)
FROM nginx:alpine
# Copiamos lo que construimos en la etapa anterior a la carpeta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copiamos una configuración básica de Nginx (opcional pero recomendado)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]