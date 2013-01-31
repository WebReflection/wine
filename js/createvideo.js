function createVideo(node, src, options) {
  var
    ext = /\.[a-zA-Z0-9]+$/,
    i = 0,
    type = ["webm", "ogv", "mp4"],
    video = document.createElement("video"),
    parentNode = node.parentNode,
    fallback = new Image,
    source, key
  ;
  for(key in options) {
    options.hasOwnProperty(key) && (video[key] = options[key] || key);
  }
  while (i < type.length) {
    source = video.appendChild(
      document.createElement("source")
    );
    source.type = "video/" + type[i];
    source.src = src.replace(ext, "." + type[i]);
    ++i;
  }
  video.appendChild(fallback).onerror = createVideo.onerror;
  fallback.src = src.replace(ext, ".gif");
  parentNode.replaceChild(video, node);
  return video;
}

createVideo.onerror = function() {
  this.parentNode.replaceChild(
    document.createTextNode(
      "your browser does not support <video> tag"
    ),
    this
  );
}