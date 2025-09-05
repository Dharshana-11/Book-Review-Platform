# Book Review Platform

A full-stack web application where users can **search for books, read and write reviews, rate books, and get personalized recommendations**. Built with **ReactJS** for the front-end, **Django** for the back-end, and **SQLite** as the database. Integrates with the **Google Books API** to fetch book details.

---

## Tech Stack
- **Front-end:** ReactJS, Ant Design, HTML, CSS, JavaScript  
- **Back-end:** Django, Django REST Framework  
- **Database:** SQLite  
- **APIs:** Google Books API  

---

## Features

- **User Registration & Login:** Secure authentication with email verification.  
- **Profile Setup & Management:** Users can update their profile information.  
- **Book Search:** Search books by title, author, or ISBN using the Google Books API.  
- **Book Details:** View detailed information including description, authors, and cover images.  
- **Reviews:** Write, edit, and delete book reviews.  
- **Ratings:** Rate books and view average ratings.  
- **Like & Unlike Reviews:** Interact with other users’ reviews.  
- **Personalized Recommendations:** Get book suggestions based on user activity.  

---

## Screenshots

### Home Page
![Home Page](frontend/public/screenshots/home-page.png)

### User Authentication
![Login & Signup](frontend/public/screenshots/login-signup.png)
![Email Verification](frontend/public/screenshots/email-verification.png)
![Profile Setup](frontend/public/screenshots/profile-setup.png)

### Book Search
![Search Results](frontend/public/screenshots/search-results.png)

### Book Details
![Book Details & Ratings](frontend/public/screenshots/book-details.png)

### Reviews
![Review Page](frontend/public/screenshots/review-page.png)
![Like Button Interaction](frontend/public/screenshots/like-button.png)

### Profile Page
![Profile Page](frontend/public/screenshots/profile-page.png)

### Book Rating
![Rating Modal](frontend/public/screenshots/rating-modal.png)

---

## Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/Dharshana-11/book-review-platform.git
cd book-review-platform
````

2. **Back-end Setup**

```bash
cd backend
python -m venv env
# On Windows
env\Scripts\activate
# On Mac/Linux
# source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

3. **Front-end Setup**

```bash
cd ../frontend
npm install
npm start
```

4. **Access the app**

Open your browser at [http://localhost:3000](http://localhost:3000)

---

## Skills Demonstrated
 - ReactJS component design and state management
 - Integration of REST APIs and handling asynchronous requests
 - User authentication and authorization with Django
 - CRUD operations and database management with SQLite
 - Responsive web design using Ant Design

---

## Future Enhancements
 - Add AI-based book recommendations
 - Implement user book collections and reading lists
 - Add social features like following users and commenting

## Live Demo
[Click here to view the live app]()
