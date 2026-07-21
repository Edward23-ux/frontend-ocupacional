# --- ETAPA 1: Construcción (Build) ---
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalación limpia de dependencias
RUN npm ci

# Copiamos todo el código fuente
COPY . .

# Compilamos el proyecto (genera la carpeta dist/)
RUN npm run build

# --- ETAPA 2: Servidor Web (Nginx) ---
FROM nginx:alpine

# Limpiamos el contenido por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiamos exactamente el contenido generado en /dist a Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponemos el puerto estándar web
EXPOSE 80

# Ejecutamos Nginx
CMD ["nginx", "-g", "daemon off;"]