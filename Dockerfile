# 1단계: React 앱 빌드
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./

# lock 파일 불일치 문제 우회
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# 2단계: `Nginx`로 정적 파일 제공
FROM nginx:alpine

# React 빌드 결과물을 복사
COPY --from=builder /app/build /usr/share/nginx/html

# SPA 라우팅 지원 
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
