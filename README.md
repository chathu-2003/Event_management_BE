# 🎉 Event Management System – Backend

A backend REST API developed using **Spring Boot** for managing events, participants, and event registrations.
This system provides APIs for creating, updating, and managing event-related data efficiently.

---

## 🚀 Features

✔ Create and manage events
✔ Register participants for events
✔ Update event details
✔ Delete events
✔ RESTful API architecture
✔ Database integration
✔ Clean layered architecture

---

## 🛠 Technologies Used

**Backend**

* Java
* Spring Boot
* Spring Web
* Spring Data JPA

**Database**

* MySQL

**Tools**

* Maven
* IntelliJ IDEA / Eclipse
* Postman (API testing)
* Git & GitHub

---

## 📂 Project Structure

```
event-management-system
│
├── controller
│   └── EventController
│
├── service
│   └── EventService
│
├── repository
│   └── EventRepository
│
├── model
│   └── Event
│
└── EventManagementApplication
```

---

## ⚙️ API Endpoints

### 📌 Get All Events

```
GET /events
```

### 📌 Get Event by ID

```
GET /events/{id}
```

### 📌 Create New Event

```
POST /events
```

### 📌 Update Event

```
PUT /events/{id}
```

### 📌 Delete Event

```
DELETE /events/{id}
```

---

## ⚙️ How to Run the Project

1️⃣ Clone the repository

```bash
git clone https://github.com/chathu-2003/event-management-system.git
```

2️⃣ Open the project using **IntelliJ IDEA / Eclipse**

3️⃣ Configure **MySQL database connection** in `application.properties`

Example:

```
spring.datasource.url=jdbc:mysql://localhost:3306/event_db
spring.datasource.username=root
spring.datasource.password=1234
```

4️⃣ Run the main class

```
EventManagementApplication.java
```

Server will start at:

```
http://localhost:8080
```

---

## 🎯 Project Purpose

This project was developed to demonstrate:

* REST API development using Spring Boot
* CRUD operations
* Database integration with MySQL
* Backend architecture design

---

## 👨‍💻 Author

**Chathura Lakshan**
Software Engineering Student | Full Stack Developer

GitHub
https://github.com/chathu-2003
