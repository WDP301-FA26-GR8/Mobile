import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeOpenApi } from './import-openapi.mjs'

function sourceDocument() {
  return {
    openapi: '3.0.0',
    paths: {
      '/login': {
        post: {
          tags: ['auth'],
          operationId: 'login',
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBodyDto' } } }
          },
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SessionResponseDto' },
                      { properties: { message: { example: 'AUTH.LOGGED_IN' } } }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      '/again': {
        post: {
          tags: ['auth'],
          operationId: 'loginAgain',
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBodyDto' } } }
          },
          responses: {}
        }
      }
    },
    components: {
      schemas: {
        LoginBodyDto: { type: 'object', required: ['email'], properties: { email: { type: 'string' } } },
        SessionResponseDto: {
          type: 'object',
          properties: { data: { type: 'string', nullable: true }, message: { type: 'string' } }
        }
      }
    }
  }
}

test('preserves backend schemas while adding reusable conventional aliases and tags', () => {
  const source = sourceDocument()
  const normalized = normalizeOpenApi(source)

  assert.deepEqual(normalized.tags, [{ name: 'auth' }])
  assert.deepEqual(normalized.components.schemas.LoginBodyDto, source.components.schemas.LoginBodyDto)
  assert.deepEqual(normalized.components.schemas.LoginRequest, { $ref: '#/components/schemas/LoginBodyDto' })
  assert.deepEqual(normalized.components.schemas.SessionResponseDtoResponse, {
    $ref: '#/components/schemas/SessionResponseDto'
  })
  assert.equal(
    normalized.paths['/again'].post.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/LoginRequest'
  )
  assert.equal(
    normalized.paths['/login'].post.responses[200].content['application/json'].schema.allOf[0].$ref,
    '#/components/schemas/SessionResponseDtoResponse'
  )
  assert.deepEqual(normalized.paths['/login'].post.responses[200].content['application/json'].schema.allOf[1], {
    properties: { message: { example: 'AUTH.LOGGED_IN', type: 'string' } }
  })
  assert.equal(source.tags, undefined)
  assert.equal(
    source.paths['/login'].post.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/LoginBodyDto'
  )
})

test('extracts the group item without changing the backend schema', () => {
  const source = sourceDocument()
  const item = { type: 'object', properties: { employeeId: { type: 'string', format: 'uuid' } } }
  source.components.schemas.AugmentedZodDto = {
    oneOf: [{ properties: { kind: { enum: ['GROUP'] }, lines: { type: 'array', items: item } } }]
  }
  const normalized = normalizeOpenApi(source)
  assert.deepEqual(normalized.components.schemas.AugmentedZodDtoLinesItem, item)
  assert.deepEqual(normalized.components.schemas.AugmentedZodDto.oneOf[0].properties.lines.items, {
    $ref: '#/components/schemas/AugmentedZodDtoLinesItem'
  })
  assert.deepEqual(source.components.schemas.AugmentedZodDto.oneOf[0].properties.lines.items, item)
})

test('refuses colliding aliases rather than replacing backend schemas', () => {
  const source = sourceDocument()
  source.components.schemas.LoginRequest = { type: 'string' }
  assert.throws(() => normalizeOpenApi(source), /schema LoginRequest already exists/)
})

test('refuses missing schemas and duplicate operation ids', () => {
  const missing = sourceDocument()
  delete missing.components.schemas.LoginBodyDto
  assert.throws(() => normalizeOpenApi(missing), /Missing schema LoginBodyDto/)
  const duplicate = sourceDocument()
  duplicate.paths['/again'].post.operationId = 'login'
  assert.throws(() => normalizeOpenApi(duplicate), /duplicates operationId/)
})
