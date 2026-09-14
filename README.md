# Full-Stack Coding Assignment (Library Management System)

[Demo video](MyChoice_Demo.mp4)

This project is a small full-stack application built with Django and React.

The **backend follows the assignment specification** and uses a generic `Item` model with `/items/` API endpoints. The **frontend presents those items as books in a library** to give the application a more practical theme.

The Book/Library terminology only exists on the frontend. The backend still uses `Item`, `name`, and `group` as defined in the assignment.

## Frontend / Backend Mapping

| Frontend presentation | Backend Item API |
| --- | --- |
| Book | Item |
| Book title (`name`) | `name` |
| Fiction (`category`) | `Primary` (`group`) |
| Non-Fiction (`category`) | `Secondary` (`group`) |

## Tech Stack

### Backend

* Python
* Django/Django REST Framework
* SQLite

### Frontend

* React
* TypeScript
* Vite
* Chakra UI
* Axios

### Testing

* Django Test Framework
* Vitest
* React Testing Library

## Prerequisites

Install Python 3.13 with `pip`, and Node.js with npm. Vite 8 requires Node.js `^20.19.0` or `>=22.12.0`. The next two sections use a macOS/Linux terminal and start from the project root; Windows PowerShell instructions follow them.

## Running the Backend

In the first terminal, enter the backend directory, create a Python virtual environment, activate it, and install the backend dependencies:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```

If `backend/venv` already exists, you can skip `python3 -m venv venv` and activate the existing environment. Keep this terminal in `backend` for the remaining Django commands.

### Configure the Django Secret Key

The backend expects `DJANGO_SECRET_KEY` to be available as an environment variable. If you do not already have `backend/.env`, generate a key **after installing the dependencies**, because this command imports Django:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

If `backend/.env` does not exist, create it. **Put the following line inside that file**, replacing the placeholder with the key printed above. This is file content, not a command to run in the terminal:

```text
export DJANGO_SECRET_KEY='your-generated-key-here'
```

Keep this key private and do not commit `.env` to Git.

From the `backend` directory, load the environment variable into this terminal. Django does not read `.env` automatically:

```bash
source .env
```

Then apply the database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend will run at:

```text
http://localhost:8000
```

> When opening a new terminal for the backend, remember to activate the virtual environment and run `source .env` again.

## Running the Frontend

Keep the Django server running and open a second terminal.

From the project root:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm ci
```

Create the frontend environment file if it does not already exist:

```bash
cp .env.example .env
```

The default API URL is:

```text
VITE_API_URL=http://localhost:8000
```

This should point to the Django server itself. The frontend automatically adds the `/items/` path when making API requests.

Start the frontend:

```bash
npm run dev
```

Vite will print the local URL in the terminal. By default, the application should be available at:

```text
http://localhost:5173/books
```

## Windows PowerShell

Use two PowerShell windows, each starting from the project root. In the first, set up and run Django:

```powershell
cd backend
py -3.13 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
if (-not (Test-Path .env.key)) {
    python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" | Set-Content .env.key
}
$env:DJANGO_SECRET_KEY = (Get-Content .env.key -Raw).Trim()
python manage.py migrate
python manage.py runserver
```

The private `backend/.env.key` file contains one generated key and is ignored by Git. Keep it; in each new backend PowerShell session, reactivate the virtual environment and rerun the `$env:DJANGO_SECRET_KEY = ...` line. PowerShell cannot use the macOS/Linux `export` and `source .env` commands above. If PowerShell blocks `Activate.ps1`, skip activation and use `.\venv\Scripts\python.exe` in place of `python` for the backend commands.

In the second PowerShell window, set up and run Vite:

```powershell
cd frontend
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

## API Endpoints

The Django backend provides the following endpoints:

| Method  | Endpoint       | Description         |
| ------- | -------------- | ------------------- |
| `GET`   | `/items/`      | Get all items       |
| `POST`  | `/items/`      | Create an item      |
| `GET`   | `/items/<id>/` | Get a specific item |
| `PATCH` | `/items/<id>/` | Update an item      |

Each Item contains:

* `id`
* `name`
* `group`
* `created_at`
* `updated_at`

`group` can be either `Primary` or `Secondary`.

The API also validates that an Item name is not empty and that the same name cannot appear more than once within the same group. Duplicate checks are case insensitive.

Invalid requests return a `400 Bad Request`, while requests for Items that do not exist return a `404 Not Found`.


## Project Structure

Some of the main files are:

```text
backend/
├── items/
│   ├── models.py          # Item model
│   ├── serializers.py     # API serialization and validation
│   ├── views.py           # API views
│   └── urls.py            # Item API routes
└── config/
    └── settings.py        # Django configuration

frontend/
└── src/
    ├── components/
    │   └── BookForm.tsx   # Create/edit book form
    ├── pages/             # Book list and detail pages
    ├── services/
    │   └── api.ts         # API calls 
    └── App.tsx            # Frontend routes
```

## Development Notes

The project is configured for local development.

Django allows requests from the default Vite development server at `http://localhost:5173`. If Vite starts on a different port, update `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py` to match.

The current Django settings, including `DEBUG=True`, are intended for development and should be changed before deploying the application to production.
