export type PmStatus = 'idle' | 'busy' | 'done'

declare module 'claude-code' {
  interface PluginState {
    'prompt-master': { status: PmStatus; original: string | null }
  }
}
