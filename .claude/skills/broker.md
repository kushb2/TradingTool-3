# BrokerSkill

## Metadata
* **Scope:** Infrastructure Layer (External Adapters)
* **Target:** Broker APIs (Groww, Zerodha, etc.)

## Purpose
Encapsulate broker API interactions. Prevent vendor-specific objects from leaking into services. Enforce safety mechanisms during development.

## Core Principles

### 1. Adapter Pattern (Strict Isolation)
* Services never import broker SDK directly
* Define interface in `services/`, implement in `adapters/`

```kotlin
// services/BrokerClient.kt
interface BrokerClient {
    fun getQuote(symbol: String): Quote
    fun placeOrder(order: OrderRequest): OrderResponse
}

// adapters/GrowwClient.kt
class GrowwClient : BrokerClient {
    override fun getQuote(symbol: String): Quote { ... }
    override fun placeOrder(order: OrderRequest): OrderResponse { ... }
}
```

### 2. Paper Trading Mode (Safety)
All order methods must respect `PAPER_TRADING_MODE` env var:

```kotlin
fun placeOrder(order: OrderRequest): OrderResponse {
    if (System.getenv("PAPER_TRADING_MODE") == "true") {
        logger.info("PAPER: Would place order $order")
        return OrderResponse(id = "PAPER-${UUID.randomUUID()}", status = "SIMULATED")
    }
    return realBrokerCall(order)
}
```

### 3. Data Normalization
Convert broker-specific responses to your data classes immediately:

```kotlin
// Don't return raw JSON/Map — return typed models
data class Quote(
    val symbol: String,
    val ltp: Double,
    val change: Double,
    val changePercent: Double
)
```

## Error Handling
Map broker exceptions to domain exceptions:

```kotlin
catch (e: BrokerApiException) {
    throw BrokerConnectionError("Failed to fetch quote: ${e.message}")
}
```

## Environment Variables
```
BROKER_API_KEY=
BROKER_API_SECRET=
PAPER_TRADING_MODE=true
```
