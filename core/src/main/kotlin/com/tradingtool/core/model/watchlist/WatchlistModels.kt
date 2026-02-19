package com.tradingtool.core.model.watchlist

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class StockRecord(
    val id: Long,
    @SerialName("nse_symbol")
    val nseSymbol: String,
    @SerialName("company_name")
    val companyName: String,
    @SerialName("groww_symbol")
    val growwSymbol: String? = null,
    @SerialName("kite_symbol")
    val kiteSymbol: String? = null,
    val description: String? = null,
    val rating: Int? = null,
    val tags: List<String> = emptyList(),
    @SerialName("created_at")
    val createdAt: String,
    @SerialName("updated_at")
    val updatedAt: String,
)

@Serializable
data class CreateStockInput(
    @SerialName("nse_symbol")
    val nseSymbol: String,
    @SerialName("company_name")
    val companyName: String,
    @SerialName("groww_symbol")
    val growwSymbol: String? = null,
    @SerialName("kite_symbol")
    val kiteSymbol: String? = null,
    val description: String? = null,
    val rating: Int? = null,
    val tags: List<String> = emptyList(),
)

enum class StockUpdateField {
    COMPANY_NAME,
    GROWW_SYMBOL,
    KITE_SYMBOL,
    DESCRIPTION,
    RATING,
    TAGS,
}

data class UpdateStockInput(
    val fieldsToUpdate: Set<StockUpdateField>,
    val companyName: String? = null,
    val growwSymbol: String? = null,
    val kiteSymbol: String? = null,
    val description: String? = null,
    val rating: Int? = null,
    val tags: List<String>? = null,
)

@Serializable
data class UpdateStockPayload(
    @SerialName("company_name")
    val companyName: String? = null,
    @SerialName("groww_symbol")
    val growwSymbol: String? = null,
    @SerialName("kite_symbol")
    val kiteSymbol: String? = null,
    val description: String? = null,
    val rating: Int? = null,
    val tags: List<String>? = null,
)

@Serializable
data class WatchlistRecord(
    val id: Long,
    val name: String,
    val description: String? = null,
    @SerialName("created_at")
    val createdAt: String,
    @SerialName("updated_at")
    val updatedAt: String,
)

@Serializable
data class CreateWatchlistInput(
    val name: String,
    val description: String? = null,
)

enum class WatchlistUpdateField {
    NAME,
    DESCRIPTION,
}

data class UpdateWatchlistInput(
    val fieldsToUpdate: Set<WatchlistUpdateField>,
    val name: String? = null,
    val description: String? = null,
)

@Serializable
data class UpdateWatchlistPayload(
    val name: String? = null,
    val description: String? = null,
)

@Serializable
data class WatchlistStockRecord(
    @SerialName("watchlist_id")
    val watchlistId: Long,
    @SerialName("stock_id")
    val stockId: Long,
    val notes: String? = null,
    @SerialName("created_at")
    val createdAt: String,
)

@Serializable
data class CreateWatchlistStockInput(
    @SerialName("watchlist_id")
    val watchlistId: Long,
    @SerialName("stock_id")
    val stockId: Long,
    val notes: String? = null,
)

enum class WatchlistStockUpdateField {
    NOTES,
}

data class UpdateWatchlistStockInput(
    val fieldsToUpdate: Set<WatchlistStockUpdateField>,
    val notes: String? = null,
)

@Serializable
data class UpdateWatchlistStockPayload(
    val notes: String? = null,
)

@Serializable
data class TableAccessStatus(
    @SerialName("table_name")
    val tableName: String,
    val accessible: Boolean,
    @SerialName("sample_row_count")
    val sampleRowCount: Int? = null,
    val error: String? = null,
)
