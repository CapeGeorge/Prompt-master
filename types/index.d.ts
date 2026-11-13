export type PmStatus = 'idle' | 'busy' | 'done'

declare module 'claude-code' {
  interface PluginState {
    'prompt-master-button': { status: PmStatus; original: string | null }
  }
}
