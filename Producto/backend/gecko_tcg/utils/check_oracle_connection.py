import os
import sys
from pathlib import Path

import oracledb
from dotenv import load_dotenv


def main() -> int:
    base_dir = Path(__file__).resolve().parents[1]
    load_dotenv(base_dir / '.env', override=True)

    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    wallet_password = os.getenv('DB_WALLET_PASSWORD')
    wallet_dir = os.getenv('DB_WALLET_DIR', r'C:\Wallet_DBPROYECTO')

    if not user or not password:
        print('Falta DB_USER o DB_PASSWORD en .env')
        return 2

    aliases = [
        os.getenv('DB_NAME', 'dbproyecto_medium'),
        'dbproyecto_low',
        'dbproyecto_medium',
        'dbproyecto_high',
        'dbproyecto_tp',
        'dbproyecto_tpurgent',
    ]

    # Preserve order while removing duplicates.
    seen = set()
    unique_aliases = []
    for alias in aliases:
        if alias and alias not in seen:
            seen.add(alias)
            unique_aliases.append(alias)

    print(f'Wallet: {wallet_dir}')
    for dsn in unique_aliases:
        try:
            conn = oracledb.connect(
                user=user,
                password=password,
                dsn=dsn,
                config_dir=wallet_dir,
                wallet_location=wallet_dir,
                wallet_password=wallet_password,
            )
            conn.close()
            print(f'{dsn}: CONNECT_OK')
        except Exception as exc:  # pragma: no cover
            print(f'{dsn}: {exc}')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
