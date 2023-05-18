// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const fs = require('fs');


process.env.GOOGLE_APPLICATION_CREDENTIALS = './wise-key-386709-fad3d40a9902.json';


async function main(){

  // Creates a client
const client = new speech.SpeechClient();

const filename = './hello1.wav';
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

encodedata=fs.readFileSync(filename).toString('base64')
console.log(encodedata);

const config = {
  encoding: encoding,
  languageCode: languageCode,
};


const audio = {
  content: fs.readFileSync(filename).toString('base64'),
};

const request = {
  config: config,
  audio: audio,
};

// Detects speech in the audio file. This creates a recognition job that you
// can wait for now, or get its result later.
const [operation] = await client.longRunningRecognize(request);

// Get a Promise representation of the final result of the job
const [response] = await operation.promise();
const transcription = response.results
  .map(result => result.alternatives[0].transcript)
  .join('\n');
console.log(`Transcription: ${transcription}`);
}
main().catch(console.error)