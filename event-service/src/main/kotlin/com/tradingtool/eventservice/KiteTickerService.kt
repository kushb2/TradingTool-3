package com.tradingtool.eventservice

import com.tradingtool.core.kite.KiteConnectClient
import com.tradingtool.core.kite.TickSnapshot
import com.tradingtool.core.kite.TickStore
import com.zerodhatech.ticker.KiteTicker
import com.zerodhatech.ticker.OnError
import org.slf4j.LoggerFactory

/**
 * Connects to Kite's WebSocket ticker and streams live ticks into [TickStore].
 *
 * Lifecycle:
 * - [start] is called by Application.kt after Kite auth succeeds.
 * - [stop] is called on service shutdown.
 * - [restart] is called by Application.kt when the access token is refreshed.
 *
 * KiteTicker handles reconnection internally when [setTryReconnection] is true.
 */
class KiteTickerService(
    private val kiteClient: KiteConnectClient,
    private val tickStore: TickStore,
) {
    private val log = LoggerFactory.getLogger(KiteTickerService::class.java)

    @Volatile
    private var ticker: KiteTicker? = null

    @Volatile
    private var subscribedTokens: List<Long> = emptyList()

    fun start(tokens: List<Long>) {
        if (tokens.isEmpty()) {
            log.warn("KiteTickerService.start() called with empty token list — skipping")
            return
        }
        subscribedTokens = tokens
        connect(kiteClient.accessToken, kiteClient.apiKey, tokens)
    }

    fun stop() {
        ticker?.disconnect()
        ticker = null
        log.info("KiteTickerService stopped")
    }

    /** Called when the daily access token is refreshed by the cron-job. */
    fun restart(newAccessToken: String) {
        log.info("KiteTickerService restarting with new access token")
        stop()
        connect(newAccessToken, kiteClient.apiKey, subscribedTokens)
    }

    private fun connect(accessToken: String, apiKey: String, tokens: List<Long>) {
        val t = KiteTicker(accessToken, apiKey)

        t.setTryReconnection(true)
        t.setMaximumRetries(10)
        t.setMaximumRetryInterval(30)

        t.setOnConnectedListener {
            val tokenList = ArrayList(tokens)
            t.subscribe(tokenList)
            t.setMode(tokenList, KiteTicker.modeQuote)  // LTP + volume + OHLC (44 bytes)
            log.info("KiteTicker connected — subscribed to ${tokens.size} instruments")
        }

        t.setOnTickerArrivalListener { ticks ->
            ticks.forEach { tick ->
                tickStore.put(
                    TickSnapshot(
                        instrumentToken = tick.instrumentToken,
                        ltp             = tick.lastTradedPrice,
                        volume          = tick.volume,
                        changePercent   = tick.change,
                        open            = tick.ohlc?.open  ?: 0.0,
                        high            = tick.ohlc?.high  ?: 0.0,
                        low             = tick.ohlc?.low   ?: 0.0,
                        close           = tick.ohlc?.close ?: 0.0,
                    )
                )
            }
        }

        t.setOnDisconnectedListener {
            log.warn("KiteTicker disconnected — reconnection in progress (tryReconnection=true)")
        }

        t.setOnErrorListener(object : OnError {
            override fun onError(ex: Exception) { log.error("KiteTicker error", ex) }
            override fun onError(error: String)  { log.error("KiteTicker error: $error") }
        })

        t.connect()
        ticker = t
    }
}
