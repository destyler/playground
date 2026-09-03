#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const rootDirectory = path.resolve(scriptDirectory, '..')
const distDirectory = path.join(rootDirectory, 'dist')
const archivePath = path.resolve(rootDirectory, process.env.ZEABUR_ARCHIVE_PATH || 'playground-dist.zip')
const apiBase = (process.env.ZEABUR_API_BASE || 'https://api.zeabur.com').replace(/\/$/, '')
const command = process.argv[2]
const argument = process.argv[3]

if (!command || command === '--help' || command === '-h') {
  printHelp()
  process.exit(command ? 0 : 1)
}

try {
  switch (command) {
    case 'package':
      createArchive()
      writeOutputs({ archive_path: archivePath })
      break
    case 'create':
      await createPreview(argument)
      break
    case 'update':
      await updatePreview(argument)
      break
    case 'delete':
      await deletePreview(argument)
      break
    default:
      throw new Error(`Unknown command: ${command}`)
  }
}
catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}

async function createPreview(prNumber) {
  prNumber ||= process.env.PR_NUMBER
  if (!/^\d{1,10}$/.test(prNumber || '')) {
    throw new Error('create requires a numeric pull request number')
  }

  const token = requireEnvironment('ZEABUR_TOKEN')
  const projectId = requireEnvironment('ZEABUR_PROJECT_ID')
  const environmentId = requireEnvironment('ZEABUR_ENVIRONMENT_ID')
  ensureArchive()

  const serviceName = `pr-${prNumber}`
  const domainPrefix = normalizeDomainPrefix(process.env.ZEABUR_PREVIEW_DOMAIN_PREFIX || 'destyler-playground-pr')
  const requestedDomain = `${domainPrefix}-${prNumber}`
  let serviceId

  try {
    console.log(`Creating preview service ${serviceName} ...`)
    const service = await executeGraphQL(token, `
      mutation CreateService($name: String!, $projectID: ObjectID!, $template: ServiceTemplate!) {
        createService(name: $name, projectID: $projectID, template: $template) {
          _id
          name
        }
      }
    `, {
      name: serviceName,
      projectID: projectId,
      template: 'PREBUILT_V2',
    })

    serviceId = service.createService?._id
    if (!serviceId) {
      throw new Error('Zeabur did not return a service id')
    }

    console.log(`Deploying archive to service ${serviceId} ...`)
    await deployArchive(token, environmentId, serviceId)

    console.log(`Assigning preview domain ${requestedDomain} ...`)
    const result = await executeGraphQL(token, `
      mutation AddDomain($serviceId: ObjectID!, $domain: String!, $isGenerated: Boolean!) {
        addDomain(serviceID: $serviceId, domain: $domain, isGenerated: $isGenerated) {
          domain
        }
      }
    `, {
      serviceId,
      domain: requestedDomain,
      isGenerated: true,
    })

    const domain = result.addDomain?.domain
    if (!domain) {
      throw new Error('Zeabur did not return a preview domain')
    }

    const deployUrl = `https://${domain}`
    writeOutputs({ service_id: serviceId, domain, preview_url: deployUrl, deploy_url: deployUrl })
    console.log(`Preview created: ${deployUrl}`)
  }
  catch (error) {
    if (serviceId) {
      console.error(`Preview creation failed; deleting service ${serviceId} ...`)
      try {
        await removeService(token, serviceId)
        console.error(`Rollback completed for service ${serviceId}.`)
      }
      catch (rollbackError) {
        console.error(`Rollback failed for service ${serviceId}: ${formatError(rollbackError)}`)
      }
    }
    throw error
  }
}

async function updatePreview(serviceId) {
  serviceId ||= process.env.SERVICE_ID
  validateServiceId(serviceId, 'update')
  const token = requireEnvironment('ZEABUR_TOKEN')
  const environmentId = requireEnvironment('ZEABUR_ENVIRONMENT_ID')
  const previewUrl = previewUrlFromDomain(requireEnvironment('DOMAIN'))
  ensureArchive()

  console.log(`Updating preview service ${serviceId} ...`)
  const deploymentUrl = await deployArchive(token, environmentId, serviceId)
  writeOutputs({ service_id: serviceId, preview_url: previewUrl, deployment_url: deploymentUrl })
  console.log(`Preview update started for service ${serviceId}.`)
}

async function deletePreview(serviceId) {
  serviceId ||= process.env.SERVICE_ID
  validateServiceId(serviceId, 'delete')
  const token = requireEnvironment('ZEABUR_TOKEN')

  console.log(`Deleting preview service ${serviceId} ...`)
  await removeService(token, serviceId)
  writeOutputs({ service_id: serviceId, deleted: 'true' })
  console.log(`Preview service ${serviceId} deleted.`)
}

function createArchive() {
  if (!fs.existsSync(path.join(distDirectory, 'index.html'))) {
    throw new Error('dist/index.html is missing; run pnpm build first')
  }

  fs.mkdirSync(path.dirname(archivePath), { recursive: true })
  fs.rmSync(archivePath, { force: true })

  const result = spawnSync('zip', ['-r', '-q', archivePath, '.'], {
    cwd: distDirectory,
    env: process.env,
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(`zip exited with status ${result.status}`)
  }

  console.log(`Created ${archivePath}`)
}

function ensureArchive() {
  if (!fs.existsSync(archivePath)) {
    throw new Error(`Archive not found at ${archivePath}; run pnpm preview:archive first`)
  }
  if (!fs.statSync(archivePath).isFile() || fs.statSync(archivePath).size === 0) {
    throw new Error(`Archive is empty or invalid: ${archivePath}`)
  }
}

async function deployArchive(token, environmentId, serviceId) {
  const size = fs.statSync(archivePath).size
  const hash = await sha256Base64(archivePath)

  const upload = await requestJson(`${apiBase}/v2/upload`, {
    method: 'POST',
    headers: authorizedJsonHeaders(token),
    body: JSON.stringify({
      content_hash: hash,
      content_hash_algorithm: 'sha256',
      content_length: size,
    }),
  }, 'create upload session')

  if (!upload.presign_url || !upload.upload_id) {
    throw new Error('Zeabur returned an invalid upload session')
  }

  await uploadArchive(upload.presign_url, upload.presign_header, size)

  const deployment = await requestJson(`${apiBase}/v2/upload/${encodeURIComponent(upload.upload_id)}/prepare`, {
    method: 'POST',
    headers: authorizedJsonHeaders(token),
    body: JSON.stringify({
      upload_type: 'existing_service',
      service_id: serviceId,
      environment_id: environmentId,
    }),
  }, 'prepare deployment')

  return deployment.url || ''
}

async function uploadArchive(url, presignedHeaders, size) {
  const headers = new Headers()
  for (const [key, value] of Object.entries(presignedHeaders || {})) {
    headers.set(key, String(value))
  }
  headers.set('Content-Length', String(size))

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: await fs.promises.readFile(archivePath),
  })

  if (!response.ok) {
    throw new Error(`archive upload failed with HTTP ${response.status}: ${await response.text()}`)
  }
}

async function removeService(token, serviceId) {
  const result = await executeGraphQL(token, `
    mutation DeleteService($id: ObjectID!) {
      deleteService(_id: $id)
    }
  `, { id: serviceId })

  if (result.deleteService !== true) {
    throw new Error(`Zeabur did not confirm deletion of service ${serviceId}`)
  }
}

async function executeGraphQL(token, query, variables) {
  const response = await requestJson(`${apiBase}/graphql`, {
    method: 'POST',
    headers: authorizedJsonHeaders(token),
    body: JSON.stringify({ query, variables }),
  }, 'GraphQL request')

  if (response.errors?.length) {
    throw new Error(response.errors.map(error => error.message).join('; '))
  }
  if (!response.data) {
    throw new Error('Zeabur returned an invalid GraphQL response')
  }
  return response.data
}

async function requestJson(url, options, operation) {
  const response = await fetch(url, options)
  const body = await response.text()
  if (!response.ok) {
    throw new Error(`${operation} failed with HTTP ${response.status}: ${body}`)
  }

  try {
    return body ? JSON.parse(body) : {}
  }
  catch {
    throw new Error(`${operation} returned invalid JSON`)
  }
}

function authorizedJsonHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

async function sha256Base64(file) {
  const hash = createHash('sha256')
  await new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .on('data', chunk => hash.update(chunk))
      .on('error', reject)
      .on('end', resolve)
  })
  return hash.digest('base64')
}

function requireEnvironment(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`)
  }
  return value
}

function validateServiceId(serviceId, targetCommand) {
  if (!/^[a-f\d]{24}$/i.test(serviceId || '')) {
    throw new Error(`${targetCommand} requires a 24-character Zeabur service id`)
  }
}

function normalizeDomainPrefix(value) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!normalized || normalized.length > 48) {
    throw new Error('ZEABUR_PREVIEW_DOMAIN_PREFIX must contain 1-48 URL-safe characters')
  }
  return normalized
}

function previewUrlFromDomain(domain) {
  return /^https?:\/\//i.test(domain) ? domain : `https://${domain}`
}

function writeOutputs(outputs) {
  for (const [key, rawValue] of Object.entries(outputs)) {
    const value = String(rawValue)
    console.log(`${key.toUpperCase()}=${value}`)
    if (process.env.GITHUB_OUTPUT) {
      const delimiter = `zeabur_${key}_${process.pid}`
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}<<${delimiter}\n${value}\n${delimiter}\n`)
    }
  }
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error)
}

function printHelp() {
  console.log(`Usage:
  node scripts/zeabur-preview.mjs package
  node scripts/zeabur-preview.mjs create <pull-request-number>
  node scripts/zeabur-preview.mjs update <service-id>
  node scripts/zeabur-preview.mjs delete <service-id>

Required environment variables:
  ZEABUR_TOKEN             API token (create, update, delete)
  ZEABUR_PROJECT_ID        project id (create)
  ZEABUR_ENVIRONMENT_ID    environment id (create, update)
  PR_NUMBER                pull request number (create; CLI argument overrides)
  SERVICE_ID               service id (update, delete; CLI argument overrides)
  DOMAIN                   preview domain (update)

Optional environment variables:
  ZEABUR_API_BASE               default: https://api.zeabur.com
  ZEABUR_ARCHIVE_PATH           default: playground-dist.zip
  ZEABUR_PREVIEW_DOMAIN_PREFIX  default: destyler-playground-pr`)
}
