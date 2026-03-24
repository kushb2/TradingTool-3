package com.tradingtool.core.kite

data class TickSnapshot(
    val instrumentToken: Long,
    val ltp: Double,
    val volume: Long,
    val changePercent: Double,
    val open: Double,
    val high: Double,
    val low: Double,
    val close: Double,
    val updatedAt: Long = System.currentTimeMillis()
)
