### Setup
In order to have a proper test environment there are few things needed.

The very first one, open your terminal and go to your kick-ass folder where you have your nerdy stuff, done? Good!

    git clone git://github.com/WebReflection/wine.git
    cd wine
    mkdir -p video
    mkdir -p node_modules
    npm install experimental
    npm install polpetta

If you want this test to be reachable via Wi-Fi or network, you need to manual hack polpetta, as a quick way to create the host in `0.0.0.0` rather than `127.0.0.1`.

In order to do this, edit with any text editor the file `node_modules/polpetta/build/polpetta` and change the line

    HOST_NAME = process.env.IP || "127.0.0.1",
    
into the line

    HOST_NAME = process.env.IP || "0.0.0.0",

Save it, simply type `polpetta` or `node node_modules/polpetta/build/polpetta` in your terminal and check that you have something like this as output:

    http://0.0.0.0:1337/
    # (က) polpetta v0.3.4 /Users/yourname/kick-ass-folder/

Now `ctrl+c` to close *polpetta* for now, since there's much more to install for the awesome **[ffmpeg](http://ffmpeg.org)** software!

If you are using [Home Brew](http://mxcl.github.com/homebrew/) you just have to do following steps, otherwise you need to check here [how to build or other options](http://ffmpeg.org/download.html).

    brew install automake celt faac fdk-aac git lame libass libtool libvorbis libvpx \
    libvo-aacenc opencore-amr openjpeg opus sdl schroedinger shtool speex texi2html \
    theora wget x264 xvid yasm

#### ffmpeg
One call this stuff has been installed, it's time to choose what you really want to do:

  * just test this bloody thingy
  * considering to do more with **ffmpeg** later on

In the very first case, you might install just the minimum required to make this demo work:

    brew install ffmpeg --enable-libx264 --enable-libtheora --enable-libvorbis --enable-libvpx

For the second point in the previous list, you might want to install a bit more:

    brew install ffmpeg --enable-libx264 --enable-libfaac --enable-libmp3lame --enable-libxvid --enable-libfreetype --enable-libtheora --enable-libvorbis --enable-libvpx --enable-librtmp --enable-libopencore-amrnb --enable-libvo-aacenc --enable-libass --enable-ffplay --enable-libspeex --enable-libschroedinger --enable-libfdk-aac --enable-openssl --enable-libopus

Your choice :-)

    brew install ffmpeg --with-tools --with-openssl --with-openjpeg --with-libass --with-opus --with-opencore-amr --with-freetype --with-schroedinger --with-ffplay --with-rtmpdump --with-theora --with-libvorbis --with-fdk-aac --with-libvo-aacenc --with-libvpx

### gifsicle
