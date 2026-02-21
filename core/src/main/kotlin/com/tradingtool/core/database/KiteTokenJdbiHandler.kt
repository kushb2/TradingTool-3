package com.tradingtool.core.database

import com.tradingtool.core.kite.KiteTokenReadDao
import com.tradingtool.core.kite.KiteTokenWriteDao

/** Pre-configured JDBI handler for kite_tokens table. */
typealias KiteTokenJdbiHandler = JdbiHandler<KiteTokenReadDao, KiteTokenWriteDao>
