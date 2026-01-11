```
mermaid
graph TB
    subgraph "LogistiMa Delivery System"
        UC1[Create Package]
        UC2[Assign Package to Deliverer]
        UC3[Auto-Assign Package]
        UC4[Track Delivery Status]
        UC5[Manage Zones]
        UC6[Manage Deliverers]
        UC7[View Queue Statistics]
        UC8[Generate Delivery Receipt]
        UC9[Calculate Optimal Route]
        UC10[Update Delivery Status]
    end
    
    Admin((Admin))
    Dispatcher((Dispatcher))
    Deliverer((Deliverer))
    System((Background System))
    
    Admin --> UC5
    Admin --> UC6
    
    Dispatcher --> UC1
    Dispatcher --> UC2
    Dispatcher --> UC3
    Dispatcher --> UC4
    Dispatcher --> UC7
    
    Deliverer --> UC4
    Deliverer --> UC10
    
    System --> UC8
    System --> UC9
    
    UC2 -.-> UC6
    UC3 -.-> UC2
    UC1 -.-> UC5
    UC8 -.-> UC10
    UC9 -.-> UC10
```
\```

