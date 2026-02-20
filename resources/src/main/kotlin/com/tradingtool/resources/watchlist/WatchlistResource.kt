package com.tradingtool.resources.watchlist

import com.tradingtool.core.model.JdbiHandlerError
import com.tradingtool.core.model.JdbiNotConfiguredError
import com.tradingtool.core.model.watchlist.CreateStockInput
import com.tradingtool.core.model.watchlist.CreateTagInput
import com.tradingtool.core.model.watchlist.CreateWatchlistInput
import com.tradingtool.core.model.watchlist.CreateWatchlistStockInput
import com.tradingtool.core.model.watchlist.StockUpdateField
import com.tradingtool.core.model.watchlist.UpdateStockInput
import com.tradingtool.core.model.watchlist.UpdateStockPayload
import com.tradingtool.core.model.watchlist.UpdateWatchlistInput
import com.tradingtool.core.model.watchlist.UpdateWatchlistPayload
import com.tradingtool.core.model.watchlist.WatchlistUpdateField
import com.tradingtool.core.watchlist.service.WatchlistReadService
import com.tradingtool.core.watchlist.service.WatchlistWriteService
import com.google.inject.Inject
import jakarta.ws.rs.Consumes
import jakarta.ws.rs.DELETE
import jakarta.ws.rs.GET
import jakarta.ws.rs.PATCH
import jakarta.ws.rs.POST
import jakarta.ws.rs.Path
import jakarta.ws.rs.PathParam
import jakarta.ws.rs.Produces
import jakarta.ws.rs.QueryParam
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.future.asCompletableFuture
import java.util.concurrent.CompletableFuture

@Path("/api/watchlist")
class WatchlistResource @Inject constructor(
    private val readService: WatchlistReadService,
    private val writeService: WatchlistWriteService,
) {
    private val ioScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    @GET
    @Path("tables")
    @Produces(MediaType.APPLICATION_JSON)
    fun getTables(): CompletableFuture<Response> = ioScope.async {
        runResourceAction {
            ok(readService.checkTablesAccess())
        }
    }.asCompletableFuture()

    @POST
    @Path("stocks")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    fun createStock(body: CreateStockInput?): CompletableFuture<Response> = ioScope.async {
        val payload: CreateStockInput = body
            ?: return@async badRequest("Invalid request body for create stock")
        val priority: Int? = payload.priority
        if (priority != null && priority <= 0) {
            return@async badRequest("Field 'priority' must be a positive integer")
        }

        runResourceAction {
            created(writeService.createStock(payload))
        }
    }.asCompletableFuture()

    @GET
    @Path("stocks")
    @Produces(MediaType.APPLICATION_JSON)
    fun listStocks(@QueryParam("limit") limitParam: String?): CompletableFuture<Response> = ioScope.async {
        val limit: Int = parseLimit(limitParam)
            ?: return@async badRequest("Query parameter 'limit' must be a positive integer")

        runResourceAction {
            ok(readService.listStocks(limit))
        }
    }.asCompletableFuture()

    @GET
    @Path("stocks/{stockId}")
    @Produces(MediaType.APPLICATION_JSON)
    fun getStockById(@PathParam("stockId") stockId: String): CompletableFuture<Response> = ioScope.async {
        val id: Long = parseLongPathParam(stockId)
            ?: return@async badRequest("Path parameter 'stockId' must be a valid integer")

        runResourceAction {
            val stock = readService.getStockById(id)
            if (stock == null) {
                notFound("Stock '$id' not found")
            } else {
                ok(stock)
            }
        }
    }.asCompletableFuture()

    @GET
    @Path("stocks/by-symbol/{nseSymbol}")
    @Produces(MediaType.APPLICATION_JSON)
    fun getStockBySymbol(@PathParam("nseSymbol") nseSymbol: String?): CompletableFuture<Response> = ioScope.async {
        val symbol: String = nseSymbol?.trim().orEmpty()
        if (symbol.isEmpty()) {
            return@async badRequest("Path parameter 'nseSymbol' is required")
        }

        runResourceAction {
            val stock = readService.getStockBySymbol(symbol = symbol, exchange = DEFAULT_STOCK_EXCHANGE)
            if (stock == null) {
                notFound("Stock '$symbol' not found")
            } else {
                ok(stock)
            }
        }
    }.asCompletableFuture()

    @PATCH
    @Path("stocks/{stockId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    fun updateStock(
        @PathParam("stockId") stockId: String,
        body: UpdateStockPayload?,
    ): CompletableFuture<Response> = ioScope.async {
        val id: Long = parseLongPathParam(stockId)
            ?: return@async badRequest("Path parameter 'stockId' must be a valid integer")
        val priority: Int? = body?.priority
        if (priority != null && priority <= 0) {
            return@async badRequest("Field 'priority' must be a positive integer")
        }

        val input: UpdateStockInput = toUpdateStockInput(body)
            ?: return@async badRequest("At least one updatable stock field is required")

        runResourceAction {
            val updated = writeService.updateStock(id, input)
            if (updated == null) {
                notFound("Stock '$id' not found")
            } else {
                ok(updated)
            }
        }
    }.asCompletableFuture()

    @DELETE
    @Path("stocks/{stockId}")
    @Produces(MediaType.APPLICATION_JSON)
    fun deleteStock(@PathParam("stockId") stockId: String): CompletableFuture<Response> = ioScope.async {
        val id: Long = parseLongPathParam(stockId)
            ?: return@async badRequest("Path parameter 'stockId' must be a valid integer")

        runResourceAction {
            val affectedRows = writeService.deleteStock(id)
            if (affectedRows > 0) {
                ok(DeleteResponse(deleted = true))
            } else {
                notFound("Stock '$id' not found")
            }
        }
    }.asCompletableFuture()

    @POST
    @Path("tags")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    fun createTag(body: CreateTagInput?): CompletableFuture<Response> = ioScope.async {
        val payload: CreateTagInput = body
            ?: return@async badRequest("Invalid request body for create tag")

        val tagName: String = payload.name.trim()
        if (tagName.isEmpty()) {
            return@async badRequest("Tag name is required")
        }

        runResourceAction {
            created(writeService.getOrCreateTag(tagName))
        }
    }.asCompletableFuture()

    @GET
    @Path("tags")
    @Produces(MediaType.APPLICATION_JSON)
    fun listTags(@QueryParam("limit") limitParam: String?): CompletableFuture<Response> = ioScope.async {
        val limit: Int = parseLimit(limitParam)
            ?: return@async badRequest("Query parameter 'limit' must be a positive integer")

        runResourceAction {
            ok(readService.listTags(limit))
        }
    }.asCompletableFuture()

    @POST
    @Path("lists")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    fun createWatchlist(body: CreateWatchlistInput?): CompletableFuture<Response> = ioScope.async {
        val payload: CreateWatchlistInput = body
            ?: return@async badRequest("Invalid request body for create watchlist")

        runResourceAction {
            created(writeService.createWatchlist(payload))
        }
    }.asCompletableFuture()

    @GET
    @Path("lists")
    @Produces(MediaType.APPLICATION_JSON)
    fun listWatchlists(@QueryParam("limit") limitParam: String?): CompletableFuture<Response> = ioScope.async {
        val limit: Int = parseLimit(limitParam)
            ?: return@async badRequest("Query parameter 'limit' must be a positive integer")

        runResourceAction {
            ok(readService.listWatchlists(limit))
        }
    }.asCompletableFuture()

    @GET
    @Path("lists/{watchlistId}")
    @Produces(MediaType.APPLICATION_JSON)
    fun getWatchlistById(@PathParam("watchlistId") watchlistId: String): CompletableFuture<Response> = ioScope.async {
        val id: Long = parseLongPathParam(watchlistId)
            ?: return@async badRequest("Path parameter 'watchlistId' must be a valid integer")

        runResourceAction {
            val watchlist = readService.getWatchlistById(id)
            if (watchlist == null) {
                notFound("Watchlist '$id' not found")
            } else {
                ok(watchlist)
            }
        }
    }.asCompletableFuture()

    @GET
    @Path("lists/by-name/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    fun getWatchlistByName(@PathParam("name") name: String?): CompletableFuture<Response> = ioScope.async {
        val watchlistName: String = name?.trim().orEmpty()
        if (watchlistName.isEmpty()) {
            return@async badRequest("Path parameter 'name' is required")
        }

        runResourceAction {
            val watchlist = readService.getWatchlistByName(watchlistName)
            if (watchlist == null) {
                notFound("Watchlist '$watchlistName' not found")
            } else {
                ok(watchlist)
            }
        }
    }.asCompletableFuture()

    @PATCH
    @Path("lists/{watchlistId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    fun updateWatchlist(
        @PathParam("watchlistId") watchlistId: String,
        body: UpdateWatchlistPayload?,
    ): CompletableFuture<Response> = ioScope.async {
        val id: Long = parseLongPathParam(watchlistId)
            ?: return@async badRequest("Path parameter 'watchlistId' must be a valid integer")

        val input: UpdateWatchlistInput = toUpdateWatchlistInput(body)
            ?: return@async badRequest("At least one updatable watchlist field is required")

        runResourceAction {
            val updated = writeService.updateWatchlist(id, input)
            if (updated == null) {
                notFound("Watchlist '$id' not found")
            } else {
                ok(updated)
            }
        }
    }.asCompletableFuture()

    @DELETE
    @Path("lists/{watchlistId}")
    @Produces(MediaType.APPLICATION_JSON)
    fun deleteWatchlist(@PathParam("watchlistId") watchlistId: String): CompletableFuture<Response> = ioScope.async {
        val id: Long = parseLongPathParam(watchlistId)
            ?: return@async badRequest("Path parameter 'watchlistId' must be a valid integer")

        runResourceAction {
            val affectedRows = writeService.deleteWatchlist(id)
            if (affectedRows > 0) {
                ok(DeleteResponse(deleted = true))
            } else {
                notFound("Watchlist '$id' not found")
            }
        }
    }.asCompletableFuture()

    @GET
    @Path("stocks/{stockId}/tags")
    @Produces(MediaType.APPLICATION_JSON)
    fun listTagsForStock(@PathParam("stockId") stockId: String): CompletableFuture<Response> = ioScope.async {
        val stockIdValue: Long = parseLongPathParam(stockId)
            ?: return@async badRequest("Path parameter 'stockId' must be a valid integer")

        runResourceAction {
            ok(readService.getTagsForStock(stockIdValue))
        }
    }.asCompletableFuture()

    @POST
    @Path("stocks/{stockId}/tags")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    fun addTagToStock(
        @PathParam("stockId") stockId: String,
        body: TagAssignmentRequest?,
    ): CompletableFuture<Response> = ioScope.async {
        val stockIdValue: Long = parseLongPathParam(stockId)
            ?: return@async badRequest("Path parameter 'stockId' must be a valid integer")

        val tagName: String = parseTagName(body?.tagName)
            ?: return@async badRequest("Field 'tagName' is required")

        runResourceAction {
            val stockExists = readService.getStockById(stockIdValue) != null
            if (!stockExists) {
                return@runResourceAction notFound("Stock '$stockIdValue' not found")
            }

            val tag = writeService.getOrCreateTag(tagName)
            writeService.getOrCreateStockTag(stockId = stockIdValue, tagId = tag.id)
            created(tag)
        }
    }.asCompletableFuture()

    @DELETE
    @Path("stocks/{stockId}/tags/{tagId}")
    @Produces(MediaType.APPLICATION_JSON)
    fun removeTagFromStock(
        @PathParam("stockId") stockId: String,
        @PathParam("tagId") tagId: String,
    ): CompletableFuture<Response> = ioScope.async {
        val stockIdValue: Long = parseLongPathParam(stockId)
            ?: return@async badRequest("Path parameter 'stockId' must be a valid integer")
        val tagIdValue: Long = parseLongPathParam(tagId)
            ?: return@async badRequest("Path parameter 'tagId' must be a valid integer")

        runResourceAction {
            val affectedRows = writeService.deleteStockTag(stockIdValue, tagIdValue)
            if (affectedRows > 0) {
                ok(DeleteResponse(deleted = true))
            } else {
                notFound("Tag mapping '$stockIdValue:$tagIdValue' not found")
            }
        }
    }.asCompletableFuture()

    @GET
    @Path("lists/{watchlistId}/tags")
    @Produces(MediaType.APPLICATION_JSON)
    fun listTagsForWatchlist(@PathParam("watchlistId") watchlistId: String): CompletableFuture<Response> = ioScope.async {
        val watchlistIdValue: Long = parseLongPathParam(watchlistId)
            ?: return@async badRequest("Path parameter 'watchlistId' must be a valid integer")

        runResourceAction {
            ok(readService.getTagsForWatchlist(watchlistIdValue))
        }
    }.asCompletableFuture()

    @POST
    @Path("lists/{watchlistId}/tags")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    fun addTagToWatchlist(
        @PathParam("watchlistId") watchlistId: String,
        body: TagAssignmentRequest?,
    ): CompletableFuture<Response> = ioScope.async {
        val watchlistIdValue: Long = parseLongPathParam(watchlistId)
            ?: return@async badRequest("Path parameter 'watchlistId' must be a valid integer")

        val tagName: String = parseTagName(body?.tagName)
            ?: return@async badRequest("Field 'tagName' is required")

        runResourceAction {
            val watchlistExists = readService.getWatchlistById(watchlistIdValue) != null
            if (!watchlistExists) {
                return@runResourceAction notFound("Watchlist '$watchlistIdValue' not found")
            }

            val tag = writeService.getOrCreateTag(tagName)
            writeService.getOrCreateWatchlistTag(watchlistId = watchlistIdValue, tagId = tag.id)
            created(tag)
        }
    }.asCompletableFuture()

    @DELETE
    @Path("lists/{watchlistId}/tags/{tagId}")
    @Produces(MediaType.APPLICATION_JSON)
    fun removeTagFromWatchlist(
        @PathParam("watchlistId") watchlistId: String,
        @PathParam("tagId") tagId: String,
    ): CompletableFuture<Response> = ioScope.async {
        val watchlistIdValue: Long = parseLongPathParam(watchlistId)
            ?: return@async badRequest("Path parameter 'watchlistId' must be a valid integer")
        val tagIdValue: Long = parseLongPathParam(tagId)
            ?: return@async badRequest("Path parameter 'tagId' must be a valid integer")

        runResourceAction {
            val affectedRows = writeService.deleteWatchlistTag(watchlistIdValue, tagIdValue)
            if (affectedRows > 0) {
                ok(DeleteResponse(deleted = true))
            } else {
                notFound("Tag mapping '$watchlistIdValue:$tagIdValue' not found")
            }
        }
    }.asCompletableFuture()

    @POST
    @Path("items")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    fun createWatchlistStock(body: CreateWatchlistStockInput?): CompletableFuture<Response> = ioScope.async {
        val payload: CreateWatchlistStockInput = body
            ?: return@async badRequest("Invalid request body for create watchlist stock mapping")

        runResourceAction {
            created(writeService.createWatchlistStock(payload))
        }
    }.asCompletableFuture()

    @GET
    @Path("items/{watchlistId}/{stockId}")
    @Produces(MediaType.APPLICATION_JSON)
    fun getWatchlistStock(
        @PathParam("watchlistId") watchlistId: String,
        @PathParam("stockId") stockId: String,
    ): CompletableFuture<Response> = ioScope.async {
        val watchlistIdValue: Long = parseLongPathParam(watchlistId)
            ?: return@async badRequest("Path parameter 'watchlistId' must be a valid integer")
        val stockIdValue: Long = parseLongPathParam(stockId)
            ?: return@async badRequest("Path parameter 'stockId' must be a valid integer")

        runResourceAction {
            val mapping = readService.getWatchlistStock(watchlistIdValue, stockIdValue)
            if (mapping == null) {
                notFound("Mapping '$watchlistIdValue:$stockIdValue' not found")
            } else {
                ok(mapping)
            }
        }
    }.asCompletableFuture()

    @GET
    @Path("lists/{watchlistId}/items")
    @Produces(MediaType.APPLICATION_JSON)
    fun listWatchlistItems(@PathParam("watchlistId") watchlistId: String): CompletableFuture<Response> = ioScope.async {
        val watchlistIdValue: Long = parseLongPathParam(watchlistId)
            ?: return@async badRequest("Path parameter 'watchlistId' must be a valid integer")

        runResourceAction {
            ok(readService.getWatchlistStocksForWatchlist(watchlistIdValue))
        }
    }.asCompletableFuture()

    @PATCH
    @Path("items/{watchlistId}/{stockId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    fun updateWatchlistStock(
        @PathParam("watchlistId") watchlistId: String,
        @PathParam("stockId") stockId: String,
    ): CompletableFuture<Response> = ioScope.async {
        val watchlistIdValue: Long? = parseLongPathParam(watchlistId)
        val stockIdValue: Long? = parseLongPathParam(stockId)
        if (watchlistIdValue == null || stockIdValue == null) {
            return@async badRequest("Path parameters 'watchlistId' and 'stockId' must be valid integers")
        }

        Response.status(501)
            .entity(
                ErrorResponse(
                    detail = "Watchlist item update is not supported. Delete and recreate the mapping instead.",
                ),
            )
            .build()
    }.asCompletableFuture()

    @DELETE
    @Path("items/{watchlistId}/{stockId}")
    @Produces(MediaType.APPLICATION_JSON)
    fun deleteWatchlistStock(
        @PathParam("watchlistId") watchlistId: String,
        @PathParam("stockId") stockId: String,
    ): CompletableFuture<Response> = ioScope.async {
        val watchlistIdValue: Long = parseLongPathParam(watchlistId)
            ?: return@async badRequest("Path parameter 'watchlistId' must be a valid integer")
        val stockIdValue: Long = parseLongPathParam(stockId)
            ?: return@async badRequest("Path parameter 'stockId' must be a valid integer")

        runResourceAction {
            val affectedRows = writeService.deleteWatchlistStock(watchlistIdValue, stockIdValue)
            if (affectedRows > 0) {
                ok(DeleteResponse(deleted = true))
            } else {
                notFound("Mapping '$watchlistIdValue:$stockIdValue' not found")
            }
        }
    }.asCompletableFuture()

    private suspend fun runResourceAction(operation: suspend () -> Response): Response {
        return try {
            operation()
        } catch (error: IllegalArgumentException) {
            badRequest(error.message ?: "Invalid request")
        } catch (error: JdbiNotConfiguredError) {
            serviceUnavailable(error.message)
        } catch (error: JdbiHandlerError) {
            internalError(error.message)
        } catch (error: Exception) {
            internalError(error.message ?: "Unexpected watchlist error")
        }
    }

    private fun toUpdateStockInput(payload: UpdateStockPayload?): UpdateStockInput? {
        if (payload == null) {
            return null
        }

        val fieldsToUpdate: MutableSet<StockUpdateField> = mutableSetOf()
        if (payload.companyName != null) {
            fieldsToUpdate.add(StockUpdateField.COMPANY_NAME)
        }
        if (payload.exchange != null) {
            fieldsToUpdate.add(StockUpdateField.EXCHANGE)
        }
        if (payload.description != null) {
            fieldsToUpdate.add(StockUpdateField.DESCRIPTION)
        }
        if (payload.priority != null) {
            fieldsToUpdate.add(StockUpdateField.PRIORITY)
        }

        if (fieldsToUpdate.isEmpty()) {
            return null
        }

        return UpdateStockInput(
            fieldsToUpdate = fieldsToUpdate,
            companyName = payload.companyName,
            exchange = payload.exchange,
            description = payload.description,
            priority = payload.priority,
        )
    }

    private fun parseTagName(tagName: String?): String? {
        val normalizedName = tagName?.trim().orEmpty()
        if (normalizedName.isEmpty()) {
            return null
        }
        return normalizedName
    }

    private fun toUpdateWatchlistInput(payload: UpdateWatchlistPayload?): UpdateWatchlistInput? {
        if (payload == null) {
            return null
        }

        val fieldsToUpdate: MutableSet<WatchlistUpdateField> = mutableSetOf()
        if (payload.name != null) {
            fieldsToUpdate.add(WatchlistUpdateField.NAME)
        }
        if (payload.description != null) {
            fieldsToUpdate.add(WatchlistUpdateField.DESCRIPTION)
        }

        if (fieldsToUpdate.isEmpty()) {
            return null
        }

        return UpdateWatchlistInput(
            fieldsToUpdate = fieldsToUpdate,
            name = payload.name,
            description = payload.description,
        )
    }

    private fun parseLongPathParam(value: String?): Long? {
        val rawValue = value?.trim().orEmpty()
        if (rawValue.isEmpty()) {
            return null
        }

        return rawValue.toLongOrNull()
    }

    private fun parseLimit(limitParam: String?): Int? {
        if (limitParam.isNullOrBlank()) {
            return DEFAULT_LIMIT
        }

        val parsedLimit = limitParam.trim().toIntOrNull() ?: return null
        if (parsedLimit <= 0) {
            return null
        }

        return parsedLimit
    }

    private fun <T : Any> ok(entity: T): Response {
        return Response.ok(entity).build()
    }

    private fun <T : Any> created(entity: T): Response {
        return Response.status(201).entity(entity).build()
    }

    private fun badRequest(detail: String): Response {
        return Response.status(400).entity(ErrorResponse(detail = detail)).build()
    }

    private fun notFound(detail: String): Response {
        return Response.status(404).entity(ErrorResponse(detail = detail)).build()
    }

    private fun serviceUnavailable(detail: String): Response {
        return Response.status(503).entity(ErrorResponse(detail = detail)).build()
    }

    private fun internalError(detail: String): Response {
        return Response.status(500).entity(ErrorResponse(detail = detail)).build()
    }

    private data class DeleteResponse(
        val deleted: Boolean,
    )

    private data class ErrorResponse(
        val detail: String,
    )

    data class TagAssignmentRequest(
        val tagName: String?,
    )

    private companion object {
        const val DEFAULT_LIMIT: Int = 200
        const val DEFAULT_STOCK_EXCHANGE: String = "NSE"
    }
}
