package com.tradingtool.core.http

import java.net.URI

/**
 * Suspend-based HTTP client interface.
 * Executes requests on Dispatchers.IO with configurable retry logic.
 * This is different from java.net.http.HttpClient (which is blocking).
 */
interface SuspendHttpClient {
    /**
     * Execute a GET request.
     */
    suspend fun get(
        url: String,
        headers: Map<String, String> = emptyMap(),
    ): Result<String>

    /**
     * Execute a POST request with a string body.
     */
    suspend fun post(
        url: String,
        body: String? = null,
        headers: Map<String, String> = emptyMap(),
    ): Result<String>

    /**
     * Execute a PUT request with a string body.
     */
    suspend fun put(
        url: String,
        body: String? = null,
        headers: Map<String, String> = emptyMap(),
    ): Result<String>

    /**
     * Execute a DELETE request.
     */
    suspend fun delete(
        url: String,
        headers: Map<String, String> = emptyMap(),
    ): Result<String>

    /**
     * Execute a PATCH request with a string body.
     */
    suspend fun patch(
        url: String,
        body: String? = null,
        headers: Map<String, String> = emptyMap(),
    ): Result<String>
}
