FROM python:3.13-slim-bookworm
ENV CUDA_VISIBLE_DEVICES="" OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /camera
COPY requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt
COPY *.py ./
COPY models ./models
ENTRYPOINT ["python", "/camera/track.py"]
