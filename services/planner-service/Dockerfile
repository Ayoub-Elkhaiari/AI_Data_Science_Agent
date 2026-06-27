FROM python:3.12-slim

WORKDIR /app

COPY docker/requirements.txt /tmp/requirements.txt

RUN pip install \
    --default-timeout=1000 \
    --retries=10 \
    --no-cache-dir \
    -r /tmp/requirements.txt

COPY shared /app/shared
COPY services/planner-service /app/service

ENV PYTHONPATH=/app

CMD ["uvicorn", "service.main:app", "--host", "0.0.0.0", "--port", "8000"]