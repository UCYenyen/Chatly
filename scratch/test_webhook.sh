#!/bin/bash

# Local Webhook Test Script
# This script sends a mock WhatsApp message payload to your local webhook
# to verify that the signature verification logic is working correctly.

# Configuration
WEBHOOK_URL="http://localhost:3000/api/whatsapp/webhook"
# Get secret from .env if possible, otherwise use a default
SECRET=$(grep "^GOWA_WEBHOOK_SECRET=" .env | sed 's/^GOWA_WEBHOOK_SECRET=//' | sed "s/^'//" | sed "s/'$//" | sed 's/^"//' | sed 's/"$//')
if [ -z "$SECRET" ]; then
  SECRET="YJo33DtPmvk5WT00X+RabbSutIv6EsGDRui+kbeOfKA="
fi

echo "Using Secret: $SECRET"

# Payload
PAYLOAD='{
  "event": "message",
  "device_id": "test_device",
  "payload": {
    "from": "628123456789@s.whatsapp.net",
    "text": "Hello Chatly!",
    "from_me": false,
    "id": "test_msg_id_'"$(date +%s)"'"
  }
}'

# Generate HMAC SHA256 signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

echo "Generated Signature: $SIGNATURE"

# Send Request
curl -i -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -d "$PAYLOAD"

echo -e "\n\nTest complete. Check your server console for logs."
