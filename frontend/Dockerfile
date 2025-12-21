# Alpine yerine standart Node imajı kullanıyoruz (Daha güvenli)
FROM node:18 as build

WORKDIR /app

COPY package*.json ./
# Artık eksik kütüphane hatası almadan kurulum yapacaktır
RUN npm install

COPY . .

# Bu satırlar HTTPS ayarı için KRİTİK, sakın silme!
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# 2. Aşama: Nginx (Burası aynı kalabilir, sunum için Alpine sorun olmaz)
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
