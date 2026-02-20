package com.tradingtool.config

import com.fasterxml.jackson.annotation.JsonProperty
import io.dropwizard.core.Configuration
import jakarta.validation.Valid
import jakarta.validation.constraints.NotNull

class DropwizardConfig : Configuration() {
    @JsonProperty("service")
    @Valid
    @NotNull
    lateinit var service: ServiceConfig

    @JsonProperty("telegram")
    @Valid
    @NotNull
    lateinit var telegram: TelegramConfig

    @JsonProperty("supabase")
    @Valid
    @NotNull
    lateinit var supabase: SupabaseConfig

    @JsonProperty("deployment")
    @Valid
    @NotNull
    lateinit var deployment: DeploymentConfig

    fun toAppConfig(): AppConfig {
        return AppConfig(
            server = ServerConfig(
                host = "0.0.0.0",
                port = 8080,
            ),
            service = service,
            cors = CorsConfig(
                allowedOrigins = listOf(
                    "https://kushb2.github.io",
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                ),
            ),
            telegram = telegram,
            supabase = supabase,
            deployment = deployment,
        )
    }
}
