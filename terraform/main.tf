terraform {
  required_providers {
    oci = {
      source = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

# Configure the Oracle Cloud Infrastructure Provider
provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

# Get availability domain
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

# Create VCN
resource "oci_core_vcn" "taxista_vcn" {
  cidr_block     = "10.1.0.0/16"
  compartment_id = var.compartment_id
  display_name   = "taxista-ead-vcn"
  dns_label      = "taxistavcn"
}

# Create Internet Gateway
resource "oci_core_internet_gateway" "taxista_internet_gateway" {
  compartment_id = var.compartment_id
  display_name   = "taxista-ead-internet-gateway"
  vcn_id         = oci_core_vcn.taxista_vcn.id
}

# Create Route Table
resource "oci_core_default_route_table" "default_route_table" {
  manage_default_resource_id = oci_core_vcn.taxista_vcn.default_route_table_id
  display_name               = "taxista-ead-route-table"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.taxista_internet_gateway.id
  }
}

# Create Subnet
resource "oci_core_subnet" "taxista_subnet" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  cidr_block          = "10.1.20.0/24"
  display_name        = "taxista-ead-subnet"
  dns_label           = "taxistasubnet"
  security_list_ids   = [oci_core_security_list.taxista_security_list.id]
  compartment_id      = var.compartment_id
  vcn_id              = oci_core_vcn.taxista_vcn.id
  route_table_id      = oci_core_vcn.taxista_vcn.default_route_table_id
  dhcp_options_id     = oci_core_vcn.taxista_vcn.default_dhcp_options_id
}

# Create Security List
resource "oci_core_security_list" "taxista_security_list" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.taxista_vcn.id
  display_name   = "taxista-ead-security-list"

  egress_security_rules {
    protocol    = "6"
    destination = "0.0.0.0/0"
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      max = "22"
      min = "22"
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      max = "80"
      min = "80"
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      max = "443"
      min = "443"
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      max = "3000"
      min = "3000"
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      max = "8001"
      min = "8001"
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      max = "9000"
      min = "9000"
    }
  }
}

# Get OS Images
data "oci_core_images" "ubuntu_images" {
  compartment_id = var.compartment_id
  operating_system = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape = "VM.StandardE2.1.Micro"
  sort_by = "TIMECREATED"
  sort_order = "DESC"
}

# Create Compute Instance
resource "oci_core_instance" "taxista_instance" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_id
  display_name        = "taxista-ead-server"
  shape               = "VM.StandardE2.1.Micro"

  create_vnic_details {
    subnet_id                 = oci_core_subnet.taxista_subnet.id
    display_name              = "primaryvnic"
    assign_public_ip          = true
    assign_private_dns_record = true
    hostname_label            = "taxista-ead"
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu_images.images[0].id
    boot_volume_size_in_gbs = "50"
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(templatefile("${path.module}/cloud-init.yaml", {
      github_repo = var.github_repo
      github_token = var.github_token
      auth0_domain = var.auth0_domain
      auth0_client_id = var.auth0_client_id
      auth0_client_secret = var.auth0_client_secret
      mongo_password = var.mongo_password
      postgres_password = var.postgres_password
      webhook_secret = var.webhook_secret
      domain_name = var.domain_name
    }))
  }
}

# Output the public IP
output "instance_public_ip" {
  value = oci_core_instance.taxista_instance.public_ip
}

output "instance_private_ip" {
  value = oci_core_instance.taxista_instance.private_ip
}

output "ssh_connection" {
  value = "ssh ubuntu@${oci_core_instance.taxista_instance.public_ip}"
}

output "webhook_url" {
  value = "http://${oci_core_instance.taxista_instance.public_ip}:9000/webhook"
}

output "application_urls" {
  value = {
    ead_platform = "http://${oci_core_instance.taxista_instance.public_ip}"
    moodle = "http://${oci_core_instance.taxista_instance.public_ip}/moodle"
    api = "http://${oci_core_instance.taxista_instance.public_ip}/api"
  }
}