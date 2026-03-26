# AI‑Assisted Programming Assignment Grading System – Backend

This is the backend for an automated grading system that evaluates Python programming assignments, provides partial credit, AI‑generated feedback, and plagiarism detection. Built with Django and Django REST Framework.

---

## Features

- **User Authentication** – JWT with role‑based access (student / lecturer)
- **Course & Assignment Management** – Create courses, assignments, and flexible grading rubrics
- **Test Cases** – Support for both `stdout` (run script, compare output) and `function` (import code, call function) test modes
- **Code Submission & Grading** – Upload Python files, run against test cases with partial credit, static analysis (AST), pylint style scoring, and configurable weights
- **AI Feedback** – Uses Google Gemini API to provide short, encouraging suggestions
- **Plagiarism Detection** – Compare submissions using similarity algorithms, view reports, mark reviewed
- **Admin Panel** – Manage all data via Django admin
- **Comprehensive API** – Fully documented endpoints for frontend consumption

---

## Tech Stack

- **Python 3.13**
- **Django 6.0.3**
- **Django REST Framework**
- **SQLite** (development) / PostgreSQL (production)
- **JWT** – `djangorestframework-simplejwt`
- **Pylint** – code style checking
- **Google Gemini API** – AI feedback
- **Other dependencies** – see `requirements.txt`

---

## Getting Started

### Prerequisites
- Python 3.13 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/1Joshie7/ai-assisted-marking.git
   cd ai-assisted-marking
Create and activate a virtual environment

bash
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
Install dependencies

bash
pip install -r requirements.txt
Set up environment variables
Create a .env file in the project root (next to manage.py) and add:

text
GEMINI_API_KEY=your-google-gemini-api-key
(If you omit this, AI feedback will be skipped – the system still works.)

Run migrations

bash
python manage.py migrate
Create a superuser (for admin access)

bash
python manage.py createsuperuser
Start the development server

bash
python manage.py runserver
The API will be available at http://127.0.0.1:8000/api/.
The admin panel is at http://127.0.0.1:8000/admin/.

API Documentation
Full API documentation (endpoints, authentication, request/response examples) is available in the Frontend API Documentation.docx file in this repository. It covers all endpoints, file upload instructions, token refresh, and error codes.

Project Structure
text
grading_system/
├── accounts/          # User authentication and profiles
├── assignments/       # Courses, assignments, test cases
├── submissions/       # Submission model and grading engine
├── plagiarism/        # Plagiarism detection module
├── grading_system/    # Project settings and URLs
├── media/             # Uploaded files (ignored by git)
├── requirements.txt   # Python dependencies
└── manage.py
Testing
To run tests (if added):

bash
python manage.py test
Deployment
For production, you should:

Switch to a production database (e.g., PostgreSQL)

Set DEBUG=False and configure allowed hosts

Serve static/media files properly (e.g., with WhiteNoise or a CDN)

Use a production WSGI server (e.g., Gunicorn) with Nginx

Set environment variables (secret key, Gemini API key, etc.) in a secure way

A sample deployment guide can be provided upon request.

Contributing
This project was developed for a university course. If you want to contribute, please coordinate with the team lead.

License
This project is for educational purposes only. All rights reserved.

Acknowledgements
Google Gemini API for AI feedback

Django and DRF community for the excellent tools

All team members for their contributions
