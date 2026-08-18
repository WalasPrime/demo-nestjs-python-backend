# Demo app: A backend utilizing Node.js, Python and RabbitMQ

[![CI](https://github.com/WalasPrime/demo-nestjs-python-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/WalasPrime/demo-nestjs-python-backend/actions/workflows/ci.yml) [![Docs](https://img.shields.io/badge/pages-docs-blue?logo=github)](https://walasprime.github.io/demo-nestjs-python-backend/)

This is a personal lab project with the goal of demonstrating a use case where Node.js is used as an HTTP API as an ingest layer that orchestrates jobs to Python workers.

Python is a popular choice for AI workloads, while Node.js performs well when processing data streams - like HTTP traffic.

This project was coded manually, with occasional AI assist and serves as a skill refresher for me. Feel free to use it however you like.

## Usage

The project can be easily run using Docker, which enables scaling the Python and API workers easily:

```bash
docker compose up -d --scale worker=4 --scale api=2
```

Then, after accessing [localhost:3000/example-job](http://localhost:3000/example-job) you'll see a job result payload, and you can check your logs for trace of jobs being dispatched and handled across the services:

```bash
docker compose logs --tail 100 -f
```

Keep refreshing the page to dispatch more jobs - they should be received by random workers each time. The payload itself will contain a `replyTo` with an API instance id that will change depending on how many `api` instances you spawned. You can take a look at the `jaeger` UI at [localhost:16686](http://localhost:16686/) to gain some insight into the app operation (very limited at this time).

## Development process

1. I natively work in vscode over SSH (on a VM in my home server). I like to keep the guest system clean, so I've created the initial docker-compose.yml file with a "workspace" service based on a node image to let me run "npm" commands in it.
2. I followed [https://docs.nestjs.com/cli/overview](https://docs.nestjs.com/cli/overview), did `npm install -g @nestjs/cli` and `nest new apps/api` to bootstrap a NestJS project (I know the boilerplate well and always use it).
3. I created a Dockerfile for the `apps/api` subproject and added it as service `api` to the docker-compose.yml stack - now we have a Hello World HTTP project at localhost:3000 with no coding yet.
4. I started to track some design considerations in `apps/api/adr`, starting with [01-cpu-scaling](./apps/api/adr/01-cpu-scaling.md).
5. After some research - I decided to go ahead with RabbitMQ and the existing support for it via `@nestjs/microservices`. Adding the first dependency also requires some ability to provide runtime configuration, so I utilized `@nestjs/config` which utilizes `dotenv`. I've implemented a simple message publish on HTTP request to `/` just to get things going.
6. I did some brief research into modern Python frameworks. I do some work with Python occasionally (most recently setting up a Dask cluster and utilizing the RAPIDS library). I decided to go with the bleeding edge - Python 3.14 and `uv`. For the libraries - it seems that I should use `pika` to connect with the MQ broker. I used AI research here to get through obstacles quickly (like not seeing any logs in the Python service - turns out we need a magic env variable to prevent output buffering!).
7. I noticed some flakyness when starting the stack from scratch. I added a custom healthcheck to the rabbitmq service and I added an example to the README on how to run more than a single worker. Now the stack is reliable.
8. Before I expand the project more, I'd like to set up a testing convention, along with a basic testing pipeline with GitHub Actions. First, I introduced jest-mock-extended with its `mockDeep` which simplifies things a lot, then fixed the default NestJS tests. For the Python side I relied on AI research again to do the same - restructure and introduce pytest. After all tests got green I moved to preparing a simple GitHub Actions workflow triggered after a push. I specifically introduced some parallel steps with waiting semaphores, since those speed up things considerably usually.
9. I thought that since I just set up GitHub Actions I might as well set up a GitHub Page with statically compiled docs. Since the API is the front-facing service, I could utilize NestJS features to generate static docs. Should be simple enough. Update: It wasn't! It required a lot of tinkering to make it work in the end.
10. Before increasing project scope I want to ensure that there is a way to have some sort of a contract on the shape of messages going through the queue. I've created [03-message-schemas.md](./apps/api/adr/03-message-schemas.md) to document my thoughts. I added `pydantic` to the worker, and `zod` for the api. Next I introduced a convention to define the schemas and used them with the shape that was already used (very basic, still just an "example" shape). The goal is to publish and accept only the compatible message shape. For `zod` I wrote the schemas manually, for `pydantic` I relied on AI more, although I specifically indicated that I want to utilize discriminators immediately to set up a convention for new types of messages.
11. I've tried using `@nestjs/microservices` and it seems to work great when the consumer and the producer is based on NestJS. I've decided to go for a raw `amqplib` integration this time. It would normally require some extra patchwork (like passing a correlation id so that if the api is scaled out then the job result lands at the originating dispatcher instance, rather than being a simple broadcast of a result to all api instances), but I might limit the project scope in this case to just being able to scale the workers and not the api. Now the api also consumes broadcasted results.
12. I decided to address the fact that we don't really do anything with the worker result, so I modified the [dispatcher](./apps/api/src/modules/dispatcher/dispatcher.service.ts) to assign job identifiers and to track dispatched jobs to expose an easy _dispatch-and-await_ interface for the rest of the codebase. As a result, a new `/example-job` endpoint is available. This still does not address the fact that results are randomly passed just to a single api instance - which is problematic even if the app is running and we start some E2E tests at the same time.
13. Time to address the result queue issue. To fix this I'll utilize a more complex RabbitMQ setup that utilizes exchanges, bindings and temporary queues. At this point I could also introduce Traefik and provide instructions on how to scale the API workers as well. I'll keep this in mind in case I have time to expand the scope of this project.
14. I'd like to expand more into the Python worker package. I've decided to adopt `ruff` and `mypy` for static code analysis. I had to immediately fix some issues, and then adjust the CI to run the tools.
15. I played around with the idea to scale the API service as well. To enable this, the stack needs a reverse proxy. I have experience with `traefik` so I adopted it here. I was also thinking about presenting a way to observe how the app behaves. I managed to get `jaeger` working in the stack as well. For now, just the requests are opaquely visible, but since it's all based on OpenTelemetry these days, I can provide more transparency into the app logic in the future.
16. To improve observability further - I adopted `nestjs-otel` along with `@opentelemetry/instrumentation-amqplib` which should give me all the tools I need to cover the API side. This along with huge AI support to implement observability on Python side and clarifying some timing concerns from my side turned out very well. Traces visible in jaeger UI now span across traefik reverse proxy, the api, and the worker. Inspecting an `/example-job` trace reveals the entire data path.