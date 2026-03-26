# AI‑Assisted Programming Assignment Grading System – Backend

This is the backend for an automated grading system that evaluates Python programming assignments, provides partial credit, AI‑generated feedback, and plagiarism detection. Built with Django and Django REST Framework.

## Features

- **User Authentication** – JWT with role‑based access (student / lecturer)
- **Course & Assignment Management** – Create courses, assignments, and flexible grading rubrics
- **Test Cases** – Support for both `stdout` (run script, compare output) and `function` (import code, call function) test modes
- **Code Submission & Grading** – Upload Python files, run against test cases with partial credit, static analysis (AST), pylint style scoring, and configurable weights
- **AI Feedback** – Uses Google Gemini API to provide short, encouraging suggestions
- **Plagiarism Detection** – Compare submissions using similarity algorithms, view reports, mark reviewed
- **Admin Panel** – Manage all data via Django admin
- **Comprehensive API** – Fully documented endpoints for frontend consumption

## Tech Stack

- **Python 3.13**
- **Django 6.0.3**
- **Django REST Framework**
- **SQLite** (development) / PostgreSQL (production)
- **JWT** – `djangorestframework-simplejwt`
- **Pylint** – code style checking
- **Google Gemini API** – AI feedback
- **Other dependencies** – see `requirements.txt`

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
