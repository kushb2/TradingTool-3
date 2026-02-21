package com.tradingtool.resources.notes

import com.google.inject.Inject
import com.tradingtool.core.model.watchlist.CreateStockNoteInput
import com.tradingtool.core.watchlist.service.WatchlistReadService
import com.tradingtool.core.watchlist.service.WatchlistWriteService
import jakarta.ws.rs.Consumes
import jakarta.ws.rs.DELETE
import jakarta.ws.rs.GET
import jakarta.ws.rs.POST
import jakarta.ws.rs.Path
import jakarta.ws.rs.PathParam
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.future.asCompletableFuture
import java.util.concurrent.CompletableFuture

@Path("/api/notes")
class StockNotesResource @Inject constructor(
    private val readService: WatchlistReadService,
    private val writeService: WatchlistWriteService,
) {
    private val ioScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    @GET
    @Path("/stock/{stockId}")
    @Produces(MediaType.APPLICATION_JSON)
    fun getNotesForStock(
        @PathParam("stockId") stockId: String,
    ): CompletableFuture<Response> = ioScope.async {
        val id = stockId.toLongOrNull()
            ?: return@async badRequest("Path parameter 'stockId' must be a valid integer")

        val notes = readService.getNotesForStock(id)
        Response.ok(notes).build()
    }.asCompletableFuture()

    @POST
    @Path("/stock/{stockId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    fun addNoteToStock(
        @PathParam("stockId") stockId: String,
        body: CreateStockNoteInput?,
    ): CompletableFuture<Response> = ioScope.async {
        val id = stockId.toLongOrNull()
            ?: return@async badRequest("Path parameter 'stockId' must be a valid integer")

        val content = body?.content?.trim().orEmpty()
        if (content.isEmpty()) {
            return@async badRequest("Field 'content' is required")
        }

        val stock = readService.getStockById(id)
            ?: return@async notFound("Stock '$id' not found")

        val note = writeService.createStockNote(stock.id, CreateStockNoteInput(content = content))
        Response.status(201).entity(note).build()
    }.asCompletableFuture()

    @DELETE
    @Path("/stock/{stockId}/{noteId}")
    @Produces(MediaType.APPLICATION_JSON)
    fun deleteNote(
        @PathParam("stockId") stockId: String,
        @PathParam("noteId") noteId: String,
    ): CompletableFuture<Response> = ioScope.async {
        val sid = stockId.toLongOrNull()
            ?: return@async badRequest("Path parameter 'stockId' must be a valid integer")
        val nid = noteId.toLongOrNull()
            ?: return@async badRequest("Path parameter 'noteId' must be a valid integer")

        val affected = writeService.deleteStockNote(stockId = sid, noteId = nid)
        if (affected > 0) {
            Response.ok(mapOf("deleted" to true)).build()
        } else {
            notFound("Note '$nid' not found for stock '$sid'")
        }
    }.asCompletableFuture()

    private fun badRequest(detail: String): Response =
        Response.status(400).entity(mapOf("detail" to detail)).build()

    private fun notFound(detail: String): Response =
        Response.status(404).entity(mapOf("detail" to detail)).build()
}
