package com.tradingtool.di

import com.google.inject.AbstractModule
import com.google.inject.Provides
import com.google.inject.Singleton
import com.tradingtool.config.AppConfig
import com.tradingtool.core.database.DatabaseConfig
import com.tradingtool.core.database.JdbiHandler
import com.tradingtool.core.database.WatchlistJdbiHandler
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

class ServiceModule(
    private val appConfig: AppConfig,
) : AbstractModule() {
    override fun configure() {
        bind(AppConfig::class.java).toInstance(appConfig)
        bind(TelegramResource::class.java).`in`(Singleton::class.java)
        bind(WatchlistResource::class.java).`in`(Singleton::class.java)
        bind(WatchlistReadService::class.java).`in`(Singleton::class.java)
        bind(WatchlistWriteService::class.java).`in`(Singleton::class.java)
    }

    @Provides
    @Singleton
    fun provideTelegramSender(config: AppConfig): TelegramSender {
        return TelegramSender(
            botToken = config.telegram.botToken,
            chatId = config.telegram.chatId,
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
