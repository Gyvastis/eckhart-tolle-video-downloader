const _ = require('lodash');
const Promise = require('bluebird');
const fs = require('fs');
const youtubedl = require('youtube-dl');
const fetch = require('node-fetch');

const concurrentDownloads = 3;
const readFile = Promise.promisify(fs.readFile);
const readDir = Promise.promisify(fs.readdir);

const readVideoIdsFileNames = () => readDir('./video_ids')
  .then(files => files.map(fileName => fileName.split('.')[0]));
const readVideoIdsFromJson = (fileName) => readFile(`./video_ids/${fileName}.json`)
  .then(text => JSON.parse(text));

const downloadVideo = (title, id) => new Promise((resolve, reject) => {
  // const downloadFolder = `./downloads/${category}/`;
  const downloadFolder = `/Volumes/iSafe/Eckhart Tolle/`;
  const fileName = `${downloadFolder}${_.snakeCase(title)}.mp4`;

  if (fs.existsSync(fileName)){
    console.log(`Already exists '${title}' (${fileName})!`)
    resolve();
    return;
  }
  const url = fetchVideoDownloadUrl(id);

  const downloaded = fs.existsSync(fileName) ? fs.statSync(fileName).size : 0;

  const video = youtubedl(url, [], {
    start: downloaded,
    cwd: __dirname
  });

  video.on('info', function(info) {
    console.log(`Downloading '${title}' (${fileName})...`)
  });
  video.on('end', function() {
    console.log(`Downloaded '${title}' (${fileName})!`)
    resolve();
  });
  video.on('error', (error) => {
    console.log(`Download failed '${title}' (${fileName})! ` + error.message);
    resolve();
  });

  video.pipe(fs.createWriteStream(fileName))
});

const fetchVideoDownloadUrl = videoId => {
  const cmd = `curl -s 'https://www.eckharttollenow.com/v4/member/watch/default.aspx?a=video&vid=${videoId}' -H 'Cookie: ettv_1149182683_term=1; ettv_1149182683_media=TRUE; member_login_id_testapril2011=17821fd4-18a1-423f-aa94-72aa87c6ee4a; ASP.NET_SessionId_ETTV=ul013lfsexnomivj22zkb5yj;'`;
  const resultJson = require('child_process').execSync(cmd).toString('UTF8');
  return JSON.parse(resultJson).data.Mp4_url;
}

(async () => {
  const videoIdsFileNames = await readVideoIdsFileNames();
  await Promise.map(videoIdsFileNames, async category => {
    console.log(`> Category ${category}`)
    // const videoIdsFileName = 'Ego';
    const videoIds = await readVideoIdsFromJson(category);

    await Promise.map(videoIds, ({ title, id }) => {
      return downloadVideo(title, id);
    }, {
      concurrency: concurrentDownloads,
    });
  }, {
    concurrency: 1,
  });
})();
