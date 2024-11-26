import axios from 'axios'
import * as sdk from '@botpress/sdk';
import * as bp from '.botpress';
import { ElevenLabsClient, ElevenLabs } from "elevenlabs";
import { createWriteStream } from "fs";
import { v4 as uuid } from "uuid";


export function getSimpleApiConfig(apiKey: string) {
  try {
    const client = new ElevenLabsClient({ apiKey: apiKey });
    return client;
  } catch (e) {
    throw new sdk.RuntimeError('Invalid Eleven Labs configuration');
  }
}

export const createAudioFileFromText = async (
    text: string,
    apiKey: string,
    voiceId: string,
    modelId: string = "eleven_turbo_v2_5",
    stability: number = 0.1,
    similarityBoost: number = 0.3,
    style: number = 0.2
  ): Promise<Buffer> => {
    const client = getSimpleApiConfig(apiKey);

    const audioStream = await client.generate({
      voice: voiceId,
      model_id: modelId,
      text,
      voice_settings: {
        stability: stability,
        similarity_boost: similarityBoost,
        style: style
        }
    });
  
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
  
    const content = Buffer.concat(chunks);
    return content;
};

export function createUUID(){
    const fileName = `${uuid()}.mp3`;
    return fileName;
}