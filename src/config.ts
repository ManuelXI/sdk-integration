const host =
  import.meta.env.VITE_MONTEROSA_HOST ?? 'cdn-dev.monterosa.cloud'
const projectId =
  import.meta.env.VITE_MONTEROSA_PROJECT_ID ??
  '573e9e0d-a760-4e93-864e-6e2cee618d01'

export const monterosaConfig = {
  host,
  projectId,
} as const

export const eventIds = {
  seriesPredictor: 'f4de22b8-e4df-4fab-b0d9-6f9733876709',
  simpleEmbed: 'f746ca56-c9ee-40d4-8a84-ec238df18108',
  interactiveEmbed: '6b5444f7-ac50-48b8-b4ea-3803965bf2b4',
  authenticatedEmbed: 'c0d8854c-7a95-42ab-9167-baf3fc90c596',
} as const
