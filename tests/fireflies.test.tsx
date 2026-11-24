import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'firefly-meadow',
  component: 'Backdrop',
  props: { scene: 'firefly-meadow', plugin: 'firefly-meadow', glass: false },
} as const

const countAt = async ($: any, percent: number) => {
  await $.session.measure({ context: { window: 200000, percent }, rateLimits: [], changed: ['context'] })
  const ui = await $.ui.mount({ ...BACKDROP, surface: 'mobile' })
  const svg = await ui.find({ type: 'Svg' })
  await ui.unmount()
  const source = String(svg?.props?.source ?? '')
  expect(source.length).toBeLessThan(131072)
  return (source.match(/fill="#fff3b0"/g) ?? []).length
}

test('more fireflies as the context window fills', async ($, on) => {
  on('session.measure', () => ({ changed: ['context'] }))
  const few = await countAt($, 0)
  const many = await countAt($, 90)
  expect(few).toBe(6)
  expect(many).toBe(55)
})

test("another mod's backdrop is left alone", async ($, on) => {
  on('ui.render', ($: any, e: any) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  const ui = await $.ui.mount({ ...BACKDROP, surface: 'desktop', plugin: 'firefly-meadow', props: { ...BACKDROP.props, plugin: 'someone-else' } })
  expect((await ui.find({ type: 'Text' }))?.text).toBe('engine')
  await ui.unmount()
})
