export type ContextPercent = number

declare module 'claude-code' {
  interface PluginState {
    'firefly-meadow': { percent: ContextPercent }
  }
}
