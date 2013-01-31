
var
  fs = require("fs"),
  path = require("path"),
  Queue = require("./js/queue.js").Queue,
  exec = function (command, then) {
    // console.log(command);
    return require("child_process").exec(command, then);
  }
;

this.onload = function onload(req, res, p) {
  var img = p.post("img"), obj, folder;
  if (img) {
    var obj = JSON.parse(img) || {},
        id = (obj.id || "").replace(/[^a-zA-Z0-9]/g, ""),
        name = (obj.name || "").replace(/[\./]/g,""),
        type = (obj.type || "image/jpeg").replace("image/", "");
    if (obj.id = id) {
      obj.type = type;
      if (obj.name = name) return movie(req, res, p, obj);
      folder = path.join("video", id);
      fs.exists(folder, function checkDir(exists) {
        if (exists) {
          fs.writeFile(
            path.join(
              folder,
              ("000" + obj.index).slice(-3) + "." + type
            ),
            obj.data,
            "base64",
            function (err) {
              p.output.push("OK");
              p.output.flush("txt");
            }
          );
        } else {
          fs.mkdir(folder, 0777, function () {
            checkDir(true);
          });
        }
      });
    } else {
      p.output.push("what kind of joke is this? let's play!");
      p.output.flush("txt");
    }
  } else {
    p.output.push("nothing to do");
    p.output.flush("txt");
  }
};

function ffmpeg(obj, ext, then) {
  var command = [
    "ffmpeg",
    "-q:v", 1,
    "-r", obj.fps,
    "-i", path.join(
      "video",
      obj.id,
      "%03d." + obj.type
    ),
    path.join(
      "video",
      obj.id,
      obj.name + "." + ext
    ).replace(/['" ]/g, function (m) {
      return "\\" + m;
    })
  ];
  if (obj.audio) {
    command.splice(1, 0,
      "-q:a", 1,
      "-i", path.join(
        "video",
        obj.id,
        "audio.wav"
      )
    );
  }
  exec(command.join(" "), then);
}

function movie(req, res, p, obj) {
  Queue([
    function (q) {
      if (obj.audio) {
        // create audio file
        fs.writeFile(
          path.join(
            "video",
            obj.id,
            "audio.wav"
          ),
          obj.audio,
          "base64",
          q.next
        );
      } else {
        q.next();
      }
    },
    // create the mp4
    function (q) {
      ffmpeg(obj, "mp4", q.next);
    },
    // create the webm
    function (q) {
      ffmpeg(obj, "webm", q.next);
    },
    // create the ogv
    function (q) {
      ffmpeg(obj, "ogv", q.next);
    },
    // create the sequence of GIFs
    function (q) {
      exec([
        "ffmpeg",
        "-i", path.join(
          "video",
          obj.id,
          obj.name + ".mp4"
        ),
        "-t", 10,
        path.join(
          "video",
          obj.id,
          "img.%03d.gif"
        )
      ].join(" "), q.next);
    },
    // create the animated one
    function (q) {
      exec([
        "gifsicle",
        "--delay=" + Math.round(100 / obj.fps),
        "--loop",
        path.join(
          "video",
          obj.id,
          "img.*.gif"
        ),
        ">", path.join(
          "video",
          obj.id,
          obj.name + ".gif"
        )
      ].join(" "), q.next);
    },
    // remove all files but videos and animated gif
    function (q) {
      var command = [
        "rm",
        path.join(
          "video",
          obj.id,
          "*." + obj.type
        ),
        "&",
        "rm",
        path.join(
          "video",
          obj.id,
          "img.*.gif"
        )
      ];
      if (obj.audio) {
        command = command.concat(
          "&",
          "rm",
          path.join(
            "video",
            obj.id,
            "audio.wav"
          )
        );
      }
      exec(command.join(" "), q.next);
    },
    // create zip archive
    function (q) {
      exec([
        "zip",
        path.join(
          "video",
          obj.id,
          obj.name + ".zip"
        ),
        path.join(
          "video",
          obj.id,
          "*.*"
        )
      ].join(" "), q.next);
    },
    // BOOM!
    function (q) {
      p.output.push("OK");
      p.output.flush("txt");
    }
  ]);
}