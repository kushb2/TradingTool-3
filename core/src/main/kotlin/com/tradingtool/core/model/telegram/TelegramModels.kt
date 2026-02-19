package com.tradingtool.core.model.telegram

import kotlinx.serialization.Serializable

@Serializable
data class TelegramSendTextRequest(
    val text: String,
)

data class TelegramSendFileRequest(
    val bytes: ByteArray,
    val fileName: String,
    val contentType: String,
    val caption: String?,
)

@Serializable
data class TelegramSendResponse(
    val ok: Boolean,
    val message: String,
    val telegramDescription: String? = null,
)

enum class TelegramSendStatus {
    SUCCESS,
    BAD_REQUEST,
    NOT_CONFIGURED,
    FAILED,
}

data class TelegramSendResult(
    val status: TelegramSendStatus,
    val response: TelegramSendResponse,
)

@Serializable
internal data class TelegramApiResponse(
    val ok: Boolean,
    val description: String? = null,
)
