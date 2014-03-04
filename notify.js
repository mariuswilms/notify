/*!
 * jQuery Notify Plugin
 *
 * Copyright (c) 2012, 2013 David Persson
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function($) {
  var queue = $({});
  var queuedTexts = [];

  var render = function(html, level, sticky, timeout, complete) {
    var m = $('<div>').attr('class', 'message');

    if (level) {
      m.addClass(level);
    }
    if (sticky) {
      m.addClass('sticky');
    }
    m.hide();

    m.html(html);
    $('#messages').append(m);
    m.show();

    if (sticky) {
      m.click(function(ev) {
        $(this).remove();
        complete();
      });

      // Do not continue and probably show next message.
      return;
    }

    // Multiply the timeout for complex messages,
    // giving comprehension time. Give 1s per 30chars over the first 25 chars.
    timeout += 1000 * (($($.parseHTML(html)).text().length - 25) / 30);

    setTimeout(function(){
      m.fadeOut('fast', function() {
        $(this).remove();
        complete(); // Show next message in queue.
      });
    }, timeout);
  };

  $.notify = function(html, level, sticky, timeout) {
    // Prevent flooding; no more than 2 pending messages. We start at
    // zero as this is called before the first item is queued.
    if (queue.queue().length >= 2) {
      return;
    }
    // Currently only one message at the time. Allowing showing multiple
    // message here will might need a more sophisticated method of managment.
    queue.queue(function(next) {
      render(html, level, sticky || false, timeout || 2100, next);
    });
  };
})(jQuery);
