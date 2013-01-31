// http://webreflection.blogspot.de/2012/03/tweet-sized-queue-system.html
var
  define = define || Object,
  exports = this.exports || this
;
define(
  exports.Queue = function Queue(a,b){setTimeout(a.next=function(){return(b=a.shift())?!!b(a)||!0:!1},0);return a}
);