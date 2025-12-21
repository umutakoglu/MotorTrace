# --- 1. Aşama: Build (İnşaat) ---
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Eklediğimiz kısım burasıydı:
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# --- 2. Aşama: Production (Sunum) ---
# DİKKAT: Bu kısım silindiyse konteyner çalışıp hemen kapanır!
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
