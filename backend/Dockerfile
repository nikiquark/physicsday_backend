# syntax=docker/dockerfile:1

# ---------- Общая база: зависимости Python ----------
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Системные пакеты не нужны: psycopg[binary] несёт libpq внутри колеса,
# Pillow ставится готовым колесом. Установка чего-либо через apt-get
# добавляет к сборке несколько минут — если понадобится, сначала
# проверьте, правда ли без этого нельзя.
COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# ---------- Прод: gunicorn ----------
FROM base AS runtime

COPY . /app

# STATIC_ROOT наполняется на этапе сборки, чтобы образ был самодостаточным.
# На старте контейнера entrypoint повторяет collectstatic — иначе том,
# который читает внешний nginx, останется со статикой от первой сборки.
RUN DJANGO_SECRET_KEY=build-only-not-a-secret \
    DJANGO_ALLOWED_HOSTS=localhost \
    python manage.py collectstatic --noinput --clear

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["gunicorn", "PhysicsDay.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "2", \
     "--timeout", "60", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
