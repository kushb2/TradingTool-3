package com.tradingtool.resources.live

import com.fasterxml.jackson.databind.ObjectMapper
import com.google.inject.Inject
import com.tradingtool.core.kite.TickSnapshot
import com.tradingtool.core.kite.TickStore
import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.Context
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.sse.Sse
import jakarta.ws.rs.sse.SseEventSink
import java.util.concurrent.atomic.AtomicReference

/**
 * Streams live tick snapshots to the browser via Server-Sent Events.
 *
 * Flow:
 * 1. On connect: flush the current tick snapshot for all subscribed instruments.
 * 2. On each new tick: push a JSON event to the client immediately.
 * 3. On disconnect: the self-removing listener cleans itself from TickStore.
 *
 * The browser connects via:
 *   const es = new EventSource('/api/live/stream')
 *   es.onmessage = (e) => { const tick = JSON.parse(e.data) }
 */
@Path("/api/live")
class LiveStreamResource @Inject constructor(
    private val tickStore: TickStore,
) {
    private val objectMapper = ObjectMapper()

    @GET
    @Path("/stream")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    fun stream(@Context sink: SseEventSink, @Context sse: Sse) {
        // Flush current snapshot immediately so the browser gets populated values on connect,
        // not just on the next tick (which could be seconds away).
        tickStore.getAll().forEach { tick ->
            if (!sink.isClosed) sendTick(sink, sse, tick)
        }

        // Use AtomicReference so the lambda can reference itself for self-removal.
        val listenerRef = AtomicReference<((TickSnapshot) -> Unit)?>(null)
        val listener: (TickSnapshot) -> Unit = { tick ->
            if (sink.isClosed) {
                listenerRef.get()?.let { tickStore.removeListener(it) }
            } else {
                try {
                    sendTick(sink, sse, tick)
                } catch (_: Exception) {
                    // Client disconnected — clean up.
                    listenerRef.get()?.let { tickStore.removeListener(it) }
                }
            }
        }
        listenerRef.set(listener)
        tickStore.addListener(listener)
    }

    private fun sendTick(sink: SseEventSink, sse: Sse, tick: TickSnapshot) {
        sink.send(
            sse.newEventBuilder()
                .data(objectMapper.writeValueAsString(tick))
                .mediaType(MediaType.APPLICATION_JSON_TYPE)
                .build()
        )
    }
}
