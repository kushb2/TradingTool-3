package com.tradingtool.core.http

/**
 * Sealed HTTP error type representing different failure modes.
 */
sealed class HttpError {
    /**
     * Network error: timeout, connection refused, broken pipe, etc.
     */
    data class NetworkError(
        val cause: Throwable,
        val message: String = cause.message ?: "Network error",
    ) : HttpError()

    /**
     * HTTP status error (4xx, 5xx).
     */
    data class HttpStatusError(
        val statusCode: Int,
        val body: String,
    ) : HttpError() {
        val isClientError: Boolean = statusCode in 400..499
        val isServerError: Boolean = statusCode in 500..599
    }

    /**
     * JSON serialization/deserialization error.
     */
    data class SerializationError(
        val cause: Throwable,
        val message: String = cause.message ?: "Serialization error",
    ) : HttpError()

    /**
     * Unknown or unexpected error.
     */
    data class UnknownError(
        val cause: Throwable,
        val message: String = cause.message ?: "Unknown error",
    ) : HttpError()

    /**
     * Human-readable error description.
     */
    fun describe(): String = when (this) {
        is NetworkError -> "Network error: $message"
        is HttpStatusError -> "HTTP $statusCode error"
        is SerializationError -> "Serialization error: $message"
        is UnknownError -> "Unknown error: $message"
    }
}
