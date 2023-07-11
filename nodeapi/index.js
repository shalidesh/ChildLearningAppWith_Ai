const express = require('express');
const { use } = require('express/lib/application');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const speech = require('@google-cloud/speech');
const ffmpeg = require('fluent-ffmpeg');
const bodyParser = require('body-parser');

// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// Import other required libraries
const util = require('util');


const app = express();
app.use(express.text());
app.use(bodyParser.json());

const port = 3001;

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Creates a client
const client1 = new textToSpeech.TextToSpeechClient();


process.env.GOOGLE_APPLICATION_CREDENTIALS = './speech-recognition-390414-e8fd6889c68a.json';

app.get('/data', async (req, res) => {

    try {
        const userId = req.query.userId;
        console.log(userId);
        await client.connect();
        const db = client.db('studentApp');
        const usersCollection = db.collection('users');
        const gamesCollection = db.collection('games');
        const scoresCollection = db.collection('scores');
    
        // Step 1: Find the user document
        const user = await usersCollection.findOne({ _id:userId });
        if (!user) {
            throw new Error('User not found');
        }
    
        // Step 2: Find all scores for that user
        const scores = await scoresCollection.find({ userId: user._id }).toArray();
    
        // Step 3: Find the game name for each score
        const result = await Promise.all(
            scores.map(async (score) => {
            const game = await gamesCollection.findOne({ _id: score.gameId });
            return {
                gameName: game.name,
                score: score.score,
            };
            })
        );
    
        // Step 4: Return the result
        // return result;
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      } finally {
        await client.close();
      }
  
});

async function main(data){

    // Creates a client
    const client = new speech.SpeechClient();

    const encoding = 'LINEAR16';
    const sampleRateHertz = 16000;
    const languageCode = 'en-US';

    const config = {
      encoding: encoding,
      languageCode: languageCode,
    };


    const audio = {
      content: data,
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
    return transcription;
}


app.post('/audio', async (req, res) => {
  // get the base64 encoded audio data from the request body
  const base64Audio = req.body;
  // save the audio data as a .wav file
  const buffer = Buffer.from(base64Audio, 'base64');
  fs.writeFileSync('./audio.wav', buffer);


  ffmpeg('audio.wav')
    .output('output.wav')
    .on('end', async() => {

      try{
          console.log('Conversion complete');

              // Creates a client
          const client = new speech.SpeechClient();

          const filename = './output.wav';
          const encoding = 'LINEAR16';
          const sampleRateHertz = 16000;
          const languageCode = 'en-US';

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

          // res.send(transcription);
          res.status(200).json({ message: transcription});
      }
      catch(error){

        res.status(500).json({ error: error.message });

      }


    })
    .run();
  
});


app.post('/savescore', async (req, res) => {

  console.log("Data Recieved");
  // get the base64 encoded audio data from the request body
  const gameId = req.body['gameId'];
  const userId = req.body['userId'];
  const score = req.body['score'];
  

  try {

    await client.connect();
    const db = client.db('studentApp');
    const scoresCollection = db.collection('scores');

    if (score>0){

      await scoresCollection.updateOne(
        { userId: userId, gameId: gameId },
        { $inc: { "score.positive": score, "score.negative": 0 } }
      );

    }else{
        // Update the score value for the specific user and game
        await scoresCollection.updateOne(
          { userId: userId, gameId: gameId },
          { $inc: { "score.positive": 0, "score.negative": Math.abs(score) } }
        );
     }

    
    res.json({"result":score});
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
  
  
});


async function quickStart(image) {
  // The text to synthesize
  const text = image;

  // Construct the request
  const request = {
    input: {text: text},
    // Select the language and SSML voice gender (optional)
    voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
    // select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3'},
  };

  // Performs the text-to-speech request
  const [response] = await client1.synthesizeSpeech(request);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile('output.mp3', response.audioContent, 'binary');
  console.log('Audio content written to file: output.mp3');
}


app.post('/savescore-game2', async (req, res) => {

  console.log("Data Recieved");
  // get the base64 encoded audio data from the request body
  const gameId = req.body['gameId'];
  const userId = req.body['userId'];
  const score = req.body['score'];
  const image=req.body['imageName'];

  quickStart(image);


  try {

    await client.connect();
    const db = client.db('studentApp');
    const scoresCollection = db.collection('scores');

    if (score>0){

      await scoresCollection.updateOne(
        { userId: userId, gameId: gameId },
        { $inc: { "score.positive": score, "score.negative": 0 } }
      );

    }else{
        // Update the score value for the specific user and game
        await scoresCollection.updateOne(
          { userId: userId, gameId: gameId },
          { $inc: { "score.positive": 0, "score.negative": Math.abs(score) } }
        );
     }

    
    res.json({"result":score});
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
  
  
});


app.get('/play-audio', function(req, res) {
  const filePath = 'output.mp3';
  const stat = fs.statSync(filePath);
  res.set('Content-Type', 'audio/mpeg');
  res.set('Content-Length', stat.size);
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});


app.listen(3001, '192.168.8.196', () => {
  console.log('Server listening on http://192.168.8.196:3001');
});


