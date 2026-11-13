import { expect, test } from 'claude-code/testing'

test('/pm rewrites the draft and fills the box', async ($, on) => {
  let filled = ''
  on('command.register', () => ({ value: { command: 'pm' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('prompt.read', () => ({ value: { text: 'fix bug login pls', cursor: 0 } }))
  on('model.complete', () => ({
    value: { isAnswered: true, text: 'Fix the login bug.', usage: { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } },
  }))
  on('prompt.fill', (_, e) => { filled = e.text; return { isFilled: true } })

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const r = await $.command.run({ command: 'pm', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } })
  expect(filled).toBe('Fix the login bug.')
  expect(JSON.stringify(r)).toContain('rewritten')

  const ui = await $.ui.mount({
    plugin: 'prompt-master-button', component: 'AbovePrompt', surface: 'desktop',
    props: { hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 10, bodyColumns: 60, scroll: { offset: 0, bodyRows: 9 }, view: {} },
  })
  expect(await ui.find({ type: 'Button', key: 'undo' })).toBeTruthy()
  await ui.unmount()
})

test('a fenced reply is unwrapped before it fills the box', async ($, on) => {
  let filled = ''
  on('command.register', () => ({ value: { command: 'pm' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('prompt.read', () => ({ value: { text: 'logo idea for midjourney', cursor: 0 } }))
  on('model.complete', () => ({
    value: { isAnswered: true, text: '```\nA minimal logo, [BRAND NAME]\n```', usage: { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } },
  }))
  on('prompt.fill', (_, e) => { filled = e.text; return { isFilled: true } })

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.command.run({ command: 'pm', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } })
  expect(filled).toBe('A minimal logo, [BRAND NAME]')
})
