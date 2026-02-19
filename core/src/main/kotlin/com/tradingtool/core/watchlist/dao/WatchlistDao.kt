package com.tradingtool.core.watchlist.dao

import com.tradingtool.core.model.watchlist.CreateStockInput
import com.tradingtool.core.model.watchlist.CreateWatchlistInput
import com.tradingtool.core.model.watchlist.CreateWatchlistStockInput
import com.tradingtool.core.model.watchlist.StockRecord
import com.tradingtool.core.model.watchlist.TableAccessStatus
import com.tradingtool.core.model.watchlist.UpdateStockInput
import com.tradingtool.core.model.watchlist.UpdateWatchlistInput
import com.tradingtool.core.model.watchlist.UpdateWatchlistStockInput
import com.tradingtool.core.model.watchlist.WatchlistRecord
import com.tradingtool.core.model.watchlist.WatchlistStockRecord

open class WatchlistDaoError(
    message: String,
    cause: Throwable? = null,
) : RuntimeException(message, cause)

class WatchlistDaoNotConfiguredError(
    message: String,
) : WatchlistDaoError(message)

interface WatchlistDao {
    fun checkTablesAccess(
        tableNames: List<String> = listOf("stocks", "watchlists", "watchlist_stocks"),
    ): List<TableAccessStatus>

    fun createStock(inputData: CreateStockInput): StockRecord
    fun getStockById(stockId: Long): StockRecord?
    fun getStockByNseSymbol(nseSymbol: String): StockRecord?
    fun listStocks(limit: Int = 200): List<StockRecord>
    fun updateStock(stockId: Long, inputData: UpdateStockInput): StockRecord?
    fun deleteStock(stockId: Long): Boolean

    fun createWatchlist(inputData: CreateWatchlistInput): WatchlistRecord
    fun getWatchlistById(watchlistId: Long): WatchlistRecord?
    fun getWatchlistByName(name: String): WatchlistRecord?
    fun listWatchlists(limit: Int = 200): List<WatchlistRecord>
    fun updateWatchlist(watchlistId: Long, inputData: UpdateWatchlistInput): WatchlistRecord?
    fun deleteWatchlist(watchlistId: Long): Boolean

    fun createWatchlistStock(inputData: CreateWatchlistStockInput): WatchlistStockRecord
    fun getWatchlistStock(watchlistId: Long, stockId: Long): WatchlistStockRecord?
    fun listStocksForWatchlist(watchlistId: Long): List<WatchlistStockRecord>
    fun updateWatchlistStock(
        watchlistId: Long,
        stockId: Long,
        inputData: UpdateWatchlistStockInput,
    ): WatchlistStockRecord?

    fun deleteWatchlistStock(watchlistId: Long, stockId: Long): Boolean
}
