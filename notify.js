/*!
 * jQuery Notify Plugin
 *
 * Copyright (c) 2012 David Persson
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function($) {
  var queue = $({});
  var queuedTexts = [];

  var render = function(text, level, complete) {
    var m = $('<div>').attr('class', 'message');

    m.hide();

    if (level) {
      m.addClass(level);
    }
    m.text(text);
    $('#messages').append(m);
    m.show();

    var timeout = 2100;
    if (text.length >= 25) {
      /* Double the timeout for complex messages, giving comprehension time. */
      timeout = timeout * 2;
    }

    setTimeout(function(){
      m.fadeOut('fast', function() {
        $(this).remove();
        complete(); /* Show next message in queue. */
      });
    }, timeout);
  };

  $.notify = function(text, level) {
    /* Prevent flooding; no more than 2 pending messages. We start at zero as
       this is called before the first item is queued. */
    if (queue.queue().length >= 2) {
      return;
    }
    /* Currently only one message at the time. Allowing showing multiple
      message here will might need a more sophisticated method of managment. */
    queue.queue(function(next) {
      render(text, level, next);
    });
  };
})(jQuery);
