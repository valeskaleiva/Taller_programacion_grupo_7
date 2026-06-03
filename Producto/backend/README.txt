Carpeta backend del proyecto.

Comandos utiles:

1) Probar conexion Oracle (wallet + aliases):
	c:/Users/Taller_programacion_grupo_7/.venv/Scripts/python.exe Producto/backend/gecko_tcg/utils/check_oracle_connection.py

2) Levantar backend con Oracle:
	c:/Users/Taller_programacion_grupo_7/.venv/Scripts/python.exe Producto/backend/gecko_tcg/manage.py runserver 0.0.0.0:8000

3) Levantar backend local con SQLite (solo contingencia):
	c:/Users/Taller_programacion_grupo_7/.venv/Scripts/python.exe Producto/backend/gecko_tcg/manage.py migrate --settings gecko_tcg.settings_local
	c:/Users/Taller_programacion_grupo_7/.venv/Scripts/python.exe Producto/backend/gecko_tcg/manage.py runserver 0.0.0.0:8000 --settings gecko_tcg.settings_local

Variables de entorno Oracle:
- DB_NAME
- DB_USER
- DB_PASSWORD
- DB_WALLET_PASSWORD
- DB_WALLET_DIR (opcional, default: C:\Wallet_DBPROYECTO)
