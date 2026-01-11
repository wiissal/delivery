# LogistiMa - Class Diagram
````mermaid
classDiagram
    class Zone {
        +UUID id
        +String name
        +String city
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
        +Date deletedAt
        +hasMany() Deliverers
        +hasMany() Packages
    }

    class Deliverer {
        +UUID id
        +String name
        +String phone
        +Integer maxCapacity
        +Integer currentCapacity
        +Boolean isAvailable
        +UUID zoneId
        +Date createdAt
        +Date updatedAt
        +belongsTo() Zone
        +hasMany() Packages
        +hasMany() Deliveries
        +hasCapacity() Boolean
    }

    class Package {
        +UUID id
        +String trackingNumber
        +String senderName
        +String senderPhone
        +String recipientName
        +String recipientPhone
        +String pickupAddress
        +String deliveryAddress
        +Float weight
        +String status
        +UUID zoneId
        +UUID delivererId
        +Date createdAt
        +Date updatedAt
        +belongsTo() Zone
        +belongsTo() Deliverer
        +hasOne() Delivery
    }

    class Delivery {
        +UUID id
        +String deliveryCode
        +String status
        +UUID packageId
        +UUID delivererId
        +String routeData
        +String receiptUrl
        +Date estimatedDelivery
        +Date actualDelivery
        +Date createdAt
        +Date updatedAt
        +belongsTo() Package
        +belongsTo() Deliverer
    }

    class DispatcherService {
        +assignPackageToDeliverer(packageId, delivererId)
        +findBestDeliverer(zoneId)
        +autoAssignPackage(packageId)
    }

    class CacheService {
        +get(key)
        +set(key, value, ttl)
        +delete(key)
        +deletePattern(pattern)
        +clear()
    }

    class QueueService {
        +addRouteCalculationJob(deliveryData)
        +addReceiptGenerationJob(deliveryData)
        +processDelivery(deliveryData)
        +getQueueStats()
    }

    Zone "1" --> "0..*" Deliverer : contains
    Zone "1" --> "0..*" Package : has
    Deliverer "1" --> "0..*" Package : delivers
    Deliverer "1" --> "0..*" Delivery : performs
    Package "1" --> "0..1" Delivery : has
    
    DispatcherService ..> Package : uses
    DispatcherService ..> Deliverer : uses
    QueueService ..> Delivery : creates jobs for
    CacheService ..> Zone : caches
    CacheService ..> Deliverer : caches
````
\```



