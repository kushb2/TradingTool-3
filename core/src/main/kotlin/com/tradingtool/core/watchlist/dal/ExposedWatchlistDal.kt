package com.tradingtool.core.watchlist.dal

import com.tradingtool.core.model.watchlist.CreateStockInput
import com.tradingtool.core.model.watchlist.CreateWatchlistInput
import com.tradingtool.core.model.watchlist.CreateWatchlistStockInput
import com.tradingtool.core.model.watchlist.StockRecord
import com.tradingtool.core.model.watchlist.StockUpdateField
import com.tradingtool.core.model.watchlist.TableAccessStatus
import com.tradingtool.core.model.watchlist.UpdateStockInput
import com.tradingtool.core.model.watchlist.UpdateWatchlistInput
import com.tradingtool.core.model.watchlist.UpdateWatchlistStockInput
import com.tradingtool.core.model.watchlist.WatchlistRecord
import com.tradingtool.core.model.watchlist.WatchlistStockRecord
import com.tradingtool.core.model.watchlist.WatchlistStockUpdateField
import com.tradingtool.core.model.watchlist.WatchlistUpdateField
import com.tradingtool.core.watchlist.dao.WatchlistDao
import com.tradingtool.core.watchlist.dao.WatchlistDaoError
import com.tradingtool.core.watchlist.dao.WatchlistDaoNotConfiguredError
import com.tradingtool.core.watchlist.schema.StocksTable
import com.tradingtool.core.watchlist.schema.WatchlistsTable
import com.tradingtool.core.watchlist.schema.WatchlistStocksTable
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.sql.ResultSet
import java.time.OffsetDateTime

data class WatchlistDatabaseConfig(
    val jdbcUrl: String,
    val user: String,
    val password: String,
)

class ExposedWatchlistDal(
    config: WatchlistDatabaseConfig,
) : WatchlistDao {
    private val database: Database? = createDatabase(config)

    override fun checkTablesAccess(tableNames: List<String>): List<TableAccessStatus> {
        return tableNames.map { tableName ->
            try {
                val rowCount: Int = runDb(
                    action = "check table access for '$tableName'",
                ) {
                    val quotedTable: String = "\"" + tableName.replace("\"", "\"\"") + "\""
                    exec("SELECT * FROM $quotedTable LIMIT 1") { resultSet ->
                        countRows(resultSet)
                    } ?: 0
                }
                TableAccessStatus(
                    tableName = tableName,
                    accessible = true,
                    sampleRowCount = rowCount,
                )
            } catch (error: WatchlistDaoError) {
                TableAccessStatus(
                    tableName = tableName,
                    accessible = false,
                    error = error.message,
                )
            }
        }
    }

    override fun createStock(inputData: CreateStockInput): StockRecord {
        val insertedId: Long = runDb(action = "create stock") {
            StocksTable.insertAndGetId { row ->
                row[nseSymbol] = inputData.nseSymbol
                row[companyName] = inputData.companyName
                row[growwSymbol] = inputData.growwSymbol
                row[kiteSymbol] = inputData.kiteSymbol
                row[description] = inputData.description
                row[rating] = inputData.rating?.toShort()
                row[tags] = inputData.tags
            }.value
        }

        return getStockById(insertedId)
            ?: throw WatchlistDaoError("No row returned while 'create stock'")
    }

    override fun getStockById(stockId: Long): StockRecord? {
        return runDb(action = "get stock by id '$stockId'") {
            StocksTable
                .selectAll()
                .where { StocksTable.id eq stockId }
                .limit(1)
                .singleOrNull()
                ?.toStockRecord()
        }
    }

    override fun getStockByNseSymbol(nseSymbol: String): StockRecord? {
        return runDb(action = "get stock by symbol '$nseSymbol'") {
            StocksTable
                .selectAll()
                .where { StocksTable.nseSymbol eq nseSymbol }
                .limit(1)
                .singleOrNull()
                ?.toStockRecord()
        }
    }

    override fun listStocks(limit: Int): List<StockRecord> {
        return runDb(action = "list stocks") {
            StocksTable
                .selectAll()
                .orderBy(StocksTable.id to SortOrder.ASC)
                .limit(limit)
                .map { row -> row.toStockRecord() }
        }
    }

    override fun updateStock(stockId: Long, inputData: UpdateStockInput): StockRecord? {
        if (inputData.fieldsToUpdate.isEmpty()) {
            throw WatchlistDaoError("update stock called with no fields to update")
        }

        val updatedRows: Int = runDb(action = "update stock '$stockId'") {
            StocksTable.update(where = { StocksTable.id eq stockId }) { row ->
                if (StockUpdateField.COMPANY_NAME in inputData.fieldsToUpdate) {
                    row[companyName] = inputData.companyName
                        ?: throw WatchlistDaoError("company_name cannot be null")
                }
                if (StockUpdateField.GROWW_SYMBOL in inputData.fieldsToUpdate) {
                    row[growwSymbol] = inputData.growwSymbol
                }
                if (StockUpdateField.KITE_SYMBOL in inputData.fieldsToUpdate) {
                    row[kiteSymbol] = inputData.kiteSymbol
                }
                if (StockUpdateField.DESCRIPTION in inputData.fieldsToUpdate) {
                    row[description] = inputData.description
                }
                if (StockUpdateField.RATING in inputData.fieldsToUpdate) {
                    row[rating] = inputData.rating?.toShort()
                }
                if (StockUpdateField.TAGS in inputData.fieldsToUpdate) {
                    row[tags] = inputData.tags ?: emptyList()
                }
            }
        }
        if (updatedRows == 0) {
            return null
        }

        return getStockById(stockId)
    }

    override fun deleteStock(stockId: Long): Boolean {
        val deletedRows: Int = runDb(action = "delete stock '$stockId'") {
            StocksTable.deleteWhere { StocksTable.id eq stockId }
        }
        return deletedRows > 0
    }

    override fun createWatchlist(inputData: CreateWatchlistInput): WatchlistRecord {
        val insertedId: Long = runDb(action = "create watchlist") {
            WatchlistsTable.insertAndGetId { row ->
                row[name] = inputData.name
                row[description] = inputData.description
            }.value
        }

        return getWatchlistById(insertedId)
            ?: throw WatchlistDaoError("No row returned while 'create watchlist'")
    }

    override fun getWatchlistById(watchlistId: Long): WatchlistRecord? {
        return runDb(action = "get watchlist by id '$watchlistId'") {
            WatchlistsTable
                .selectAll()
                .where { WatchlistsTable.id eq watchlistId }
                .limit(1)
                .singleOrNull()
                ?.toWatchlistRecord()
        }
    }

    override fun getWatchlistByName(name: String): WatchlistRecord? {
        return runDb(action = "get watchlist by name '$name'") {
            WatchlistsTable
                .selectAll()
                .where { WatchlistsTable.name eq name }
                .limit(1)
                .singleOrNull()
                ?.toWatchlistRecord()
        }
    }

    override fun listWatchlists(limit: Int): List<WatchlistRecord> {
        return runDb(action = "list watchlists") {
            WatchlistsTable
                .selectAll()
                .orderBy(WatchlistsTable.id to SortOrder.ASC)
                .limit(limit)
                .map { row -> row.toWatchlistRecord() }
        }
    }

    override fun updateWatchlist(
        watchlistId: Long,
        inputData: UpdateWatchlistInput,
    ): WatchlistRecord? {
        if (inputData.fieldsToUpdate.isEmpty()) {
            throw WatchlistDaoError("update watchlist called with no fields to update")
        }

        val updatedRows: Int = runDb(action = "update watchlist '$watchlistId'") {
            WatchlistsTable.update(where = { WatchlistsTable.id eq watchlistId }) { row ->
                if (WatchlistUpdateField.NAME in inputData.fieldsToUpdate) {
                    row[name] = inputData.name
                        ?: throw WatchlistDaoError("name cannot be null")
                }
                if (WatchlistUpdateField.DESCRIPTION in inputData.fieldsToUpdate) {
                    row[description] = inputData.description
                }
            }
        }
        if (updatedRows == 0) {
            return null
        }

        return getWatchlistById(watchlistId)
    }

    override fun deleteWatchlist(watchlistId: Long): Boolean {
        val deletedRows: Int = runDb(action = "delete watchlist '$watchlistId'") {
            WatchlistsTable.deleteWhere { WatchlistsTable.id eq watchlistId }
        }
        return deletedRows > 0
    }

    override fun createWatchlistStock(inputData: CreateWatchlistStockInput): WatchlistStockRecord {
        runDb(action = "create watchlist stock mapping") {
            WatchlistStocksTable.insert { row ->
                row[watchlistId] = EntityID(inputData.watchlistId, WatchlistsTable)
                row[stockId] = EntityID(inputData.stockId, StocksTable)
                row[notes] = inputData.notes
            }
        }

        return getWatchlistStock(
            watchlistId = inputData.watchlistId,
            stockId = inputData.stockId,
        ) ?: throw WatchlistDaoError("No row returned while 'create watchlist stock mapping'")
    }

    override fun getWatchlistStock(watchlistId: Long, stockId: Long): WatchlistStockRecord? {
        return runDb(action = "get watchlist stock mapping '$watchlistId:$stockId'") {
            WatchlistStocksTable
                .selectAll()
                .where {
                    (WatchlistStocksTable.watchlistId eq watchlistId) and
                        (WatchlistStocksTable.stockId eq stockId)
                }
                .limit(1)
                .singleOrNull()
                ?.toWatchlistStockRecord()
        }
    }

    override fun listStocksForWatchlist(watchlistId: Long): List<WatchlistStockRecord> {
        return runDb(action = "list stocks for watchlist '$watchlistId'") {
            WatchlistStocksTable
                .selectAll()
                .where { WatchlistStocksTable.watchlistId eq watchlistId }
                .orderBy(WatchlistStocksTable.createdAt to SortOrder.DESC)
                .map { row -> row.toWatchlistStockRecord() }
        }
    }

    override fun updateWatchlistStock(
        watchlistId: Long,
        stockId: Long,
        inputData: UpdateWatchlistStockInput,
    ): WatchlistStockRecord? {
        if (inputData.fieldsToUpdate.isEmpty()) {
            throw WatchlistDaoError("update watchlist stock called with no fields to update")
        }

        val updatedRows: Int = runDb(action = "update watchlist stock '$watchlistId:$stockId'") {
            WatchlistStocksTable.update(
                where = {
                    (WatchlistStocksTable.watchlistId eq watchlistId) and
                        (WatchlistStocksTable.stockId eq stockId)
                },
            ) { row ->
                if (WatchlistStockUpdateField.NOTES in inputData.fieldsToUpdate) {
                    row[notes] = inputData.notes
                }
            }
        }
        if (updatedRows == 0) {
            return null
        }

        return getWatchlistStock(watchlistId = watchlistId, stockId = stockId)
    }

    override fun deleteWatchlistStock(watchlistId: Long, stockId: Long): Boolean {
        val deletedRows: Int = runDb(action = "delete watchlist stock '$watchlistId:$stockId'") {
            WatchlistStocksTable.deleteWhere {
                (WatchlistStocksTable.watchlistId eq watchlistId) and
                    (WatchlistStocksTable.stockId eq stockId)
            }
        }
        return deletedRows > 0
    }

    private fun createDatabase(config: WatchlistDatabaseConfig): Database? {
        val jdbcUrl: String = config.jdbcUrl.trim()
        val user: String = config.user.trim()
        val password: String = config.password.trim()

        if (jdbcUrl.isEmpty() || user.isEmpty() || password.isEmpty()) {
            return null
        }

        return Database.connect(
            url = jdbcUrl,
            driver = "org.postgresql.Driver",
            user = user,
            password = password,
        )
    }

    private fun <ResultT> runDb(
        action: String,
        operation: org.jetbrains.exposed.sql.Transaction.() -> ResultT,
    ): ResultT {
        val activeDatabase: Database = database ?: throw WatchlistDaoNotConfiguredError(
            "Supabase DB is not configured. Set SUPABASE_DB_URL, SUPABASE_DB_USER and SUPABASE_DB_PASSWORD.",
        )

        return try {
            transaction(db = activeDatabase) {
                operation(this)
            }
        } catch (error: WatchlistDaoError) {
            throw error
        } catch (error: Exception) {
            throw WatchlistDaoError(
                message = "Unexpected database error while '$action': ${error.message}",
                cause = error,
            )
        }
    }

    private fun countRows(resultSet: ResultSet): Int {
        var count: Int = 0
        while (resultSet.next()) {
            count += 1
        }
        return count
    }

    private fun ResultRow.toStockRecord(): StockRecord {
        return StockRecord(
            id = this[StocksTable.id].value,
            nseSymbol = this[StocksTable.nseSymbol],
            companyName = this[StocksTable.companyName],
            growwSymbol = this[StocksTable.growwSymbol],
            kiteSymbol = this[StocksTable.kiteSymbol],
            description = this[StocksTable.description],
            rating = this[StocksTable.rating]?.toInt(),
            tags = this[StocksTable.tags],
            createdAt = toUtcString(this[StocksTable.createdAt]),
            updatedAt = toUtcString(this[StocksTable.updatedAt]),
        )
    }

    private fun ResultRow.toWatchlistRecord(): WatchlistRecord {
        return WatchlistRecord(
            id = this[WatchlistsTable.id].value,
            name = this[WatchlistsTable.name],
            description = this[WatchlistsTable.description],
            createdAt = toUtcString(this[WatchlistsTable.createdAt]),
            updatedAt = toUtcString(this[WatchlistsTable.updatedAt]),
        )
    }

    private fun ResultRow.toWatchlistStockRecord(): WatchlistStockRecord {
        return WatchlistStockRecord(
            watchlistId = this[WatchlistStocksTable.watchlistId].value,
            stockId = this[WatchlistStocksTable.stockId].value,
            notes = this[WatchlistStocksTable.notes],
            createdAt = toUtcString(this[WatchlistStocksTable.createdAt]),
        )
    }

    private fun toUtcString(value: OffsetDateTime): String {
        return value.toInstant().toString()
    }
}
