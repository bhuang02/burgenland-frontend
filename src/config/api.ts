/**
 * Configuration class for API endpoints.
 */
const DEFAULT_BACKEND_API_URL = 'http://localhost:8080/api'

export class ApiConfig {
  /** Base URL for the backend API. Defaults to localhost in development */
  static get API_URL(): string {
    if (window.APP_CONFIG?.enabled) {
      return window.APP_CONFIG.VITE_BACKEND_API_URL || DEFAULT_BACKEND_API_URL
    }
    return import.meta.env.VITE_BACKEND_API_URL || DEFAULT_BACKEND_API_URL
  }
}
