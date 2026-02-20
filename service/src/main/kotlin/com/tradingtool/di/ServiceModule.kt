package com.tradingtool.di

import com.google.inject.AbstractModule
import com.google.inject.Provides
import com.google.inject.Singleton
import com.tradingtool.config.AppConfig
import com.tradingtool.core.database.DatabaseConfig
import com.tradingtool.core.database.JdbiHandler
import com.tradingtool.core.database.WatchlistJdbiHandler
import com.tradingtool.core.http.HttpRequestExecutor
import com.tradingtool.core.http.JdkHttpRequestExecutor
import com.tradingtool.core.telegram.TelegramApiClient
import com.tradingtool.core.telegram.TelegramSender
import com.tradingtool.core.watchlist.dao.WatchlistDal
import com.tradingtool.core.watchlist.dao.WatchlistReadDao
import com.tradingtool.core.watchlist.dao.WatchlistDatabaseConfig
import com.tradingtool.core.watchlist.dao.WatchlistWriteDao
import com.tradingtool.core.watchlist.service.WatchlistReadService
import com.tradingtool.core.watchlist.service.WatchlistService
import com.tradingtool.core.watchlist.service.WatchlistWriteService
import com.tradingtool.telegram.TelegramResource
import com.tradingtool.watchlist.WatchlistResource
import java.net.http.HttpClient
import java.time.Duration
import kotlinx.serialization.json.Json

class ServiceModule(
    private val appConfig: AppConfig,
) : AbstractModule() {
    override fun configure() {
        bind(AppConfig::class.java).toInstance(appConfig)
        bind(HttpRequestExecutor::class.java).to(JdkHttpRequestExecutor::class.java).`in`(Singleton::class.java)
        bind(TelegramResource::class.java).`in`(Singleton::class.java)
        bind(WatchlistResource::class.java).`in`(Singleton::class.java)
        bind(WatchlistReadService::class.java).`in`(Singleton::class.java)
        bind(WatchlistWriteService::class.java).`in`(Singleton::class.java)
    }

    @Provides
    @Singleton
    fun provideHttpClient(): HttpClient {
        return HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(30))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build()
    }

    @Provides
    @Singleton
    fun provideJson(): Json {
        return Json { ignoreUnknownKeys = true }
    }

    @Provides
    @Singleton
    fun provideTelegramApiClient(
        config: AppConfig,
        httpRequestExecutor: HttpRequestExecutor,
        json: Json,
    ): TelegramApiClient {
        return TelegramApiClient(
            botToken = config.telegram.botToken,
            chatId = config.telegram.chatId,
            httpRequestExecutor = httpRequestExecutor,
            json = json,
        )
    }

    @Provides
    @Singleton
    fun provideTelegramSender(
        telegramApiClient: TelegramApiClient,
    ): TelegramSender {
        return TelegramSender(
            telegramApiClient = telegramApiClient,
        )
    }

    @Provides
    @Singleton
    fun provideDatabaseConfig(config: AppConfig): DatabaseConfig {
        return DatabaseConfig(
            jdbcUrl = config.supabase.dbUrl,
            user = config.supabase.dbUser,
            password = config.supabase.dbPassword,
        )
    }

    @Provides
    @Singleton
    fun provideWatchlistJdbiHandler(config: DatabaseConfig): WatchlistJdbiHandler {
        return JdbiHandler(
            config = config,
            readDaoClass = WatchlistReadDao::class.java,
            writeDaoClass = WatchlistWriteDao::class.java,
        )
    }

    @Provides
    @Singleton
    fun provideWatchlistDatabaseConfig(config: AppConfig): WatchlistDatabaseConfig {
        return WatchlistDatabaseConfig(
            jdbcUrl = config.supabase.dbUrl,
            user = config.supabase.dbUser,
            password = config.supabase.dbPassword,
        )
    }

    @Provides
    @Singleton
    fun provideWatchlistDal(config: WatchlistDatabaseConfig): WatchlistDal {
        return WatchlistDal(config = config)
    }

    @Provides
    @Singleton
    fun provideWatchlistService(dal: WatchlistDal): WatchlistService {
        return WatchlistService(dal = dal)
    }
}
