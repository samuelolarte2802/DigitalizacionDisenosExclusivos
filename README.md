# Sistema de Información Web - Diseños Exclusivos

Plataforma web con arquitectura modular (Cliente-Servidor) para la gestión operativa, trazabilidad de pedidos y control financiero de la microempresa de sastrería "Diseños Exclusivos" en Chía, Cundinamarca.

## Arquitectura y Tecnologías
*   **Frontend (Capa de Presentación):** React.js (SPA), Tailwind CSS, Axios, Zustand.
*   **Backend (Capa de Negocio):** C# ASP.NET Core 8 (API RESTful), Entity Framework Core, JWT, BCrypt.
*   **Base de Datos (Capa de Persistencia):** PostgreSQL (Modelo Híbrido: Relacional + JSONB).

## Requisitos Previos
Para desplegar este proyecto en un entorno On-Premise (Local), necesitas:
*   [Node.js](https://nodejs.org/) (v18 o superior)
*   [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
*   [PostgreSQL](https://www.postgresql.org/) (v15 o superior)

## Instrucciones de Instalación y Despliegue

### 1. Configuración de la Base de Datos
1. Abre PgAdmin o la consola de PostgreSQL y crea una base de datos vacía.
2. Ve a la carpeta del backend: `DigitalizacionAPI/appsettings.json` y actualiza la cadena de conexión (Connection String) con tu usuario y contraseña local de PostgreSQL.
3. Abre una terminal en la carpeta `DigitalizacionAPI` y ejecuta las migraciones de Entity Framework para construir las tablas y el esquema híbrido automáticamente:
   ```bash
   dotnet ef database update