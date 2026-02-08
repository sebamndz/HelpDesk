# 🎫 HelpDesk API

Backend REST API para un sistema de HelpDesk, desarrollado con **ASP.NET Core 8**, **Entity Framework Core** y **SQL Server**, con autenticación **JWT** y autorización basada en **roles**.

Este proyecto simula un entorno real de soporte técnico, donde los usuarios pueden crear tickets y el equipo de soporte (Agents/Admins) gestionarlos.

---

## 🚀 Tecnologías utilizadas

- **.NET 8 – ASP.NET Core Web API**
- **Entity Framework Core**
- **SQL Server**
- **JWT Authentication**
- **Role-based Authorization**
- **Swagger / OpenAPI**
- **DataAnnotations**
- **Code First + Migrations**

---

## 🔐 Autenticación y Autorización

El sistema utiliza **JWT (JSON Web Tokens)** para la autenticación y control de acceso.

### Roles disponibles:
- **Requester**  
  Usuario que crea tickets y solo puede ver los suyos.
- **Agent**  
  Usuario de soporte que puede ver y gestionar todos los tickets.
- **Admin**  
  Control total del sistema (misma capacidad que Agent + administración).

Los roles se incluyen como *claims* dentro del JWT.

---

## 🎟️ Módulo de Tickets

### Funcionalidades principales:

- Crear tickets
- Listar tickets (según rol)
- Ver detalle de un ticket
- Cambiar estado del ticket
- Asignar tickets a un usuario
- Agregar comentarios
- Control de acceso por rol

### Estados del ticket:
- Open
- InProgress
- Resolved
- Closed

### Prioridades:
- Low
- Medium
- High

---

## 📌 Reglas de negocio

### Requester
- Puede crear tickets
- Solo puede ver sus propios tickets
- Puede comentar en sus tickets
- ❌ No puede cambiar estado ni asignar

### Agent / Admin
- Puede ver todos los tickets
- Puede cambiar estado
- Puede asignar tickets
- Puede comentar

---

## 🧩 Endpoints principales

### Autenticación

```
POST /auth/register
POST /auth/login
```

### Tickets

```
POST /tickets (Requester)
GET /tickets
GET /tickets/{id}
PATCH /tickets/{id}/status (Admin, Agent)
PATCH /tickets/{id}/assign (Admin, Agent)
POST /tickets/{id}/comments
```

---

## 🛠️ Configuración del proyecto

### Requisitos
- .NET SDK 8+
- SQL Server
- Visual Studio / VS Code

### Cadena de conexión (appsettings.Development.json)

```json
"ConnectionStrings": {
  "Default": "Server=localhost;Database=HelpDeskDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### JWT Config

```json
"Jwt": {
  "Key": "helpdesk_super_secret_key_2026_very_long_32chars",
  "Issuer": "HelpDesk",
  "Audience": "HelpDesk"
}
```

---

## 🗄️ Base de datos

El proyecto utiliza EF Core Code First.

Crear base de datos y tablas:

```
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## 📖 Swagger

Swagger está habilitado en entorno de desarrollo:

```
https://localhost:{puerto}/swagger
```

Incluye autenticación JWT mediante el botón Authorize.

---

## 🧪 Testing manual recomendado

- Registrar usuario Requester
- Login → obtener token
- Crear ticket
- Login como Admin
- Cambiar estado / asignar ticket
- Ver detalle y comentarios

---

## 📂 Estructura del proyecto

```
HelpDesk.Api
│
├── Controllers
├── Data
├── Dtos
├── Models
├── Services
├── Migrations
└── Program.cs
```

---

## 🎯 Objetivo del proyecto

Este proyecto fue desarrollado con fines educativos y de portafolio, simulando un backend empresarial real, aplicando buenas prácticas de arquitectura, seguridad y control de acceso.

---

## 👨‍💻 Autor

Sebastián Méndez  
Backend Developer (ASP.NET Core / SQL Server)

---

## 📄 Licencia

MIT
