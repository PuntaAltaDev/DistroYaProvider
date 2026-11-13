# DistroYaProvider
DistroYaProvider
- UC5: Registro con Email Personal / OTP 
- UC6: Configurar Perfil: Razón Social, Logo y Contacto 
- UC7: Subir y Actualizar Catálogo en formato PDF 
- UC8: Seleccionar / Gestionar Tags y Plan de Suscripción  
- UC9: Recibir Alerta Push de Vencimiento de Plan

# Caso de Usos
```mermaid
  flowchart TD
    %% Definición de Estilos
    classDef actor fill:#1e293b,stroke:#0f172a,color:#ffffff,font-weight:bold,rx:8,ry:8
    classDef adminUC fill:#eff6ff,stroke:#3b82f6,color:#1e3a8a,rx:6,ry:6
    classDef provUC fill:#f0fdf4,stroke:#22c55e,color:#14532d,rx:6,ry:6
    classDef cliUC fill:#faf5ff,stroke:#a855f7,color:#581c87,rx:6,ry:6

    subgraph Actores_Global ["ARQUITECTURA DE CASOS DE USO POR ACTOR"]
        direction LR
        
        %% ==========================================
        %% 2. PROVEEDOR
        subgraph Col_Prov ["🏢 PROVEEDOR"]
            direction TB
            Proveedor(["👤 Proveedor"]):::actor
            
            UC5["<b>UC5</b><br/>Registro con Email<br/>Personal / OTP"]:::provUC
            UC6["<b>UC6</b><br/>Configurar Perfil:<br/>Razón Social y Logo"]:::provUC
            UC7["<b>UC7</b><br/>Subir y Actualizar<br/>Catálogo PDF"]:::provUC
            UC8["<b>UC8</b><br/>Gestionar Tags y<br/>Plan de Suscripción"]:::provUC
            UC9["<b>UC9</b><br/>Recibir Alerta Push<br/>Vencimiento de Plan"]:::provUC

            Proveedor --> UC5
            Proveedor --> UC6
            Proveedor --> UC7
            Proveedor --> UC8
            UC9 -.->|Push| Proveedor
        end
    end
```
