## Running the frontend locally with Docker

The frontend is served by nginx and runs on port `8081`.

The frontend calls the backend API. For local Docker testing, the backend should be available at:

```text
http://localhost:8080/api
```

---

## Prerequisites

You need:

* Docker installed
* Access to the frontend container image
* The backend running on port `8080`

If the image is private on GHCR, log in first:

```bash
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

Set the image information:

```bash
export OWNER="your-github-username-or-org"
export FRONTEND_TAG="latest"
```

---

## Run the frontend

Start the frontend:

```bash
docker run --rm \
  --name weather-frontend \
  -p 8081:80 \
  ghcr.io/$OWNER/frontend:$FRONTEND_TAG
```

Open the app in the browser:

```text
http://localhost:8081
```

Make sure to use `http://`, not `https://`.

---

## Optional: Override frontend runtime config

If the frontend image needs to be told where the backend is running, create a local config file:

```bash
cat > config.local.js <<'EOF'
window.APP_CONFIG = {
  enabled: true,
  VITE_BACKEND_API_URL: 'http://localhost:8080/api'
};
EOF
```

Then run the frontend with the config file mounted into nginx:

```bash
docker run --rm \
  --name weather-frontend \
  -p 8081:80 \
  -v "$PWD/config.local.js:/usr/share/nginx/html/config.js:ro" \
  ghcr.io/$OWNER/frontend:$FRONTEND_TAG
```

For local Docker testing, use:

```js
window.APP_CONFIG = {
  enabled: true,
  VITE_BACKEND_API_URL: 'http://localhost:8080/api'
};
```

For Kubernetes, use:

```js
window.APP_CONFIG = {
  enabled: true,
  VITE_BACKEND_API_URL: '/api'
};
```

---

## Why Kubernetes uses `/api`

In Kubernetes, the frontend JavaScript runs in the user’s browser.

So this would be wrong in Kubernetes:

```js
VITE_BACKEND_API_URL: 'http://localhost:8080/api'
```

because `localhost` would mean the user’s laptop, not the backend pod.

Instead, Kubernetes should route the same public hostname like this:

```text
/       → frontend service
/api    → backend service
```

Then the frontend can call:

```text
/api/user/
/api/metar/LOWW
```

and the browser sends those requests to the same hostname that served the frontend.

---

## Notes

* The frontend should not contain the AVWX API key.
* The frontend should only call the backend.
* The backend is responsible for calling AVWX.
* The frontend runtime config can be changed without rebuilding the Docker image by mounting a new `config.js`.
* In Kubernetes, `config.js` should be provided through a ConfigMap.


---

# Hochschule Burgenland - BSWE - WS2024 - 2nd Attempt - Weather App - Frontend - Reference

[![](https://img.shields.io/github/license/muhlba91/hochschule-burgenland-bswe-ws2024-2at-frontend?style=for-the-badge)](LICENSE.md)
[![](https://img.shields.io/github/actions/workflow/status/muhlba91/hochschule-burgenland-bswe-ws2024-2at-frontend/verify.yml?style=for-the-badge)](https://github.com/muhlba91/hochschule-burgenland-bswe-ws2024-2at-frontend/actions/workflows/verify.yml)
[![](https://api.scorecard.dev/projects/github.com/muhlba91/hochschule-burgenland-bswe-ws2024-2at-frontend/badge?style=for-the-badge)](https://scorecard.dev/viewer/?uri=github.com/muhlba91/hochschule-burgenland-bswe-ws2024-2at-frontend)
[![](https://img.shields.io/github/release-date/muhlba91/hochschule-burgenland-bswe-ws2024-2at-frontend?style=for-the-badge)](https://github.com/muhlba91/hochschule-burgenland-bswe-ws2024-2at-frontend/releases)

This is a reference implementation of the weather application's frontend for the 2nd attempt of the "Software Management II" course at the Hochschule Burgenland in WS2024.
It solely acts as a reference, not as a complete implementation, and it is not expected by students to produce a similar implementation.

---

## API Specification

The OpenAPI specification can be found in the [backend repository](https://github.com/muhlba91/fh-burgenland-bswe-ws2024-2at-backend).

---

## Configuration

See [src/config/api.ts](./src/config/api.ts) for all available and default configuration options.

### Build-time Configuration

To run the frontend successfully, you need to provide the following environment variables (development/build time):

- `VITE_BACKEND_API_URL`: The URL of the backend API.
- `VITE_METAR_API_URL`: The URL of the METAR API.
- `VITE_AVWX_API_KEY`: The API key for the [Aviation Weather Rest API](https://avwx.rest/) in the format `Token avwx-api-key`. The value will be used in the `Authorization` header when calling the API.

### Runtime Configuration (Dynamic Loading)

For deploying multiple instances with different configurations using the same build artifact, you can use the runtime configuration provided via `public/config.js`.

This file is loaded dynamically by the browser and can be modified or replaced on the deployed server (e.g., via a Docker entrypoint script or during CI/CD).

To enable runtime overrides, set `enabled: true` in `public/config.js`:

```javascript
window.APP_CONFIG = {
  enabled: true,
  VITE_BACKEND_API_URL: 'https://api.example.com/api',
  // ... other overrides
};
```

If `enabled` is `false` (default), the application will fall back to the build-time environment variables.

---

## Development

The service is implemented in Node.js using the Vue and Quasar frameworks.

### Code Quality

The code quality is ensured by the following tools:

- [ESLint](https://eslint.org/) for JavaScript linting
- [Vitest with v8 Coverage](https://vitest.dev/guide/coverage) for code coverage
- [NPM Audit](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities) for dependency security
- [Conform](https://github.com/siderolabs/conform) for commit message linting
- [CycloneDX](https://cyclonedx.org/) for software bill of materials generation
- [Grype](https://github.com/anchore/grype) for software bill of materials scanning
- [Renovate](https://www.whitesourcesoftware.com/free-developer-tools/renovate/) for dependency updates

### Testing

To run the tests, run the following command:

```shell
yarn test:unit:ci
yarn test:e2e:ci
```

### Linting

To run the linting checks, run the following command:

```shell
# eslint with coverage
yarn lint

# you can fix some issues automatically
yarn fix
```

### Software Bill of Materials

To generate the software bill of materials, run the following command:

```shell
yarn cyclonedx
grype sbom:.quasar/sbom.json
```

### Running

To run the service, run the following command:

```shell
yarn dev
```

### Building

To build the service, run the following command:

```shell
yarn build
```

### Commit Message

Commit messages must adhere to the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

To lint the commit messages, run the following command:

```shell
conform enforce
```

You can also use [Commitizen](https://commitizen.github.io/cz-cli/) to create commit messages:

```shell
cz commit
```

## GitHub Actions

The GitHub Actions workflows ensure that all code quality checks pass and that the code is deployable.

The release workflow creates a new release with publishing the SBOM of the release and its build provenance.

---

## Amazon Web Services Deployment

After building the application, the distribution files are located in [dist/spa](./dist/spa/).

You can find the deployment scripts in [deploy](./deploy/).

> **Note:** If deploying to the `us-east-1` region, remove the `--create-bucket-configuration` parameter as this region is the default location constraint.

```shell
# deploy to an Amazon S3 Bucket with Website Hosting
./deploy/aws-s3-website.sh <BUCKET_NAME> <AWS_REGION> <CACHE_TIME>

# deploy to an Amazon CloudFront Distribution with an Amazon S3 Bucket as the origin
./deploy/cloudfront-s3.sh <BUCKET_NAME> <AWS_REGION> <CACHE_TIME> <AWS_ACCOUNT_ID>
```

---

## Notes

- This project served as an experiment with GitHub Copilot (Anthropic Claude 3.5 Sonnet) creating approximately over 90% of the code, including tests and most code documentation.
- Some workflow steps are allowed to fail due to the repository being private and not having access to certain security features.
- The workflow does not store the artifacts of the release build. If necessary, you can add the `actions/upload-artifact` action to the workflow.
- Features have been added, modified, or removed to showcase specific aspects of the implementation and software management.
