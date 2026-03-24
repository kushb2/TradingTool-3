package com.tradingtool.core.kite

import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList

/**
 * In-memory store for the latest tick snapshot per instrument.
 *
 * KiteTickerService writes ticks here on every WebSocket message.
 * LiveStreamResource registers listeners here to push ticks to SSE clients.
 *
 * Thread-safety: ConcurrentHashMap for the store, CopyOnWriteArrayList for
 * listeners so we can iterate safely while KiteTickerService's thread is calling put().
 */
class TickStore {

    private val store = ConcurrentHashMap<Long, TickSnapshot>()
    private val listeners = CopyOnWriteArrayList<(TickSnapshot) -> Unit>()

    /** Called by KiteTickerService on each incoming tick. */
    fun put(tick: TickSnapshot) {
        store[tick.instrumentToken] = tick
        listeners.forEach { listener ->
            try {
                listener(tick)
            } catch (_: Exception) {
                // Listener failed (e.g. SSE client disconnected) — ignore silently.
                // Stale listeners are cleaned up by LiveStreamResource on close.
            }
        }
    }

    fun getAll(): List<TickSnapshot> = store.values.toList()

    fun get(instrumentToken: Long): TickSnapshot? = store[instrumentToken]

    fun addListener(listener: (TickSnapshot) -> Unit) {
        listeners.add(listener)
    }

    fun removeListener(listener: (TickSnapshot) -> Unit) {
        listeners.remove(listener)
    }
}
