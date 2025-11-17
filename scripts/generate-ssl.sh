#!/bin/bash

# Генерация SSL сертификатов для development
# Для production используйте Let's Encrypt или другие сертификаты

set -e

CERT_DIR="./certs"
DAYS=365
KEY_SIZE=2048

echo "🔐 Генерация SSL сертификатов..."

# Создаем директорию для сертификатов
mkdir -p "$CERT_DIR"

# Генерируем приватный ключ
echo "📝 Генерация приватного ключа..."
openssl genrsa -out "$CERT_DIR/server.key" $KEY_SIZE

# Генерируем запрос на сертификат
echo "📝 Генерация CSR..."
openssl req -new -key "$CERT_DIR/server.key" -out "$CERT_DIR/server.csr" \
  -subj "/C=RU/ST=State/L=City/O=PetCare/CN=localhost"

# Генерируем самоподписанный сертификат
echo "📝 Генерация самоподписанного сертификата..."
openssl x509 -req -days $DAYS -in "$CERT_DIR/server.csr" \
  -signkey "$CERT_DIR/server.key" -out "$CERT_DIR/server.crt"

# Удаляем CSR (не нужен после генерации сертификата)
rm "$CERT_DIR/server.csr"

echo "✅ SSL сертификаты созданы:"
echo "   - $CERT_DIR/server.key (приватный ключ)"
echo "   - $CERT_DIR/server.crt (сертификат)"
echo ""
echo "⚠️  ВНИМАНИЕ: Это самоподписанный сертификат для development!"
echo "   Для production используйте Let's Encrypt или другие сертификаты."

