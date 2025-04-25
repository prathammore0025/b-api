version: '3.8'

networks:
  demo:
    driver: bridge

services:
  admin:
    build: ./Admin
    ports:
      - "8001:8001"
    env_file:
      - ./Admin/.env
    networks:
      - demo

  authentication:
    build: ./Authentication
    ports:
      - "8002:8002"
    env_file:
      - ./Authentication/.env
    networks:
      - demo

  subscription:
    build: ./Subscription
    ports:
      - "8006:8006"
    env_file:
      - ./Subscription/.env
    networks:
      - demo

  chat:
    build: ./Chat
    ports:
      - "8005:8005"
    env_file:
      - ./Chat/.env
    networks:
      - demo

  notification:
    build: ./Notification
    ports:
      - "8007:8007"
    env_file:
      - ./Notification/.env
    networks:
      - demo

  userprofile:
    build: ./UserProfile
    ports:
      - "8003:8003"
    env_file:
      - ./UserProfile/.env
    networks:
      - demo

