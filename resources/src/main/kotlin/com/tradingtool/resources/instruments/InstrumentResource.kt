package com.tradingtool.resources.instruments

import com.google.inject.Inject
import com.tradingtool.core.kite.InstrumentCache
import com.tradingtool.core.model.watchlist.InstrumentSearchResult
import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
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

@Path("/api/instruments")
@Produces(MediaType.APPLICATION_JSON)
class InstrumentResource @Inject constructor(
    private val instrumentCache: InstrumentCache,
) {
    private val ioScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    /**
     * Search Kite instrument cache by trading symbol or company name.
     * Returns up to 20 matches. Cache must be populated (login required first).
     */
    @GET
    @Path("/search")
    fun search(
        @QueryParam("q") query: String?,
        @QueryParam("exchange") exchange: String?,
    ): CompletableFuture<Response> = ioScope.async {
        val q = query?.trim().orEmpty()
        if (q.length < 2) {
            return@async Response.status(400)
                .entity(mapOf("detail" to "Query must be at least 2 characters"))
                .build()
        }

        if (instrumentCache.isEmpty()) {
            return@async Response.status(503)
                .entity(mapOf("detail" to "Instrument cache is empty — Kite login required"))
                .build()
        }

        val lowerQ = q.lowercase()
        val exchangeFilter = exchange?.trim()?.uppercase()

        val results = instrumentCache.all()
            .asSequence()
            .filter { inst ->
                val matchesExchange = exchangeFilter == null || inst.exchange == exchangeFilter
                val matchesQuery = inst.tradingsymbol.lowercase().contains(lowerQ) ||
                    inst.name.lowercase().contains(lowerQ)
                matchesExchange && matchesQuery
            }
            .take(20)
            .map { inst ->
                InstrumentSearchResult(
                    instrumentToken = inst.instrument_token,
                    tradingSymbol = inst.tradingsymbol,
                    companyName = inst.name,
                    exchange = inst.exchange,
                    instrumentType = inst.instrument_type,
                )
            }
            .toList()

        Response.ok(results).build()
    }.asCompletableFuture()
}
