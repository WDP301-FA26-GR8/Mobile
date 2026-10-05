const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const test = require('node:test')

const resolveMetroImageSize = String.raw`
  const path = require('node:path')
  const expoEntry = require.resolve('expo/package.json')
  const expoMetroEntry = require.resolve('@expo/metro/package.json', {
    paths: [path.dirname(expoEntry)],
  })
  const metroEntry = require.resolve('metro/package.json', {
    paths: [path.dirname(expoMetroEntry)],
  })
  const imageSizeEntry = require.resolve('image-size', {
    paths: [path.dirname(metroEntry)],
  })
  const { imageSize } = require(imageSizeEntry)
`

const icnsProbe = String.raw`
  ${resolveMetroImageSize}
  const input = Buffer.alloc(16)
  input.write('icns', 0, 'ascii')
  input.writeUInt32BE(16, 4)
  input.write('ic07', 8, 'ascii')
  input.writeUInt32BE(0, 12)

  try {
    imageSize(input)
  } catch (error) {
    if (!(error instanceof TypeError)) throw error
  }
`

const isoBoxProbe = String.raw`
  ${resolveMetroImageSize}
  const input = Buffer.alloc(16)
  input.writeUInt32BE(0, 0)
  input.write('ftyp', 4, 'ascii')
  input.write('avif', 8, 'ascii')

  try {
    imageSize(input)
  } catch (error) {
    if (!(error instanceof TypeError)) throw error
  }
`

function assertProbeTerminates(probe) {
  execFileSync(process.execPath, ['-e', probe], {
    stdio: 'pipe',
    timeout: 1_000
  })
}

test('Metro image parser rejects an ICNS entry that cannot advance', () => {
  assert.doesNotThrow(() => assertProbeTerminates(icnsProbe))
})

test('Metro image parser rejects an ISO box that cannot advance', () => {
  assert.doesNotThrow(() => assertProbeTerminates(isoBoxProbe))
})
