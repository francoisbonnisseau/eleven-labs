import { IntegrationDefinition, z } from '@botpress/sdk'
import { integrationName, name } from './package.json'


export default new IntegrationDefinition({
  name: integrationName ?? name,
  version: '1.0.0',
  readme: 'hub.md',
  icon: 'icon.svg',
  title: 'Eleven Labs',
  description: 'Eleven Labs integration',
  configuration: {
    schema: z.object({
      apiKey: z.string().describe('ElevenLabs API Key'),
    }),
  },
  channels: {},
  actions: {
    textToSpeech:{
      title: 'Text to Speech',
      description : 'Convert text to speech',
      input: {
        schema: z.object({
          text: z.string().describe('Text to convert to speech'),
          voiceId: z.string().describe('Voice to use for conversion'),
          modelId: z.string().optional().default('eleven_turbo_v2_5').describe('Model ID'),
          stability: z.number().optional().default(100).describe('Stability parameter, in percentage'),
          similarityBoost: z.number().optional().default(100).describe('Similarity Boost, in percentage'),
          style: z.number().optional().describe('Style, in percentage')
        }),
      },
      output: {
        schema: z.object({
          output: z.record(z.unknown()),
        }),
      },
    },
    getVoices:{
      title: 'Get Voices',
      description : 'Gets a list of all available voices for a user',
      input: {
        schema: z.object({
        }),
      },
      output: {
        schema: z.object({
          voices: z.array(z.record(z.unknown())),
        }),
      },
    },
    getGeneratedItems:{
      title: 'Get Generated Items',
      description : 'Get a list of generated items',
      input: {
        schema: z.object({
          pageSize: z.number().optional().default(100).describe('How many history items to return at maximum. Can not exceed 1000, defaults to 100.'),
          startAfterHistoryItemsId: z.string().optional().describe('After which ID to start fetching, use this parameter to paginate across a large collection of history items. In case this parameter is not provided history items will be fetched starting from the most recently created one ordered descending by their creation date.'),
          voiceId: z.string().optional().describe('Voice ID to be filtered for'),
        }),
      },
      output: {
        schema: z.object({
          items: z.record(z.unknown()),
        }),
      },
    },
    getAudioFromHistoryItem:{
      title: 'Get Audio From History Item',
      description : 'Get audio from an item - ItemId is required',
      input: {
        schema: z.object({
          historyItemId: z.string().describe('History item ID'),
        }),
      },
      output: {
        schema: z.object({
          file: z.record(z.unknown()),
        }),
      },
    },
  },
})
