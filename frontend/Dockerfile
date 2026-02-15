FROM node:alpine

ARG VITE_API_URL
ARG STATIC_FILE_URL

#set environment variables during the build
ENV VITE_API_URL=$VITE_API_URL
ENV STATIC_FILE_URL=$STATIC_FILE_URL

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview"]
