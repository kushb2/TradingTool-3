package com.tradingtool

import com.tradingtool.config.AppConfig
import com.tradingtool.config.loadAppConfig
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.http.ContentType
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing


fun main() {
    val appConfig: AppConfig = loadAppConfig()
    embeddedServer(
        factory = Netty,
        port = appConfig.server.port,
        host = appConfig.server.host,
        module = {
            module(appConfig)
        },
    ).start(wait = true)
}

fun Application.module(appConfig: AppConfig = loadAppConfig()) {
    install(ContentNegotiation) {
        json()
    }

    routing {
        get("/") {
            call.respond(mapOf("service" to appConfig.service.name, "status" to "ok"))
        }
        get("/health") {
            call.respond(mapOf("status" to "ok"))
        }
        get("/health/config") {
            call.respondText(
                text = """
                    {
                      "status":"ok",
                      "telegramBotTokenConfigured":${appConfig.telegram.botToken.isNotBlank()},
                      "telegramWebhookSecretConfigured":${appConfig.telegram.webhookSecret.isNotBlank()},
                      "supabaseUrlConfigured":${appConfig.supabase.url.isNotBlank()},
                      "supabaseKeyConfigured":${appConfig.supabase.key.isNotBlank()},
                      "renderExternalUrlConfigured":${appConfig.deployment.renderExternalUrl.isNotBlank()},
                      "githubPagesUrlConfigured":${appConfig.deployment.githubPagesUrl.isNotBlank()},
                      "corsOriginsCount":${appConfig.cors.allowedOrigins.size}
                    }
                """.trimIndent(),
                contentType = ContentType.Application.Json,
            )
        }
    }
}
