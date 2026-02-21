package com.tradingtool.resources.kite

import com.google.inject.Inject
import com.tradingtool.core.database.KiteTokenJdbiHandler
import com.tradingtool.core.kite.InstrumentCache
import com.tradingtool.core.kite.KiteConnectClient
import com.tradingtool.core.model.telegram.TelegramSendTextRequest
import com.tradingtool.core.telegram.TelegramSender
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

@Path("/kite")
@Produces(MediaType.APPLICATION_JSON)
class KiteResource @Inject constructor(
    private val kiteClient: KiteConnectClient,
    private val tokenDb: KiteTokenJdbiHandler,
    private val telegramSender: TelegramSender,
    private val instrumentCache: InstrumentCache,
) {
    private val ioScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    /**
     * Returns the Kite login URL.
     * Open this URL in a browser to start the OAuth flow.
     * Telegram cron sends this link daily after 6 AM IST token expiry.
     */
    @GET
    @Path("/login")
    fun getLoginUrl(): CompletableFuture<Response> = ioScope.async {
        Response.ok(mapOf("loginUrl" to kiteClient.loginUrl())).build()
    }.asCompletableFuture()

    /**
     * Zerodha redirects here after the user logs in on their site.
     * Exchanges the one-time request_token for an access_token,
     * persists it to Supabase, and notifies via Telegram.
     *
     * Redirect URL registered in Kite developer portal:
     *   https://tradingtool-3-service.onrender.com/kite/callback
     */
    @GET
    @Path("/callback")
    fun handleCallback(
        @QueryParam("request_token") requestToken: String?,
    ): CompletableFuture<Response> = ioScope.async {
        if (requestToken.isNullOrBlank()) {
            return@async Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "Missing request_token parameter"))
                .build()
        }

        try {
            val user = kiteClient.generateSession(requestToken)
            tokenDb.write { dao -> dao.saveToken(user.accessToken) }
            telegramSender.sendText(
                TelegramSendTextRequest("Kite login successful. Token refreshed for user: ${user.userId}")
            )
            // Refresh instrument cache on background thread — non-blocking
            Thread {
                try {
                    val instruments = kiteClient.client().getInstruments("NSE")
                    instrumentCache.refresh(instruments)
                    println("[InstrumentCache] Refreshed ${instrumentCache.size()} NSE instruments after login")
                } catch (e: Exception) {
                    println("[InstrumentCache] Cache refresh after login failed: ${e.message}")
                }
            }.also { it.isDaemon = true }.start()
            Response.ok(mapOf("status" to "authenticated", "userId" to user.userId)).build()
        } catch (e: Exception) {
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf("error" to (e.message ?: "Token exchange failed")))
                .build()
        }
    }.asCompletableFuture()
}
