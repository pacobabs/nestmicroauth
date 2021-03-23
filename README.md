# NestJS micro services authentication with React

## Services

The services interact via **TCP sockets**

- API gateway
- User service - responsible for CRUD operations on users and creating, decoding, destroying JWT tokens.

### Diagram

A diagram of the architecture is shown below.

![Architecture Diagram](https://raw.githubusercontent.com/benjsicam/nestjs-rest-microservices/master/docs/img/archi-diagram.png)

## Deployment

Deployment is done with containers in mind. A Docker Compose file along with Dockerfiles for each project are given to run the whole thing on any machine.

## How to Run

### Running locally

1. Rename the env.example to .env and set the appropriate configuration.

2. On the Terminal, go into the project's root folder and execute `npm run start:dev`.

3. Once the start script is done, the API Gateway will listening on [http://localhost:8000](http://localhost:8000)

4. To test the API, head to the Swagger UI running at [http://localhost:8000/api](http://localhost:8000/api)

### Running with Docker

1. Rename the env.example to .env and set the appropriate configuration.

2. On the Terminal, go into the project's root folder and execute `docker network create infrastructure`.

3. Launch the services by executing the command `docker-compose up -d`.

4. Once the start script is done, the API Gateway will listening on [http://localhost:8000](http://localhost:8000)

5. To test the API, head to the Swagger UI running at [http://localhost:8000/api](http://localhost:8000/api)
