import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

import { format, resolveConfig } from 'prettier'
import { parse, stringify } from 'yaml'

import { validateOpenApi } from './validate-openapi.mjs'

const METHODS = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace'])
const SCHEMA_PREFIX = '#/components/schemas/'

function aliasSchema(document, schema, kind) {
  if (!schema || typeof schema !== 'object') return
  if (typeof schema.$ref !== 'string' || !schema.$ref.startsWith(SCHEMA_PREFIX)) return

  const original = schema.$ref.slice(SCHEMA_PREFIX.length)
  if (original.endsWith(kind)) return
  const base = kind === 'Request' ? original.replace(/(?:Body)?Dto$/, '') : original
  const name = `${base}${kind}`
  const components = document.components?.schemas
  if (!components || !Object.hasOwn(components, original)) {
    throw new Error(`Missing schema ${original}`)
  }
  if (Object.hasOwn(components, name)) {
    throw new Error(`Cannot alias ${original}: schema ${name} already exists`)
  }
  components[name] = { $ref: `${SCHEMA_PREFIX}${original}` }
  schema.$ref = `${SCHEMA_PREFIX}${name}`
}

export function normalizeOpenApi(source) {
  const document = structuredClone(source)
  const tags = new Map((document.tags ?? []).map((tag) => [tag.name, tag]))
  const aliases = new Map()

  const groupLines = document.components?.schemas?.AugmentedZodDto?.oneOf?.find((variant) =>
    variant.properties?.kind?.enum?.includes('GROUP')
  )?.properties?.lines
  if (groupLines?.items && !groupLines.items.$ref) {
    const name = 'AugmentedZodDtoLinesItem'
    if (Object.hasOwn(document.components.schemas, name)) throw new Error(`Schema ${name} already exists`)
    document.components.schemas[name] = groupLines.items
    groupLines.items = { $ref: `${SCHEMA_PREFIX}${name}` }
  }

  function normalizeSchema(schema, kind) {
    if (!schema || typeof schema !== 'object') return
    if (schema.type === 'array') normalizeSchema(schema.items, kind)
    if (Array.isArray(schema.allOf)) {
      for (const part of schema.allOf) normalizeSchema(part, kind)
    }
    if (typeof schema.$ref !== 'string' || !schema.$ref.startsWith(SCHEMA_PREFIX)) return
    const key = `${kind}:${schema.$ref}`
    if (aliases.has(key)) {
      schema.$ref = aliases.get(key)
      return
    }
    aliasSchema(document, schema, kind)
    aliases.set(key, schema.$ref)
  }

  for (const pathItem of Object.values(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!METHODS.has(method)) continue
      for (const tag of operation.tags ?? []) {
        if (!tags.has(tag)) tags.set(tag, { name: tag })
      }
      for (const media of Object.values(operation.requestBody?.content ?? {})) {
        normalizeSchema(media.schema, 'Request')
      }
      for (const [status, response] of Object.entries(operation.responses ?? {})) {
        if (!/^2\d\d$/.test(status)) continue
        for (const media of Object.values(response.content ?? {})) {
          const parts = media.schema?.allOf
          if (Array.isArray(parts)) {
            const hasStringMessage = parts.some((part) => {
              const name = part.$ref?.startsWith(SCHEMA_PREFIX) ? part.$ref.slice(SCHEMA_PREFIX.length) : undefined
              return name && document.components?.schemas?.[name]?.properties?.message?.type === 'string'
            })
            if (hasStringMessage) {
              for (const part of parts) {
                const message = part.properties?.message
                if (message && !message.type && typeof message.example === 'string') message.type = 'string'
              }
            }
          }
          normalizeSchema(media.schema, 'Response')
        }
      }
    }
  }
  document.tags = [...tags.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'))

  const issues = validateOpenApi(document)
  if (issues.length) throw new Error(`Imported OpenAPI conventions failed:\n- ${issues.join('\n- ')}`)
  return document
}

export async function importOpenApi(inputPath, outputPath) {
  const source = parse(await readFile(inputPath, 'utf8'))
  const document = normalizeOpenApi(source)
  const formatting = await resolveConfig('./openapi/openapi.yaml')
  const text = await format(stringify(document, { lineWidth: 0 }), { ...formatting, filepath: outputPath })
  await writeFile(outputPath, text)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [inputPath, outputPath = './openapi/openapi.yaml'] = process.argv.slice(2)
  if (!inputPath) throw new Error('Provide the reviewed backend OpenAPI JSON or YAML path')
  await importOpenApi(inputPath, outputPath)
  console.log(`Imported OpenAPI snapshot: ${outputPath}`)
}
