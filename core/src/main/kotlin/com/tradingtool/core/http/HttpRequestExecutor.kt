package com.tradingtool.core.http

import jakarta.inject.Inject
import jakarta.inject.Singleton
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import kotlinx.coroutines.future.await

interface HttpRequestExecutor {
    suspend fun execute(request: HttpRequestData): HttpResponseData
}

@Singleton
class JdkHttpRequestExecutor @Inject constructor(
    private val httpClient: HttpClient,
) : HttpRequestExecutor {
    override suspend fun execute(request: HttpRequestData): HttpResponseData {
        val builder = HttpRequest.newBuilder()
            .uri(request.uri)

        request.timeout?.let { timeout ->
            builder.timeout(timeout)
        }

        request.headers.forEach { (key, value) ->
            builder.header(key, value)
        }

        val bodyPublisher = request.body?.let { body ->
            HttpRequest.BodyPublishers.ofByteArray(body)
        } ?: HttpRequest.BodyPublishers.noBody()

        val httpRequest = builder
            .method(request.method, bodyPublisher)
            .build()

        val response = httpClient
            .sendAsync(httpRequest, HttpResponse.BodyHandlers.ofString())
            .await()

        return HttpResponseData(
            statusCode = response.statusCode(),
            body = response.body().orEmpty(),
        )
    }
}
