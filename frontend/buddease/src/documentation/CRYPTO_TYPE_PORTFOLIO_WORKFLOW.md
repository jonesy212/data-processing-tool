CRYPTO_TYPE_PORTFOLIO_WORKFLOW.md
flowchart TD
    subgraph "💰 Portfolio Discovery"
        A[📈 Market Scan<br>TypeScript Errors Detected] --> B[📊 Portfolio Analysis<br>pnpm check:types:count]
        B --> C[📉 Risk Assessment<br>Error Impact Report]
    end
    
    subgraph "📊 Investment Strategy"
        C --> D{📈 Portfolio Size}
        D -->|"💎 Small Position"| E[⚡ Quick Trade<br>pnpm fix:types:quick]
        D -->|"📊 Medium Portfolio"| F[📋 Planned Investment<br>pnpm fix:types]
        D -->|"🏦 Large Holdings"| G[🏛️ Comprehensive Strategy<br>pnpm fix:types:dry]
    end
    
    subgraph "🔄 Trading Execution"
        E --> H[🤝 Order Matching]
        F --> H
        G --> H
        H --> I[📝 Trade Confirmation<br>Review changes before execution]
    end
    
    subgraph "🔒 Security Audit"
        I --> J[🛡️ Portfolio Verification<br>pnpm check:types:count]
        J --> K{📊 Audit Results}
        K -->|"✅ Clean: No vulnerabilities"| L[🎉 Position Secured]
        K -->|"⚠️ Issues Identified"| M[🎯 Risk Mitigation]
    end
    
    subgraph "🎯 Risk Management"
        M --> N{🔍 Issue Classification}
        N -->|"📦 Namespace Contracts"| O[🛠️ Smart Contract Fix<br>pnpm fix:types:namespace]
        N -->|"🔄 Mixed Asset Types"| P[🔄 Portfolio Rebalancing<br>pnpm fix:types:mixed]
        N -->|"🎨 Complex Derivatives"| Q[👨‍💼 Risk Officer Review<br>Manual Analysis]
        O --> R[🔄 Re-audit]
        P --> R
        Q --> R
    end
    
    R --> J
    L --> S[🚀 Transaction Finalized<br>Commit & Deploy]
    
    style A fill:#fff3e0
    style B fill:#ffe0b2
    style C fill:#ffcc80
    style E fill:#c8e6c9
    style F fill:#b3e5fc
    style G fill:#ffcdd2
    style H fill:#d1c4e9
    style I fill:#bbdefb
    style J fill:#c8e6c9
    style L fill:#a5d6a7
    style O fill:#ffccbc
    style P fill:#f0f4c3
    style Q fill:#b2ebf2
    style S fill:#81c784