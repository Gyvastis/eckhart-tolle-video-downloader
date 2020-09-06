# eckhart-tolle-video-downloader

Log in to https://www.eckharttollenow.com/ and run this script in the console to get the JSON output of the category of videos you want. Put it in the `video_ids` folder (as per example) and run `node index.js`

```
let videos2 = $('.result_tile .box').map(function (i, box) {
  let videoTitle = $(box).find('h4').text();
  let videoId = $(box).find('.link_video a').attr('id').split('vid_')[1];

  if(videoId.length !== 36) {
    return null;
  }

  return {
    "title": videoTitle,
    "id": videoId,
  };
})
console.log(JSON.stringify(Object.values(videos2)))
```
