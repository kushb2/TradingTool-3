package com.tradingtool.core.strategy

import com.tradingtool.core.kite.KiteConnectClient

/**
 * Contract for trading strategy signal scanners.
 *
 * Each scanner is responsible for:
 * - Fetching historical data from Kite
 * - Computing signals for all tracked stocks
 * - Persisting new signals to the database (idempotent)
 * - Sending Telegram notifications for new signals
 *
 * The cron job (IndicatorsSyncJob) iterates all registered scanners.
 * Adding a new strategy = implement this interface + register in the cron job.
 */
interface SignalScanner {
    val name: String
    suspend fun scan(kiteClient: KiteConnectClient)
}
