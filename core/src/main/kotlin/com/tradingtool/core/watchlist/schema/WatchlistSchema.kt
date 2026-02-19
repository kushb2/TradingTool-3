package com.tradingtool.core.watchlist.schema

import org.jetbrains.exposed.dao.id.LongIdTable
import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestampWithTimeZone

object StocksTable : LongIdTable(name = "stocks") {
    val nseSymbol = text("nse_symbol").uniqueIndex()
    val companyName = text("company_name")
    val growwSymbol = text("groww_symbol").nullable()
    val kiteSymbol = text("kite_symbol").nullable()
    val description = text("description").nullable()
    val rating = short("rating").nullable()
    val tags = array<String>("tags").default(emptyList())
    val createdAt = timestampWithTimeZone("created_at")
    val updatedAt = timestampWithTimeZone("updated_at")
}

object WatchlistsTable : LongIdTable(name = "watchlists") {
    val name = text("name").uniqueIndex()
    val description = text("description").nullable()
    val createdAt = timestampWithTimeZone("created_at")
    val updatedAt = timestampWithTimeZone("updated_at")
}

object WatchlistStocksTable : Table(name = "watchlist_stocks") {
    val watchlistId = reference(
        name = "watchlist_id",
        foreign = WatchlistsTable,
        onDelete = ReferenceOption.CASCADE,
    )
    val stockId = reference(
        name = "stock_id",
        foreign = StocksTable,
        onDelete = ReferenceOption.CASCADE,
    )
    val notes = text("notes").nullable()
    val createdAt = timestampWithTimeZone("created_at")

    override val primaryKey: PrimaryKey = PrimaryKey(watchlistId, stockId)
}
