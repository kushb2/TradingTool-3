package com.tradingtool

import com.fasterxml.jackson.databind.ObjectMapper
import com.google.inject.Guice
import com.tradingtool.config.AppConfig
import com.tradingtool.config.DropwizardConfig
import com.tradingtool.di.ServiceModule
import com.tradingtool.resources.health.HealthResource
import com.tradingtool.resources.telegram.TelegramResource
import com.tradingtool.resources.watchlist.WatchlistResource
import io.dropwizard.core.Application
import io.dropwizard.core.setup.Bootstrap
import io.dropwizard.core.setup.Environment
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature

fun main(args: Array<String>) {
    DropwizardApplication().run(*args)
}

class DropwizardApplication : Application<DropwizardConfig>() {

    override fun getName(): String = "TradingTool-3"

    override fun initialize(bootstrap: Bootstrap<DropwizardConfig>) {
        // No additional initialization needed
    }

    override fun run(config: DropwizardConfig, environment: Environment) {
        // Convert Dropwizard config to AppConfig
        val appConfig = config.toAppConfig()

        // Create Guice injector
        val injector = Guice.createInjector(ServiceModule(appConfig))

        // Register Jackson module for Kotlin
        val objectMapper: ObjectMapper = environment.objectMapper
        objectMapper.registerModule(com.fasterxml.jackson.module.kotlin.KotlinModule.Builder().build())

        // Get resource instances from Guice
        val healthResource = injector.getInstance(HealthResource::class.java)
        val telegramResource = injector.getInstance(TelegramResource::class.java)
        val watchlistResource = injector.getInstance(WatchlistResource::class.java)

        // Register resources with Jersey
        environment.jersey().register(healthResource)
        environment.jersey().register(telegramResource)
        environment.jersey().register(watchlistResource)

        // Enable RolesAllowed feature for security annotations
        environment.jersey().register(RolesAllowedDynamicFeature::class.java)
    }
}
