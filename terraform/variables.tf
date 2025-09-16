# Oracle Cloud Infrastructure Variables
variable "tenancy_ocid" {
  description = "OCID of the tenancy"
  type        = string
}

variable "user_ocid" {
  description = "OCID of the user"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint of the public key"
  type        = string
}

variable "private_key_path" {
  description = "Path to the private key file"
  type        = string
}

variable "region" {
  description = "Oracle Cloud region"
  type        = string
  default     = "us-ashburn-1"
}

variable "compartment_id" {
  description = "OCID of the compartment"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key for the instance"
  type        = string
}

# GitHub Repository Variables
variable "github_repo" {
  description = "GitHub repository URL"
  type        = string
  default     = "https://github.com/periclesandrade21/portal-ead-taxista-vix.git"
}

variable "github_token" {
  description = "GitHub personal access token for private repos"
  type        = string
  sensitive   = true
  default     = ""
}

variable "webhook_secret" {
  description = "GitHub webhook secret for CI/CD"
  type        = string
  sensitive   = true
  default     = "taxista-webhook-secret-2025"
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
}

# Application Variables
variable "auth0_domain" {
  description = "Auth0 domain"
  type        = string
}

variable "auth0_client_id" {
  description = "Auth0 client ID"
  type        = string
}

variable "auth0_client_secret" {
  description = "Auth0 client secret"
  type        = string
  sensitive   = true
}

variable "mongo_password" {
  description = "MongoDB password"
  type        = string
  sensitive   = true
  default     = "taxista2025!"
}

variable "postgres_password" {
  description = "PostgreSQL password for Moodle"
  type        = string
  sensitive   = true
  default     = "moodle2025!"
}