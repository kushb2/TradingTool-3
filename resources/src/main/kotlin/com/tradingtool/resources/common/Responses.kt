package com.tradingtool.resources.common

import jakarta.ws.rs.core.Response

fun ok(entity: Any): Response = Response.ok(entity).build()
fun created(entity: Any): Response = Response.status(201).entity(entity).build()
fun accepted(entity: Any): Response = Response.accepted(entity).build()
fun badRequest(detail: String): Response = Response.status(400).entity(error(detail)).build()
fun notFound(detail: String): Response = Response.status(404).entity(error(detail)).build()
fun conflict(detail: String): Response = Response.status(409).entity(error(detail)).build()
fun serviceUnavailable(detail: String): Response = Response.status(503).entity(error(detail)).build()
fun internalError(detail: String): Response = Response.status(500).entity(error(detail)).build()

private fun error(detail: String) = mapOf("detail" to detail)
