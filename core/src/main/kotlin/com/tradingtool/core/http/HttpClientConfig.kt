package com.tradingtool.core.http

import java.time.Duration

/**
 * Configuration for HTTP client behavior (timeout, retry, headers).
 */
data class HttpClientConfig(
    /** Default request timeout. */
    val timeout: Duration = Duration.ofSeconds(30),

    /** Retry configuration. Null means no retries. */
    val retryConfig: RetryConfig? = RetryConfig.default(),

    /** Default headers to include in all requests. */
    val defaultHeaders: Map<String, String> = emptyMap(),
) {
    /**
     * Retry strategy: max attempts and backoff calculation.
     */
    data class RetryConfig(
        /** Maximum number of attempts (includes initial). */
        val maxAttempts: Int = 3,

        /** Initial backoff delay in milliseconds. */
        val initialDelayMs: Long = 100,
    ) {
        init {
            require(maxAttempts >= 1) { "maxAttempts must be >= 1" }
            require(initialDelayMs > 0) { "initialDelayMs must be > 0" }
        }

        /**
         * Calculate exponential backoff: 100ms, 200ms, 400ms, ...
         */
        fun calculateDelay(attemptIndex: Int): Long {
            return initialDelayMs * (1L shl attemptIndex)
        }

        companion object {
            fun default(): RetryConfig = RetryConfig()
            fun none(): RetryConfig? = null
        }
    }
}
