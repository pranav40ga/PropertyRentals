# PropLet: A Website for Rent and Sale of Property


## Overview
PropLet is a modern web platform designed to simplify the property rental and sale process. It enables users to list, search, and communicate directly with landlords and buyers, eliminating intermediaries and ensuring a seamless experience.

## Features
-  User authentication (JWT + Google OAuth)
-  Advanced property search with filters (location, price, amenities)
-  Secure property listing and management
-  Direct email communication with property owners
-  Responsive UI with Tailwind CSS
-  Scalable NoSQL database using MongoDB Atlas

## Technologies Used
### Frontend
- **React.js** - Dynamic UI components
- **Tailwind CSS** - Responsive styling
- **Redux Toolkit** - State management for data persistence

### Backend
- **Node.js & Express.js** - Server-side logic
- **MongoDB Atlas** - NoSQL database for scalable storage

### Authentication & Hosting
- **JWT + Google OAuth** - Secure login
- **Vercel/Render** - Cloud deployment

## Installation & Setup
### Prerequisites
- Node.js & npm installed
- MongoDB Atlas account
- Google OAuth credentials

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/dhruv2004b/PropertyRentals.git
   cd PropertyRentals
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables (`.env` file):
   ```sh
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

5. Open the app in your browser at `http://localhost:3000`

## Project Structure
```
/PropertyRentals
├── client/        # React frontend
├── server/        # Node.js backend
├── models/        # Mongoose schemas
├── routes/        # API endpoints
├── controllers/   # Business logic
├── .env           # Environment variables
├── package.json   # Dependencies
└── README.md      # Project documentation
```

## Contributing
Contributions are welcome! Follow these steps:
1. Fork the repo & create a new branch.
2. Implement your feature or bug fix.
3. Submit a pull request for review.

## Contact
For questions or feedback, contact [Dhruv Brahmbhatt](mailto:dhruvbrahm007@gmail.com).
