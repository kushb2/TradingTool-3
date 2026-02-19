package com.tradingtool.config

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class AppConfigTest {
    @Test
    fun loads_defaults_from_server_config() {
        val config: AppConfig = loadAppConfig()

        assertEquals(expected = "0.0.0.0", actual = config.server.host)
        assertEquals(expected = 8080, actual = config.server.port)
        assertEquals(expected = "TradingTool-3", actual = config.service.name)
        assertTrue(actual = config.cors.allowedOrigins.isNotEmpty())
        assertEquals(expected = "https://kushb2.github.io/TradingTool-3/", actual = config.deployment.githubPagesUrl)
    }
}
