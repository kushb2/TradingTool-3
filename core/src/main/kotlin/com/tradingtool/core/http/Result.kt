package com.tradingtool.core.http

/**
 * Sealed result type for HTTP operations.
 * Distinguishes success from failure without exceptions.
 */
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Failure(val error: HttpError) : Result<Nothing>()

    /**
     * Get the success value or null if this is a failure.
     */
    fun getOrNull(): T? = when (this) {
        is Success -> data
        is Failure -> null
    }

    /**
     * Get the error or null if this is a success.
     */
    fun errorOrNull(): HttpError? = when (this) {
        is Success -> null
        is Failure -> error
    }

    /**
     * Transform the success value, pass through failures.
     */
    inline fun <R> map(transform: (T) -> R): Result<R> = when (this) {
        is Success -> Success(transform(data))
        is Failure -> this
    }

    /**
     * Recover from a failure with a fallback value.
     */
    @Suppress("UNCHECKED_CAST")
    fun getOrElse(fallback: (HttpError) -> @UnsafeVariance T): @UnsafeVariance T = when (this) {
        is Success -> data
        is Failure -> fallback(error)
    }

    /**
     * Execute a side effect on success.
     */
    inline fun onSuccess(action: (T) -> Unit): Result<T> {
        if (this is Success) action(data)
        return this
    }

    /**
     * Execute a side effect on failure.
     */
    inline fun onFailure(action: (HttpError) -> Unit): Result<T> {
        if (this is Failure) action(error)
        return this
    }
}
