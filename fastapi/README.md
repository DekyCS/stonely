# Rockly FastAPI Backend

This is the FastAPI backend for the Rockly rock analysis application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the development server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /upload-image` - Upload rock image (coming next) 