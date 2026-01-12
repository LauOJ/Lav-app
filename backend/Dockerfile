# Usar Python 3.11
FROM python:3.13-slim

# Crear carpeta de la app
WORKDIR /app

# Copiar requirements y luego instalarlos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código
COPY . .

# Exponer el puerto donde correrá FastAPI
EXPOSE 8000

# Comando para arrancar FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
