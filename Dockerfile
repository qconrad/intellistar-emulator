# Dockerfile for Intellistar Emulator

FROM python:3.11-slim

WORKDIR /app

# Install minimal build deps for Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    libpng-dev \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

ENV PYTHONUNBUFFERED=1

# Use gunicorn for more robust serving in container
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app", "--workers", "2"]
