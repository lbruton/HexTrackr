# Installation Guide

HexTrackr is designed for Docker-only deployment to ensure a consistent and reliable environment.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Running the Application

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Lonnie-Bruton/HexTrackr.git
    cd HexTrackr
    ```

1. **Start the services:**

    Use Docker Compose to build and run the application in detached mode.

    ```bash
    docker-compose up -d --build
    ```

1. **Access HexTrackr:**

    The application will be available at `http://localhost:8080`.

    **Application Endpoints:**

    - **Tickets Management**: `http://localhost:8080/tickets.html`
    - **Vulnerabilities Management**: `http://localhost:8080/vulnerabilities.html`
    - **Documentation Portal**: `http://localhost:8080/docs-html/`
    - **API Documentation**: `http://localhost:8080/docs-html/#api-reference`
