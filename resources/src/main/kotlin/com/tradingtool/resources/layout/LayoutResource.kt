package com.tradingtool.resources.layout

import com.google.inject.Inject
import com.tradingtool.core.model.watchlist.UpdateLayoutPayload
import com.tradingtool.core.watchlist.service.WatchlistReadService
import com.tradingtool.core.watchlist.service.WatchlistWriteService
import jakarta.ws.rs.Consumes
import jakarta.ws.rs.GET
import jakarta.ws.rs.PUT
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.future.asCompletableFuture
import java.util.concurrent.CompletableFuture

@Path("/api/layout")
class LayoutResource @Inject constructor(
    private val readService: WatchlistReadService,
    private val writeService: WatchlistWriteService,
) {
    private val ioScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    fun getLayout(): CompletableFuture<Response> = ioScope.async {
        val layout = readService.getLayout()
        if (layout == null) {
            Response.status(404).entity(mapOf("detail" to "Layout row not found — run tables.sql")).build()
        } else {
            Response.ok(layout).build()
        }
    }.asCompletableFuture()

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    fun updateLayout(body: UpdateLayoutPayload?): CompletableFuture<Response> = ioScope.async {
        val payload = body
            ?: return@async Response.status(400)
                .entity(mapOf("detail" to "Request body is required"))
                .build()

        if (payload.layoutData.isBlank()) {
            return@async Response.status(400)
                .entity(mapOf("detail" to "Field 'layout_data' must not be blank"))
                .build()
        }

        val updated = writeService.updateLayout(payload)
        if (updated == null) {
            Response.status(404)
                .entity(mapOf("detail" to "Layout row not found — run tables.sql"))
                .build()
        } else {
            Response.ok(updated).build()
        }
    }.asCompletableFuture()
}
