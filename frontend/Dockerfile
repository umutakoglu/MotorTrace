# 1. Aşama: Build (Derleme)
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG REACT_APP_API_URL
# Ve bunu React'ın anlayacağı çevre değişkenine çeviriyoruz
ENV REACT_APP_API_URL=$REACT_APP_API_URL
# ----------------------------

RUN npm run build

# 2. Aşama: Nginx (Sunum)
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
