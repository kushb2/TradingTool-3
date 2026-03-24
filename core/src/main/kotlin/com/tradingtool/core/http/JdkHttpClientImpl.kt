package com.tradingtool.core.http

import com.google.inject.Inject
import com.google.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.future.await
import kotlinx.coroutines.withContext
import java.io.IOException
import java.net.URI
import java.net.http.HttpClient as JdkHttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.net.http.HttpTimeoutException

/**
 * JDK HTTP client implementation with Dispatcher.IO, retry logic, and structured error handling.
 */
@Singleton
class JdkHttpClientImpl @Inject constructor(
    private val httpClient: JdkHttpClient,
    private val config: HttpClientConfig = HttpClientConfig(),
) : SuspendHttpClient {

    override suspend fun get(url: String, headers: Map<String, String>): Result<String> =
        request(method = "GET", url = url, body = null, headers = headers)

    override suspend fun post(url: String, body: String?, headers: Map<String, String>): Result<String> =
        request(method = "POST", url = url, body = body, headers = headers)

    override suspend fun put(url: String, body: String?, headers: Map<String, String>): Result<String> =
        request(method = "PUT", url = url, body = body, headers = headers)

    override suspend fun delete(url: String, headers: Map<String, String>): Result<String> =
        request(method = "DELETE", url = url, body = null, headers = headers)

    override suspend fun patch(url: String, body: String?, headers: Map<String, String>): Result<String> =
        request(method = "PATCH", url = url, body = body, headers = headers)

    private suspend fun request(
        method: String,
        url: String,
        body: String?,
        headers: Map<String, String>,
    ): Result<String> = withContext(Dispatchers.IO) {
        val retryConfig = config.retryConfig
        val maxAttempts = retryConfig?.maxAttempts ?: 1

        var lastError: HttpError? = null

        repeat(maxAttempts) { attempt ->
            try {
                val response = executeOnce(method, url, body, headers)

                // Check for HTTP error status
                return@withContext if (response.statusCode in 400..599) {
                    Result.Failure(
                        HttpError.HttpStatusError(
                            statusCode = response.statusCode,
                            body = response.body,
                        )
                    )
                } else {
                    Result.Success(response.body)
                }
            } catch (e: Exception) {
                lastError = mapException(e)

                val shouldRetry = isRetryableException(e) && attempt < maxAttempts - 1
                if (shouldRetry && retryConfig != null) {
                    val delayMs = retryConfig.calculateDelay(attempt)
                    delay(delayMs)
                } else {
                    return@withContext Result.Failure(lastError!!)
                }
            }
        }

        // All retries exhausted
        Result.Failure(lastError ?: HttpError.UnknownError(Exception("Request failed after $maxAttempts attempts")))
    }

    private suspend fun executeOnce(
        method: String,
        url: String,
        body: String?,
        headers: Map<String, String>,
    ): HttpResponseData {
        val httpRequest = buildHttpRequest(method, url, body, headers)

        val response = httpClient
            .sendAsync(httpRequest, HttpResponse.BodyHandlers.ofString())
            .await()

        return HttpResponseData(
            statusCode = response.statusCode(),
            body = response.body().orEmpty(),
        )
    }

    private fun buildHttpRequest(
        method: String,
        url: String,
        body: String?,
        headers: Map<String, String>,
    ): HttpRequest {
        val builder = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(config.timeout)

        // Merge default headers with request-specific headers
        (config.defaultHeaders + headers).forEach { (key, value) ->
            builder.header(key, value)
        }

        val bodyPublisher = body?.let {
            HttpRequest.BodyPublishers.ofString(it)
        } ?: HttpRequest.BodyPublishers.noBody()

        return builder
            .method(method, bodyPublisher)
            .build()
    }

    private fun isRetryableException(e: Exception): Boolean {
        return when (e) {
            is HttpTimeoutException -> true
            is IOException -> {
                val message = e.message?.lowercase() ?: ""
                message.contains("timeout") ||
                    message.contains("connection reset") ||
                    message.contains("broken pipe") ||
                    message.contains("connection refused")
            }
            else -> false
        }
    }

    private fun mapException(e: Exception): HttpError = when (e) {
        is HttpTimeoutException -> HttpError.NetworkError(e, "Request timeout")
        is IOException -> HttpError.NetworkError(e)
        else -> HttpError.UnknownError(e)
    }
}
