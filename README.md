# Demo app: A backend utilizing Node.js, Python and MongoDB

[![CI](https://github.com/WalasPrime/demo-nestjs-python-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/WalasPrime/demo-nestjs-python-backend/actions/workflows/ci.yml)

This is a personal lab project with the goal of demonstrating a use case where Node.js is used as an HTTP API as an ingest layer that orchestrates jobs to Python workers.

Python is a popular choice for AI workloads, while Node.js performs well when processing data streams - like HTTP traffic.

This project was coded manually, with occasional AI assist and serves as a skill refresher for me. Feel free to use it however you like.

## Usage

The project can be easily run using Docker, which enables scaling the Python workers easily:

```bash
docker compose up -d --scale worker=4
```

Then, after accessing [localhost:3000](https://localhost:3000/) check your logs for trace of jobs being dispatched:

```bash
docker compose logs --tail 100 -f
```

Keep refreshing the page to dispatch more jobs - they should be received by random workers each time.

## Development process

1. I natively work in vscode over SSH (on a VM in my home server). I like to keep the guest system clean, so I've created the initial docker-compose.yml file with a "workspace" service based on a node image to let me run "npm" commands in it.
2. I followed [https://docs.nestjs.com/cli/overview](https://docs.nestjs.com/cli/overview), did `npm install -g @nestjs/cli` and `nest new apps/api` to bootstrap a NestJS project (I know the boilerplate well and always use it).
3. I created a Dockerfile for the `apps/api` subproject and added it as service `api` to the docker-compose.yml stack - now we have a Hello World HTTP project at localhost:3000 with no coding yet.
4. I started to track some design considerations in `apps/api/adr`, starting with [01-cpu-scaling](./apps/api/adr/01-cpu-scaling.md).
5. After some research - I decided to go ahead with RabbitMQ and the existing support for it via `@nestjs/microservices`. Adding the first dependency also requires some ability to provide runtime configuration, so I utilized `@nestjs/config` which utilizes `dotenv`. I've implemented a simple message publish on HTTP request to `/` just to get things going.
6. I did some brief research into modern Python frameworks. I do some work with Python occasionally (most recently setting up a Dask cluster and utilizing the RAPIDS library). I decided to go with the bleeding edge - Python 3.14 and `uv`. For the libraries - it seems that I should use `pika` to connect with the MQ broker. I used AI research here to get through obstacles quickly (like not seeing any logs in the Python service - turns out we need a magic env variable to prevent output buffering!).
7. I noticed some flakyness when starting the stack from scratch. I added a custom healthcheck to the rabbitmq service and I added an example to the README on how to run more than a single worker. Now the stack is reliable.
8. Before I expand the project more, I'd like to set up a testing convention, along with a basic testing pipeline with GitHub Actions. First, I introduced jest-mock-extended with its `mockDeep` which simplifies things a lot, then fixed the default NestJS tests. For the Python side I relied on AI research again to do the same - restructure and introduce pytest. After all tests got green I moved to preparing a simple GitHub Actions workflow triggered after a push. I specifically introduced some parallel steps with waiting semaphores, since those speed up things considerably usually.
9. I thought that since I just set up GitHub Actions I might as well set up a GitHub Page with statically compiled docs. Since the API is the front-facing service, I could utilize NestJS features to generate static docs. Should be simple enough.