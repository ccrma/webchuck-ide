ARG FROM_IMAGE=python:3.12-alpine
FROM ${FROM_IMAGE}

# Set working directory
WORKDIR /cochuck

# Install PIP dependencies
COPY /requirements.txt /cochuck/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /cochuck/requirements.txt

# Copy app
COPY ./app /cochuck/app

# Set entry command
EXPOSE 9435
CMD [ \
    "uvicorn", "app.main:app", \
    "--workers", "1", \
    "--limit-concurrency", "5000", \
    "--timeout-keep-alive", "60", \
    "--backlog", "2048", \
    "--host", "0.0.0.0", \
    "--port", "9435" \
]
