# Demo app: A backend utilizing Node.js, Python and MongoDB

This is a personal lab project with the goal of demonstrating a use case where Node.js is used as an HTTP API as an ingest layer that orchestrates jobs to Python workers.

Python is a popular choice for AI workloads, while Node.js performs well when processing data streams - like HTTP traffic.

This project was coded manually, with occasional AI assist and serves as a skill refresher for me. Feel free to use it however you like.

## Process

1. I natively work in vscode over SSH (on a VM in my home server). I like to keep the guest system clean, so I've created the initial docker-compose.yml file with a "workspace" service based on a node image to let me run "npm" commands in it.
2. I followed [https://docs.nestjs.com/cli/overview](https://docs.nestjs.com/cli/overview), did `npm install -g @nestjs/cli` and `nest new apps/api` to bootstrap a NestJS project (I know the boilerplate well and always use it).
3. I created a Dockerfile for the `apps/api` subproject and added it as service `api` to the docker-compose.yml stack - now we have a Hello World HTTP project at localhost:3000 with no coding yet.
4. I started to track some design considerations in `apps/api/adr`, starting with [01-cpu-scaling](./apps/api/adr/01-cpu-scaling.md).