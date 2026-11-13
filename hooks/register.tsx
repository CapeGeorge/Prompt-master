import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { PmStatus } from '../types'

const status = atom({ plugin: 'prompt-master', key: 'status' } as const, 'idle' as PmStatus)
const original = atom({ plugin: 'prompt-master', key: 'original' } as const, null as string | null)

const SYSTEM = `You rewrite a user's rough prompt for an AI assistant into a better prompt.
Rules:
- Keep the user's intent, facts, names, file paths and code exactly. Never invent requirements.
- State the goal first, then context, constraints, and the expected output format.
- Fix spelling and grammar. Remove filler. Keep it as short as clarity allows.
- If the rough prompt is missing a key detail, add a short line "Ask me if unclear: <the detail>".
- Write in the user's voice (first person, addressed to the assistant).
- Output ONLY the rewritten prompt. No preamble, no quotes, no explanation.`

async function rewrite($: EngineInterface, rough: string): Promise<string | null> {
  const r = await $.model.complete({
    model: 'sonnet',
    system: SYSTEM,
    prompt: `Rough prompt:\n<<<\n${rough}\n>>>`,
    maxTokens: 2000,
  })
  if (!r.isAnswered) return null
  const text = r.text.trim()
  return text.length ? text : null
}

async function run($: EngineInterface, given?: string): Promise<string> {
  if ((await read($, status)) === 'busy') return 'Prompt Master is already running.'
  const rough = (given ?? (await $.prompt.read()).text).trim()
  if (!rough) {
    $.ui.toast('Type a rough prompt first.')
    return 'Nothing to rewrite. Type a rough prompt first.'
  }
  await update($, status, () => 'busy' as PmStatus)
  $.ui.status('Prompt Master: rewriting...')
  try {
    const better = await rewrite($, rough)
    if (!better) {
      $.ui.toast('Prompt Master could not rewrite that. Your text is unchanged.')
      await update($, status, () => 'idle' as PmStatus)
      return 'Rewrite failed. Your prompt is unchanged.'
    }
    await update($, original, () => rough)
    await $.prompt.fill({ text: better, mode: 'replace' })
    await update($, status, () => 'done' as PmStatus)
    $.ui.toast('Prompt rewritten. Review it, then press Enter.')
    return 'Prompt rewritten in the box. Review it, then send.'
  } finally {
    $.ui.status(undefined)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'pm',
      description: 'Prompt Master: rewrite the draft (or the text after /pm) into a better prompt',
    })
    return next(e)
  })

  on('command.run', { command: 'pm' }, async ($, e) => {
    const text = await run($, e.args.trim() || undefined)
    return { text }
  })

  // Clear the Undo once a prompt is sent.
  on('prompt.submit', async ($, e, next) => {
    await update($, status, () => 'idle' as PmStatus)
    await update($, original, () => null)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || e.props.isWorking) return next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    const s = await read($, status)
    const prev = await read($, original)

    return (
      <Box>
        <Button
          key="pm"
          label={s === 'busy' ? 'Prompt Master: rewriting...' : 'Prompt Master'}
          onPress={() => void run($)}
        />
        {s === 'done' && prev !== null && (
          <Button
            key="undo"
            label="Undo"
            onPress={async () => {
              await $.prompt.fill({ text: prev, mode: 'replace' })
              await update($, original, () => null)
              await update($, status, () => 'idle' as PmStatus)
            }}
          />
        )}
        {s === 'idle' && <Text dimColor> rewrites your draft before you send</Text>}
      </Box>
    )
  })
}
