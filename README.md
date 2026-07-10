# 🍽️ MessBuddy

A modern full-stack web application that helps students discover, compare, and review nearby messes and restaurants around their college. Built with the **MERN Stack**, MessBuddy provides an intuitive platform for exploring menus, viewing ratings, managing favorites, and making informed dining decisions.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-green?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple?logo=bootstrap)
![License](https://img.shields.io/badge/License-MIT-green)

---

# 📸 Screenshots

### 🏠 Home Page

<img width="1906" height="975" alt="image" src="https://github.com/user-attachments/assets/64e15a40-dd1c-41da-8cf5-4c0f38015ec2" />

### 👤 Login

<img width="1897" height="967" alt="image" src="https://github.com/user-attachments/assets/9d931ea6-0510-4e22-aac0-c5d478c3e849" />


---

# ✨ Features

## 🍽 Restaurant Discovery

- Browse nearby messes and restaurants
- Restaurant-specific pages
- Dynamic food cards
- Search restaurants instantly
- Responsive navigation

## 📋 Menu Management

- View daily menus
- Restaurant-wise menu organization
- Category-based food display
- Best Today's Specials section

## 👤 User Authentication

- Secure user registration
- Login using JWT Authentication
- Password encryption with bcrypt
- Protected routes
- Persistent user sessions

## ❤️ Personalized Experience

- Save favorite restaurants
- Manage favorites
- Personalized recommendations
- User profile support

## ⭐ Community Features

- Restaurant ratings
- Upvote & Downvote system
- Customer reviews
- Popular dishes

## 🤖 AI Integration

- AI-powered food assistance
- Smart menu recommendations
- Interactive chatbot support

## 📱 User Experience

- Fully responsive design
- Mobile-friendly interface
- Modern Bootstrap UI
- Fast page loading
- Smooth navigation

---

# 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | React.js, Bootstrap, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT, bcrypt |
| APIs | REST APIs |
| Storage | Supabase Storage |
| Version Control | Git, GitHub |
| Deployment | Vercel, Render |

---

# 🏗 System Architecture

```
                React Frontend
                      │
                      ▼
              Express REST API
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 JWT Authentication          MongoDB Atlas
        │                           │
        ▼                           ▼
     User Data              Restaurant Data
        │
        ▼
  Supabase Storage
```

---

# 📂 Project Structure

```
MessBuddy/
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   └── App.js
│
├── package.json
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/69979Prasanna/MessBuddy.git
```

## Navigate

```bash
cd MessBuddy
```

## Install Backend

```bash
npm install
```

## Install Frontend

```bash
cd frontend
npm install
```

## Configure Environment Variables

Create a `.env` file.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
REACT_APP_APIKEY=your_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

---

## Run Backend

```bash
npm run dev
```

## Run Frontend

```bash
npm start
```

---

# 🔐 Security

- JWT Authentication
- bcrypt Password Hashing
- Protected API Routes
- Secure User Sessions
- Environment Variable Configuration

---

# 📈 Performance

- Fast React Rendering
- Optimized REST APIs
- Efficient MongoDB Queries
- Responsive UI
- Lazy Component Loading
- Mobile Optimized

---

# 🚀 Future Enhancements

- 📍 GPS-based Nearby Mess Search
- 💳 Online Meal Subscription
- 🍱 Meal Booking
- 🔔 Push Notifications
- 🤖 AI Meal Recommendation Engine
- 📊 Restaurant Analytics Dashboard
- 🌙 Dark Mode
- 📷 Image Upload for Reviews
- 📱 Progressive Web App (PWA)
- 💬 Real-time Chat Support

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 👨‍💻 Author

**Prasanna Solapure**

📧 prasannasolapure5@gmail.com

💼 LinkedIn: https://linkedin.com/in/prasanna-solapure-581a22333

💻 GitHub: https://github.com/69979Prasanna

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It motivates me to build more open-source projects!

---
