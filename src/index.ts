import * as sdk from '@botpress/sdk'
import * as bp from '.botpress'
import axios from 'axios'
import crypto from 'crypto'

import { ElevenLabsClient, ElevenLabs } from "elevenlabs";
import { ReadableStream } from 'web-streams-polyfill';

import { getSimpleApiConfig, createAudioFileFromText , createUUID} from './client'


export default new bp.Integration({
  register: async (args) => {
    const apiKey = args.ctx.configuration.apiKey
    const client = getSimpleApiConfig(apiKey)
  },
  unregister: async () => {},
  actions: {
    textToSpeech: async (args) => {
      const apiKey = args.ctx.configuration.apiKey

      const text = args.input.text
      const modelId = args.input.modelId
      const voiceId = args.input.voiceId
      const stability = (args.input?.stability ?? 1) / 100
      const similarityBoost = (args.input?.similarityBoost ?? 1) / 100
      const style = (args.input?.style ?? 0) / 100

      try {
        const speech = await createAudioFileFromText(text, apiKey, voiceId, modelId, stability, similarityBoost, style)
        // const name = createUUID()
        args.logger.forBot().info('Text to speech conversion successful', speech)
        const fileUrl = await uploadFile(text, speech, args.client)
        args.logger.forBot().info(fileUrl)
        // args.logger.forBot().info('Text to speech conversion successful', file)
        return {output: fileUrl}

      }
      catch(e:any){
        args.logger.forBot().error('Error during text to speech conversion', e)
        throw new sdk.RuntimeError('Error during text to speech conversion', e)
      }
    },
    getVoices: async (args) => {

      const apiKey = args.ctx.configuration.apiKey
      const client = getSimpleApiConfig(apiKey)

      try {
        const result = await client.voices.getAll()
        args.logger.forBot().info('Voices retrieved', result.voices)
        return {voices : result.voices}
      }
      catch(e:any){
        args.logger.forBot().error('Error during get voices', e)
        throw new sdk.RuntimeError('Error during get voices', e)
      }
    },
    getGeneratedItems: async (args) => {

      const apiKey = args.ctx.configuration.apiKey

      const pageSize = args.input.pageSize
      const startAfterHistoryItemsId = args.input.startAfterHistoryItemsId
      const voiceId = args.input.voiceId

      const client = getSimpleApiConfig(apiKey)

      try {
        const result = await client.history.getAll({
          page_size: pageSize,
          start_after_history_item_id: startAfterHistoryItemsId,
          voice_id: voiceId
        });

        args.logger.forBot().info('Generated items retrieved', result)
        return {items: result}
      }
      catch(e:any){
        args.logger.forBot().error('Error during get generated items', e)
        throw new sdk.RuntimeError('Error during get generated items', e)
      }
    },
    getAudioFromHistoryItem: async (args) => {
      const apiKey = args.ctx.configuration.apiKey

      const historyItemId = args.input.historyItemId

      try {
        const audio = await fetchAudio(historyItemId, apiKey)
        
        const name = createUUID()
          
        const file = await args.client.uploadFile({
          key: name,
          content: audio,
        })

        args.logger.forBot().info('Audio retrieved', audio)
        args.logger.forBot().info('Audio uploaded', file)
        return {file: file}
      }
      catch(e:any){
        args.logger.forBot().error('Error during get audio from history item', e)
        throw new sdk.RuntimeError('Error during get audio from history item', e)
      }
    }
  },
  channels: {},
  handler: async () => {},
})


async function fetchAudio(historyItemId: string, apiKey: string) {
  try {
    // Make the GET request to fetch the audio
    const response = await axios.get(`https://api.elevenlabs.io/v1/history/${historyItemId}/audio`, {
      headers: { 'xi-api-key': apiKey },
      responseType: 'arraybuffer'  // Important to get the response as a binary buffer
    });

    // Convert the response to a Buffer
    const audioBuffer = Buffer.from(response.data);

    return audioBuffer;
  } catch (error: any) {
    throw new sdk.RuntimeError('Error fetching audio', error);
  }
}

function generateFileKey(prefix: string, input: object, suffix?: string) {
  const json = JSON.stringify(input)
  const hash = crypto.createHash('sha1')

  hash.update(json)
  const hexHash = hash.digest('hex')

  return prefix + Date.now() + '_' + hexHash + suffix
}

async function uploadFile(input:any, buffer:any, client:any){
      const expiresAt: string = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

      // File storage is billed to the workspace of the bot that called this action.
      const { file } = await client.uploadFile({
        key: generateFileKey('elevenlabs-', input, '.mp3'),
        content: buffer,
        contentType: 'audio/mpeg',
        accessPolicies: ['public_content'],
        tags: {
          source: 'integration',
          action: 'generateaudio',
        },
        expiresAt,
        publicContentImmediatelyAccessible: true,
      })

      return file.url
}