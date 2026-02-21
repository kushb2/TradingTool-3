package com.tradingtool.core.kite

import com.tradingtool.core.constants.DatabaseConstants.KiteTokenColumns
import com.tradingtool.core.constants.DatabaseConstants.Tables
import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface KiteTokenWriteDao {

    /** Persists a new access token. Old rows are kept for audit; only the latest is used. */
    @SqlUpdate(
        "INSERT INTO public.${Tables.KITE_TOKENS} (${KiteTokenColumns.ACCESS_TOKEN}) VALUES (:accessToken)"
    )
    fun saveToken(@Bind("accessToken") accessToken: String)
}
