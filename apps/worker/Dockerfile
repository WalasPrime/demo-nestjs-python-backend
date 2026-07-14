FROM python:3.14-alpine AS base
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev
COPY src/ ./src/
CMD ["uv", "run", "python", "-m", "src.worker.consumer"]