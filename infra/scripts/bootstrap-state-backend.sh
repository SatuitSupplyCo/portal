#!/usr/bin/env bash
set -euo pipefail

# Bootstrap Terraform state backend in the shared-services account.
# Run once, then delete this script (or keep for documentation).
#
# Prerequisites:
#   - AWS CLI configured with the shared-services profile:
#     aws configure --profile shared-services
#   - The bootstrap IAM user has AdministratorAccess (temporary)
#
# Usage:
#   chmod +x infra/scripts/bootstrap-state-backend.sh
#   ./infra/scripts/bootstrap-state-backend.sh

AWS_PROFILE="shared-services"
AWS_REGION="us-east-1"
BUCKET_NAME="satuit-terraform-state"
DYNAMODB_TABLE="terraform-locks"

echo "==> Using AWS profile: ${AWS_PROFILE}"
echo "==> Region: ${AWS_REGION}"
echo ""

ACCOUNT_ID=$(aws sts get-caller-identity --profile "${AWS_PROFILE}" --query "Account" --output text)
echo "==> Account ID: ${ACCOUNT_ID}"
echo ""

# --- S3 Bucket ---

echo "==> Creating S3 bucket: ${BUCKET_NAME}"
if aws s3api head-bucket --bucket "${BUCKET_NAME}" --profile "${AWS_PROFILE}" 2>/dev/null; then
  echo "    Bucket already exists, skipping creation."
else
  aws s3api create-bucket \
    --bucket "${BUCKET_NAME}" \
    --region "${AWS_REGION}" \
    --profile "${AWS_PROFILE}"
  echo "    Bucket created."
fi

echo "==> Enabling versioning"
aws s3api put-bucket-versioning \
  --bucket "${BUCKET_NAME}" \
  --versioning-configuration Status=Enabled \
  --profile "${AWS_PROFILE}"

echo "==> Enabling server-side encryption (AES256)"
aws s3api put-bucket-encryption \
  --bucket "${BUCKET_NAME}" \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "aws:kms"
        },
        "BucketKeyEnabled": true
      }
    ]
  }' \
  --profile "${AWS_PROFILE}"

echo "==> Blocking all public access"
aws s3api put-public-access-block \
  --bucket "${BUCKET_NAME}" \
  --public-access-block-configuration '{
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  }' \
  --profile "${AWS_PROFILE}"

echo "==> Adding bucket policy to enforce encryption in transit"
aws s3api put-bucket-policy \
  --bucket "${BUCKET_NAME}" \
  --policy "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [
      {
        \"Sid\": \"EnforceTLS\",
        \"Effect\": \"Deny\",
        \"Principal\": \"*\",
        \"Action\": \"s3:*\",
        \"Resource\": [
          \"arn:aws:s3:::${BUCKET_NAME}\",
          \"arn:aws:s3:::${BUCKET_NAME}/*\"
        ],
        \"Condition\": {
          \"Bool\": {
            \"aws:SecureTransport\": \"false\"
          }
        }
      }
    ]
  }" \
  --profile "${AWS_PROFILE}"

echo ""

# --- DynamoDB Table ---

echo "==> Creating DynamoDB table: ${DYNAMODB_TABLE}"
if aws dynamodb describe-table --table-name "${DYNAMODB_TABLE}" --region "${AWS_REGION}" --profile "${AWS_PROFILE}" 2>/dev/null; then
  echo "    Table already exists, skipping creation."
else
  aws dynamodb create-table \
    --table-name "${DYNAMODB_TABLE}" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "${AWS_REGION}" \
    --profile "${AWS_PROFILE}"
  echo "    Table created. Waiting for it to become active..."
  aws dynamodb wait table-exists \
    --table-name "${DYNAMODB_TABLE}" \
    --region "${AWS_REGION}" \
    --profile "${AWS_PROFILE}"
  echo "    Table is active."
fi

echo ""
echo "=========================================="
echo " State backend is ready."
echo "=========================================="
echo ""
echo " Use this in your Terraform backend config:"
echo ""
echo "   terraform {"
echo "     backend \"s3\" {"
echo "       bucket         = \"${BUCKET_NAME}\""
echo "       key            = \"<stack-name>/terraform.tfstate\""
echo "       region         = \"${AWS_REGION}\""
echo "       dynamodb_table = \"${DYNAMODB_TABLE}\""
echo "       encrypt        = true"
echo "     }"
echo "   }"
echo ""
echo " Account ID: ${ACCOUNT_ID}"
echo " S3 Bucket:  ${BUCKET_NAME}"
echo " DynamoDB:   ${DYNAMODB_TABLE}"
echo " Region:     ${AWS_REGION}"
echo "=========================================="
