FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
EXPOSE 4200
CMD ["npm","run","start","--","--host","0.0.0.0","--port","4200"]
