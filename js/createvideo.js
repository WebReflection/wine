/*!
 * Copyright (C) 2013 by Andrea Giammarchi, @WebReflection
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
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