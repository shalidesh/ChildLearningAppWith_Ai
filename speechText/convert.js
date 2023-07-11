const ffmpeg = require('fluent-ffmpeg');

ffmpeg('audio.wav')
  .output('output.wav')
  .on('end', () => {
    console.log('Conversion complete');
  })
  .run();