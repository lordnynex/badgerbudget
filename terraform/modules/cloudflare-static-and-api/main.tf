# ------------------------------------------------------------------------------
# Cloudflare static frontend + API DNS and cache
#
# Required API token permissions (Zone scope, e.g. specific zone nynex.io):
#   - Zone Read       — data "cloudflare_zones" (look up zone_id by domain)
#   - DNS Write       — cloudflare_dns_record (create/update CNAMEs for frontend and API)
#   - Cache Rules Edit (Cache Settings Write) — cloudflare_ruleset (cache rule for static site)
# ------------------------------------------------------------------------------

# Requires: Zone Read
data "cloudflare_zone" "main" {
  filter = {
    name = var.zone_domain
  }
}

locals {
  zone_id = data.cloudflare_zone.main.id
}

# Requires: DNS Write
resource "cloudflare_dns_record" "frontend" {
  count = var.enable_frontend && var.frontend_host != "" ? 1 : 0

  zone_id = local.zone_id
  name    = replace(var.frontend_host, ".${var.zone_domain}", "")
  type    = "CNAME"
  content = var.frontend_origin_host
  proxied = true
  ttl     = 1
}

# Requires: DNS Write
resource "cloudflare_dns_record" "api" {
  count = var.enable_api && var.api_host != "" ? 1 : 0

  zone_id = local.zone_id
  name    = replace(var.api_host, ".${var.zone_domain}", "")
  type    = "CNAME"
  content = var.api_origin_host
  proxied = var.api_proxied
  ttl     = 1
}

# Requires: Cache Settings Write (Cache Rules Edit)
resource "cloudflare_ruleset" "cache_frontend" {
  count = var.enable_frontend && var.frontend_host != "" ? 1 : 0

  zone_id     = local.zone_id
  name        = "Cache static site"
  description = "Cache HTML/JS/CSS for the frontend host"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules = [
    {
      ref         = "frontend_cache"
      description = "Cache static site at edge"
      expression  = "(http.host eq \"${var.frontend_host}\")"
      action      = "set_cache_settings"
      action_parameters = {
        edge_ttl = {
          mode    = "override_origin"
          default = var.cache_edge_ttl_seconds
        }
        browser_ttl = {
          mode = "respect_origin"
        }
      }
    }
  ]
}
