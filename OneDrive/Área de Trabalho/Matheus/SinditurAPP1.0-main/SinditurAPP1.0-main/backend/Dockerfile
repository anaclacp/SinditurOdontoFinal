FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for WeasyPrint and others
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     python3-dev \
#     python3-pip \
#     python3-setuptools \
#     python3-wheel \
#     python3-cffi \
#     libcairo2 \
#     libpango-1.0-0 \
#     libpangocairo-1.0-0 \
#     libgdk-pixbuf2.0-0 \
#     libffi-dev \
#     shared-mime-info \
#     && rm -rf /var/lib/apt/lists/*

COPY requirements_docker.txt .
RUN pip install --no-cache-dir -r requirements_docker.txt

COPY . .

# Expose port 8001 to match frontend/admin expectations
EXPOSE 8001

CMD ["uvicorn", "server:fastapi_app", "--host", "0.0.0.0", "--port", "8001"]
