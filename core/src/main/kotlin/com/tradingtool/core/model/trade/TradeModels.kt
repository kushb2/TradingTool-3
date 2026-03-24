package com.tradingtool.core.model.trade

import com.fasterxml.jackson.annotation.JsonProperty
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.math.BigDecimal

// ==================== Core Entity Models ====================

@Serializable
data class Trade(
    val id: Long,
    @SerialName("stock_id")
    @get:JsonProperty("stock_id")
    val stockId: Long,
    @SerialName("nse_symbol")
    @get:JsonProperty("nse_symbol")
    val nseSymbol: String,
    val quantity: Int,
    @SerialName("avg_buy_price")
    @get:JsonProperty("avg_buy_price")
    val avgBuyPrice: String, // decimal as string for precision
    @SerialName("today_low")
    @get:JsonProperty("today_low")
    val todayLow: String? = null,
    @SerialName("stop_loss_percent")
    @get:JsonProperty("stop_loss_percent")
    val stopLossPercent: String,
    @SerialName("stop_loss_price")
    @get:JsonProperty("stop_loss_price")
    val stopLossPrice: String,
    val notes: String? = null,
    @SerialName("trade_date")
    @get:JsonProperty("trade_date")
    val tradeDate: String, // YYYY-MM-DD format
    @SerialName("created_at")
    @get:JsonProperty("created_at")
    val createdAt: String,
    @SerialName("updated_at")
    @get:JsonProperty("updated_at")
    val updatedAt: String,
)

// ==================== Input Models for Create/Consolidate Operations ====================

@Serializable
data class CreateTradeInput(
    @SerialName("stock_id")
    @JsonProperty("stock_id")
    val stockId: Long,
    @SerialName("nse_symbol")
    @JsonProperty("nse_symbol")
    val nseSymbol: String,
    val quantity: Int,
    @SerialName("avg_buy_price")
    @JsonProperty("avg_buy_price")
    val avgBuyPrice: String, // e.g., "3100.50"
    @SerialName("today_low")
    @JsonProperty("today_low")
    val todayLow: String? = null, // e.g., "3050.00"
    @SerialName("stop_loss_percent")
    @JsonProperty("stop_loss_percent")
    val stopLossPercent: String, // e.g., "5.5"
    val notes: String? = null,
    @SerialName("trade_date")
    @JsonProperty("trade_date")
    val tradeDate: String = java.time.LocalDate.now().toString(), // YYYY-MM-DD
)

// ==================== Response Models with Calculated GTT Targets ====================

@Serializable
data class GttTarget(
    val percent: Double, // 2.0, 3.0, 5.0, 7.0, 10.0
    val price: String, // decimal as string
    @SerialName("yield_percent")
    @get:JsonProperty("yield_percent")
    val yieldPercent: String, // yield % against avg buy price
)

@Serializable
data class TradeWithTargets(
    val trade: Trade,
    @SerialName("gtt_targets")
    @get:JsonProperty("gtt_targets")
    val gttTargets: List<GttTarget>,
    @SerialName("total_invested")
    @get:JsonProperty("total_invested")
    val totalInvested: String, // quantity × avg_buy_price
)

// ==================== Consolidation Helper (Internal) ====================

/**
 * Internal model for FIFO consolidation logic.
 * When a new trade is posted for an existing stock,
 * this calculates the merged weighted average price.
 */
data class TradeConsolidation(
    val stockId: Long,
    val existingQuantity: Int,
    val existingAvgPrice: BigDecimal,
    val newQuantity: Int,
    val newAvgPrice: BigDecimal,
    val consolidatedQuantity: Int,
    val consolidatedAvgPrice: BigDecimal, // (qty1×price1 + qty2×price2) / (qty1+qty2)
)
