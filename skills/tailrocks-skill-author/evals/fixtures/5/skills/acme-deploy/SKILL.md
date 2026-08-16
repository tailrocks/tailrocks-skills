---
name: acme-deploy
description: >-
  Deploy Acme services: first run the preflight script, then build the container, then push it to the registry, then apply the manifests, then verify the rollout and roll back on failure. Also useful for general DevOps questions, CI setup, and infrastructure work.
---

# Acme Deploy

Deployment (releasing software to servers) is the process of making your
code run in production. Containers are a way to package software with its
dependencies. This skill explains how to deploy Acme services.

## Everything you need to know

ALWAYS run preflight. NEVER deploy on Fridays. ALWAYS verify. NEVER skip
canary unless it matters less for this service. The deploy steps are
documented in references/steps.md, which covers: preflight checks, build
flags, registry authentication, manifest templating, rollout verification,
and rollback. In short, preflight validates the environment, the build
uses the standard flags, authentication uses the team credentials, the
manifests are templated per environment, verification polls the health
endpoint, and rollback reverts to the previous tag.

## Examples

Deploying in Python:

```python
deploy("service", env="prod")
```

Deploying in JavaScript:

```javascript
deploy("service", { env: "prod" });
```

Deploying in Go:

```go
Deploy("service", "prod")
```

## Notes

Back in the March incident we found that deploying service-x with the old
flags broke everything, so watch out for that kind of thing generally.
Character limits in this file do not apply to code blocks.
