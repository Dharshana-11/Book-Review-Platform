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
- User **registration and login** with authentication
- Search for books by title, author, or ISBN
- **View book details** fetched from Google Books API
- **Write, edit, and delete reviews**
- **Rate books** and view average ratings

---

## Screenshots
![Search Books](screenshots/search-books.png)  
![Book Details](screenshots/book-details.png)  
![User Reviews](screenshots/user-reviews.png)  

*(Add more screenshots or GIFs to showcase the UI)*

---

## Installation & Setup

1. **Clone the repository**

git clone https://github.com/Dharshana-11/book-review-platform.git
cd book-review-platform

2. **Back-end Setup**

cd backend
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

3. **Front-end Setup**
cd frontend
npm install
npm start

4. **Access the app at http://localhost:3000**

## Skills Demonstrated
 - ReactJS component design and state management
 - Integration of REST APIs and handling asynchronous requests
 - User authentication and authorization with Django
 - CRUD operations and database management with SQLite
 - Responsive web design using Ant Design

## Future Enhancements
 - Add AI-based book recommendations
 - Implement user book collections and reading lists
 - Add social features like following users and commenting

## Live Demo
[Click here to view the live app]()
