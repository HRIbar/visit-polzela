---
name: "Expert Docker Build & Run for Visit Polzela"
description: "Use this skill when the user asks to build the Docker container image from the project Dockerfile and run it so the app is reachable on port 8080 from the outside (e.g. 'build and run the container', 'start the app in Docker', 'dockerize and expose on 8080')."
version: "1.0.0"
---

# Instructions
You are an expert agent specialized in building and running the **Visit Polzela** application as a Docker container. When this skill is active, you must follow these rules:

- **Rule 1:** Always use the `Dockerfile` located at the project root — do **not** create or modify it unless the user explicitly requests a change.
- **Rule 2:** Tag the image as `visit-polzela` to stay consistent with existing project documentation (`AGENTS.md`, `README.md`).
- **Rule 3:** Map container port **8080 → host port 8080** so the application is reachable at `http://localhost:8080` from outside the container.
- **Rule 4:** The Dockerfile performs a full Maven + Vite build inside the image (multi-stage). Expect the first build to take several minutes while dependencies are downloaded.
- **Rule 5:** Run the container in **detached mode** (`-d`) by default so the terminal is not blocked. Add `--rm` so the container is cleaned up automatically when stopped.
- **Rule 6:** Set the container name to `visit-polzela-app` for easy reference in follow-up `docker stop` / `docker logs` commands.
- **Rule 7:** Pass the required environment variables that the image expects (`QUARKUS_HTTP_HOST`, `QUARKUS_HTTP_PORT`) — they are already baked into the Dockerfile, so no extra `-e` flags are needed unless the user wants to override them.

## Contextual Knowledge
- The Dockerfile uses a **two-stage build**: `maven:3.9-eclipse-temurin-17-alpine` for building, `gcr.io/distroless/java17-debian11:nonroot` for the runtime image.
- The über-jar produced is `target/visit-polzela-1.0-runner.jar`.
- The app listens on `0.0.0.0:8080` inside the container (set by `QUARKUS_HTTP_HOST` / `QUARKUS_HTTP_PORT` env vars in the Dockerfile).
- REST API is available at `http://localhost:8080/api/` and the React SPA at `http://localhost:8080/`.

## Output Format
- Always show the exact commands to run, in order.
- After issuing commands, confirm how to verify the container is running and how to tail logs.
- Include a "Useful Follow-up Commands" section at the end.

# Examples

### User Prompt:
"Build the Docker container and run it on port 8080."

### Agent Response:

To build the image and start the container exposed on port 8080, run the following two commands from the project root:

**Step 1 — Build the image**
```bash
docker build -t visit-polzela .
```
This triggers the full multi-stage build (Maven downloads Java dependencies, `frontend-maven-plugin` downloads Node.js and runs `npm install` + `vite build`, then packages the Quarkus über-jar).

**Step 2 — Run the container**
```bash
docker run -d --rm --name visit-polzela-app -p 8080:8080 visit-polzela
```

| Flag | Purpose |
|------|---------|
| `-d` | Detached — runs in the background |
| `--rm` | Auto-remove the container when it stops |
| `--name visit-polzela-app` | Gives the container a predictable name |
| `-p 8080:8080` | Maps host port 8080 → container port 8080 |

The app will be available at **http://localhost:8080** once Quarkus finishes starting up (usually a few seconds after the container starts).

---

## Useful Follow-up Commands

```bash
# Check the container is running
docker ps --filter name=visit-polzela-app

# Tail live logs
docker logs -f visit-polzela-app

# Stop (and auto-remove) the container
docker stop visit-polzela-app

# Rebuild after code changes (stop first, then rebuild & re-run)
docker stop visit-polzela-app
docker build -t visit-polzela .
docker run -d --rm --name visit-polzela-app -p 8080:8080 visit-polzela
```

