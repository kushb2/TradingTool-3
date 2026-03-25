package com.tradingtool.resources.common

import jakarta.ws.rs.core.Response
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.async
import kotlinx.coroutines.future.asCompletableFuture
import java.util.concurrent.CompletableFuture

/**
 * Wraps a suspend block as a JAX-RS async response.
 *
 * - Runs the block on the receiver [CoroutineScope] (expected to be Dispatchers.IO).
 * - Catches any unhandled exception and returns a 500 so the caller never needs try/catch.
 * - Use `return@endpoint` for early returns (404, 400, etc.) from within the block.
 *
 * Usage:
 *   fun listAll(): CompletableFuture<Response> = ioScope.endpoint {
 *       ok(service.getAll())
 *   }
 */
fun CoroutineScope.endpoint(block: suspend () -> Response): CompletableFuture<Response> =
    async {
        runCatching { block() }
            .getOrElse { e -> internalError(e.message ?: "Unexpected error") }
    }.asCompletableFuture()
