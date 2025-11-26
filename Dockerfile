# Etapa 1: build Angular
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --configuration=production

# Etapa 2: Nginx
FROM nginx:alpine

# Copiamos SOLO el build final (browser o no según tu output)
COPY --from=build /app/dist/FrontWeb/browser/ /usr/share/nginx/html/

# Config nginx SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
