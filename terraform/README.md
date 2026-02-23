# Terraform – Satyrs M/C AWS infrastructure

This directory defines AWS resources for the Satyrs M/C project: optional S3 static hosting, optional ECR + App Runner for the API, an instance profile (SES + S3, ECR pull), and a CI/CD IAM user with minimal permissions.

---

## Topology & architecture

### High-level architecture

The stack runs in **AWS** (us-east-1 by default) with optional **Cloudflare** for DNS, caching, and optional proxying. Static assets are served from S3; the API runs on App Runner and pulls images from ECR. SES is used for sending email when enabled.

```mermaid
flowchart TB
  subgraph External["External"]
    User["Users / Browsers"]
    CI["CI/CD (e.g. GitHub Actions)"]
  end

  subgraph Cloudflare["Cloudflare (optional)"]
    CFZone["Zone DNS"]
    CFCache["Edge cache (frontend)"]
    CFZone --> CFCache
  end

  subgraph AWS["AWS"]
    S3["S3 static hosting bucket"]
    ECR["ECR repository"]
    AppRunner["App Runner service"]
    SES["SES (domain identity + DKIM)"]
    IAM["IAM (instance profile + CI/CD user)"]
  end

  User --> CFZone
  CFZone --> S3
  CFZone --> AppRunner
  AppRunner --> ECR
  AppRunner --> SES
  AppRunner --> S3
  IAM --> AppRunner
  CI --> ECR
  CI --> S3
  CI --> AppRunner
```

### Request flow (frontend and API)

Traffic from users hits Cloudflare first (when enabled). The frontend host (e.g. `satyrs.nynex.io`) is proxied and cached; the API host (e.g. `satyrs-api.nynex.io`) can be DNS-only or proxied. Origins are S3 website endpoint and App Runner hostname respectively.

```mermaid
sequenceDiagram
  participant U as User
  participant CF as Cloudflare
  participant S3 as S3 website
  participant AR as App Runner

  Note over U,AR: Frontend (static)
  U->>CF: GET / (frontend host)
  CF->>CF: Cache lookup (edge TTL)
  alt Cache miss
    CF->>S3: GET index.html
    S3-->>CF: 200 + content
    CF-->>U: 200 + cached
  else Cache hit
    CF-->>U: 200 (from edge)
  end

  Note over U,AR: API
  U->>CF: GET /api/... (API host)
  opt API proxied
    CF->>AR: Forward request
    AR-->>CF: Response
    CF-->>U: Response
  else API DNS-only
    U->>AR: Direct to App Runner URL
    AR-->>U: Response
  end
```

### Module dependency topology

Terraform modules and their dependencies. Optional modules are gated by variables (`create_*`, `enable_*`). The instance profile and CI/CD user always exist and are wired to whichever optional resources are created.

```mermaid
flowchart LR
  subgraph Optional["Optional (variable-gated)"]
    SHB["static-hosting-bucket"]
    ECR["ecr"]
    SES["ses"]
    AR["app-runner"]
    CF["cloudflare-static-and-api"]
  end

  subgraph Core["Always created"]
    IP["instance-profile"]
    CICD["cicd-user"]
  end

  IP --> SHB
  IP --> ECR
  IP --> SES
  AR --> ECR
  AR --> IP
  CF --> SHB
  CF --> AR
  SES --> CF
  CICD --> ECR
  CICD --> SHB
  CICD --> AR
  CICD --> IP
```

### Resource topology (AWS + Cloudflare)

Where each resource lives and how it connects. Arrows indicate “uses” or “points to”.

```mermaid
flowchart TB
  subgraph Cloudflare["Cloudflare"]
    Zone["Zone (e.g. nynex.io)"]
    DNSFront["CNAME frontend → S3 website"]
    DNSApi["CNAME api → App Runner"]
    CacheRule["Cache ruleset (frontend host)"]
    SESVerify["SES verification TXT"]
    DKIM["SES DKIM CNAMEs x3"]
  end

  subgraph AWS["AWS"]
    S3Bucket["S3 bucket (website config)"]
    S3Policy["Bucket policy (public read)"]
    ECRRepo["ECR repository"]
    ECRLifecycle["ECR lifecycle policy"]
    AppRunnerSvc["App Runner service"]
    AppRunnerScaling["App Runner auto-scaling config"]
    SESDomain["SES domain identity"]
    SESDKIM["SES DKIM"]
    Role["IAM role (app)"]
    RoleSES["Role policy: SES"]
    RoleS3["Role policy: S3"]
    RoleECR["Role policy: ECR"]
    Profile["IAM instance profile"]
    CICDUser["IAM user (CI/CD)"]
    CICDKey["Access key"]
    CICDPolicy["User policy: ECR, S3, App Runner, PassRole"]
  end

  Zone --> DNSFront
  Zone --> DNSApi
  Zone --> CacheRule
  Zone --> SESVerify
  Zone --> DKIM
  DNSFront --> S3Bucket
  DNSApi --> AppRunnerSvc
  SESVerify --> SESDomain
  DKIM --> SESDKIM

  S3Bucket --> S3Policy
  ECRRepo --> ECRLifecycle
  AppRunnerSvc --> AppRunnerScaling
  AppRunnerSvc --> ECRRepo
  AppRunnerSvc --> Role
  SESDomain --> SESDKIM

  Role --> RoleSES
  Role --> RoleS3
  Role --> RoleECR
  Profile --> Role
  CICDUser --> CICDKey
  CICDUser --> CICDPolicy
  CICDPolicy --> ECRRepo
  CICDPolicy --> S3Bucket
  CICDPolicy --> AppRunnerSvc
  CICDPolicy --> Role
```

### CI/CD pipeline topology

CI uses the IAM user’s access key to push images, upload static assets, and trigger App Runner deployments. The App Runner service pulls from ECR and runs with the instance role (SES, S3, ECR pull).

```mermaid
flowchart LR
  subgraph CI["CI/CD pipeline"]
    Build["Build image"]
    Push["Push to ECR"]
    Upload["Upload to S3"]
    Deploy["Start App Runner deployment"]
  end

  subgraph AWS["AWS"]
    CICD["CI/CD IAM user"]
    ECR["ECR"]
    S3["S3 bucket"]
    AR["App Runner"]
    Role["Instance role"]
  end

  Build --> Push
  Push --> ECR
  Upload --> S3
  Deploy --> AR
  CICD --> Push
  CICD --> Upload
  CICD --> Deploy
  AR --> ECR
  AR --> Role
```

### Terraform state backend

State is stored in S3; bucket and key are fixed in `backend.tf` (Terraform does not allow variables in the backend block).

```mermaid
flowchart LR
  subgraph Local["Local / CI"]
    TF["terraform CLI"]
  end

  subgraph Backend["State backend (S3)"]
    Bucket["s3://satyrs-tfstate"]
    Key["satyrs/terraform.tfstate"]
  end

  TF --> Bucket
  Bucket --> Key
```

---

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.0
- AWS CLI configured; profile used is set in `terraform.tfvars` (default: `brandon`)

## Backend

State is stored in S3. Bucket and key are set in `backend.tf` (literals; Terraform does not allow variables in the backend block). To change state location:

1. Edit `backend.tf` with the new bucket and key.
2. Run: `terraform init -reconfigure`

Keep `tf_state_bucket` and `tf_state_key` in `terraform.tfvars` in sync for documentation.

## Usage

```bash
# From repo root
cd terraform

# Initialize (downloads providers, configures S3 backend)
export AWS_PROFILE=brandon   # or set in terraform.tfvars and ensure profile exists
terraform init

# Plan and apply
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

Defaults are in `terraform.tfvars` (committed). Override with `-var` or another `.tfvars` file as needed.

## CI/CD secret

The CI/CD IAM user gets one access key. The **secret** is only available after the first apply and is stored in state. Capture it once and put it in your CI secrets (e.g. GitHub Actions):

```bash
terraform output -raw cicd_secret_access_key
```

Use `cicd_access_key_id` and this secret in CI for: pushing images to ECR, writing to the static hosting bucket, and starting App Runner deployments.

## Optional resources

Controlled by variables in `terraform.tfvars`:

- **Static hosting bucket**: `create_static_hosting_bucket`, `static_hosting_bucket_name`
- **ECR repository**: `create_ecr_repository`, `ecr_repository_name`
- **App Runner**: `create_app_runner`, `app_runner_service_name`, CPU/memory/port

Set the corresponding `create_*` to `false` to skip creating that resource.

## Adding more static hosting buckets

Use the `static-hosting-bucket` module again with a different name:

```hcl
module "static_hosting_bucket_second" {
  source = "./modules/static-hosting-bucket"

  bucket_name = "another-domain.org"
  tags        = var.tags
}
```

Then add the new bucket ARN to the instance profile and CI/CD user (e.g. via a list variable) so the app and CI can access it.
