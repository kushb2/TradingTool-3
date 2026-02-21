package com.tradingtool.core.kite

import com.tradingtool.core.constants.DatabaseConstants.KiteTokenColumns
import com.tradingtool.core.constants.DatabaseConstants.Tables
import org.jdbi.v3.sqlobject.statement.SqlQuery

interface KiteTokenReadDao {

    /** Returns the most recently saved access token, or null if none exists. */
    @SqlQuery(
        "SELECT ${KiteTokenColumns.ACCESS_TOKEN} FROM public.${Tables.KITE_TOKENS} " +
            "ORDER BY ${KiteTokenColumns.CREATED_AT} DESC LIMIT 1"
    )
    fun getLatestToken(): String?
}
