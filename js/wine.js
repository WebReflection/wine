// needed features
experimental(navigator, "getUserMedia", 1);
experimental(window,    "URL",          1);
experimental(window,    "AudioContext", 1);
experimental(window,    "Float32Array", 1);
experimental(window,    "Blob",         1);
experimental(window,    "FileReader",   1);
experimental(window,    "Worker",       1);

this.onload = function () {

  var
    seconds = 3,
    fps = 15,
    quality = 95,
    video = document.querySelector("video"),
    progress = document.querySelector("progress"),
    canvas = document.createElement("canvas"),
    context = canvas.getContext("2d"),
    listOfFrames = [],
    leftChannel = [],
    rightChannel = [],
    recording = 0,
    videoOnly = false,
    DELAY = 1000 / fps,
    stream,
    sampleRate,
    acontext, microphone, audioout, fr, worker
    ,recorder = {record:Object, stop:Object}
  ;

  quality = 100 / quality;
  progress.max = fps * seconds;

  function attachStream(media, stream) {
    try {
      // Canary likes like this
      media.src = window.URL.createObjectURL(stream);
    } catch(_) {
      // FF and Opera prefer this
      // I actually prefer this too
      media.src = stream;
    }
    try {
      // FF prefers this
      // I think it should not be needed if the video is autoplay
      // ... never mind
      media.play();
    } catch(_) {}
  }

  function generateUniqueClientId() {
    return (
      navigator.userAgent + (
        Date.now() * Math.random()
      )
    ).replace(/[^a-zA-Z0-9]/g, "");
  }

  function ontouchend(e) {
    preventDefault(e);
    clearInterval(recording);
    recording = 0;
    recorder.stop();
    video.className = "";
  }

  function preventDefault(e) {
    e && e.preventDefault();
  }

  function sendImages(ondone, progress, listOfFrames, fps, audioString) {
    function onload() {
      i -= 1;
      progress.value = listOfFrames.length - i;
      if (!i) {
        xhr = new XMLHttpRequest;
        xhr.open("post", "create.njs");
        xhr.onload = function () {
          var
            canvas = document.querySelector("canvas"),
            parentNode = canvas.parentNode,
            a = parentNode.appendChild(
              document.createElement("a")
            )
          ;
          a.appendChild(
            document.createTextNode("download movie.zip")
          );
          a.href = id + "/movie.zip";
          a = parentNode.appendChild(
            document.createElement("a")
          );
          a.appendChild(
            document.createTextNode("static preview")
          );
          a.href = "preview.html/?movie=" + id + "/movie.zip";
          a = parentNode.appendChild(
            document.createElement("a")
          );
          a.appendChild(
            document.createTextNode("try video here")
          );
          a.onclick = function () {
            this.parentNode.removeChild(this);
            ondone();
            createVideo(
              canvas,
              "/video/" + id + "/movie.mp4",
              {
                autoplay: true,
                loop: true,
                preload: "auto"
              }
            ).className = "blue";
            return false;
          };
          a.href = "#gotcha";
        };
        data = new FormData();
        data.append("img", JSON.stringify({
          id: id,
          name: "movie",
          fps: fps,
          length: length,
          type: imageType,
          audio: audioString.split(",")[1]
        }));
        xhr.send(data);
      }
    }
    progress.max = listOfFrames.length;
    for (var
      imageType,
      base64,
      id = generateUniqueClientId(),
      i = 0, length = listOfFrames.length,
      xhr, data;
      i < length; i++
    ) {
      base64 = listOfFrames[i].split(",");
      xhr = new XMLHttpRequest;
      xhr.open("post", "create.njs");
      xhr.onload = onload;
      data = new FormData();
      data.append("img", JSON.stringify({
        length: length,
        index: i,
        type: imageType || (
          imageType = base64[0].replace(/^data:([^;]+?);.*$/, "$1")
        ),
        id: id,
        data: base64[1]
      }));
      xhr.send(data);
    }
  }

  function snapshot() {
    // faster than recycling same canvas
    // since that forces toDataURL call per each image
    var canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),
        images = [],
        interval;
    function drawImage(img) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    }
    function onImageLoad() {
      drawImage(this);
      setTimeout(checkAllImages, 1);
    }
    function clear() {
      clearInterval(interval);
    }
    function checkAllImages() {
      for (var img, i = 0; i < listOfFrames.length; i++) {
        if (typeof listOfFrames[i] != "string") {
          images.push(img = new Image);
          img.onload = onImageLoad;
          img.src = listOfFrames[i] = listOfFrames[i].toDataURL("image/jpeg", quality);
          progress.value = i;
          return;
        }
      };
      progress.value = i;
      interval = playBack(0);
      setTimeout(everythingElse, DELAY);
    }
    function playBack(i) {
      return setInterval(function () {
        drawImage(images[i++]);
        if (i === images.length) {
          i = 0;
        }
      }, DELAY);
    }
    canvas.width = video.offsetWidth - 16;
    canvas.height = video.offsetHeight - 16;
    // copy resampled
    context.drawImage(
      video,
      0, 0,
      video.videoWidth,
      video.videoHeight,
      0, 0,
      canvas.width,
      canvas.height
    );
    if (progress.max === (
      progress.value = listOfFrames.push(
        canvas
      )
    )) {
      ontouchend();
      video.pause();
      microphone && microphone.disconnect();
      audioout && audioout.disconnect();
      stream && "stop" in stream && stream.stop();

      progress.value = 0;
      
      video.parentNode.replaceChild(
        canvas, video
      );

      checkAllImages();

      function everythingElse() {
        if (videoOnly) {
          sendImages(clear, progress, listOfFrames, fps, "");
        } else {
          recorder.exportWAV(function(s) {
            fr = new FileReader;
            fr.onload = function (e) {
              sendImages(clear, progress, listOfFrames, fps, e.target.result);
            };
            fr.readAsDataURL(s);
          });
        }
      }
    }
  }

  // main
  (function askAuthorization() {
    navigator.getUserMedia({video: true, audio: true}, function ($stream) {
      stream = $stream;
      progress.style.opacity = 1;
      video.onmousedown = video.ontouchstart = function (e) {
        preventDefault(e);
        clearInterval(recording);
        recording = setInterval(snapshot, Math.ceil(DELAY));
        recorder.record();
        video.className = "blue";
      };
      video.onmouseup = video.ontouchend = ontouchend;
      attachStream(video, stream);
      try {
        acontext = new AudioContext();
        microphone = acontext.createMediaStreamSource(stream);
        recorder = new Recorder(microphone);
      } catch(_) {
        videoOnly = true;
      }
    }, function (e) {
      video.onclick = askAuthorization;
    });
  }());
};