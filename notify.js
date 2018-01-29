/*!
 * jQuery Notify Plugin
 *
 * Copyright (c) 2012 David Persson
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function($) {

  // Global configuration.
  var config = {
    // The class name/s of the message container.
    containerClass: 'messages',

    // The class name/s of a message. An "invisible" class will be removed then re-added
    // when rendering the message.
    elementClass: 'message',

    // Number of maximum pending messages, all other messages
    // will be discarded to prevent flooding.
    maxPending: 2,

    // Base timeout until a message will be removed after it's shown.
    timeout: 1100,

    // Show function used when a message should appear; must return a
    // promise which should be resolved when i.e. the show animation
    // finished.
    show: function($m, $c) {
      var dfr = new $.Deferred();

      if ($m.css('transition-duration') !== '0s') {
        $m.one('transitionend', dfr.resolve);
      } else if ($c.css('transition-duration') !== '0s') {
        $c.one('transitionend', dfr.resolve);
      } else {
        dfr.resolve();
      }
      $m.removeClass('invisible');

      return dfr.promise();
    },

    // Hide function used when a message should disappear; must return
    // a promise which should be resolved when i.e. the hide animation
    // finished.
    hide: function($m, $c) {
      var dfr = new $.Deferred();

      if ($m.css('transition-duration') !== '0s') {
        $m.one('transitionend', dfr.resolve);
      } else if ($c.css('transition-duration') !== '0s') {
        $c.one('transitionend', dfr.resolve);
      } else {
        dfr.resolve();
      }
      $m.addClass('invisible');

      return dfr.promise();
    }
  };

  // Our own personal queue.
  var queue = $({});

  // Renders a message and calls complete callback after doing that.
  var render = function(html, options, complete) {
    var $c = $('#notify');

    if (!$c.length) {
      $c = $('<div id="notify" />');
      $c.addClass(config.containerClass);
      $('body').append($c);
    }

    var $m = $('<div />');
    $m.addClass(config.elementClass);
    $m.addClass('invisible');
    $m.html(html);

    if (options.level) {
      $m.addClass(options.level);
    }
    if (options.sticky) {
      $m.addClass('sticky');
    }
    $c.append($m);

    $m.click(function(ev) {
      config.hide($m, $c).done(function() {
        $m.remove();
        complete();
      });
    });

    if (options.sticky) {
      return; // Do not continue and probably show next message.
    }

    // Multiply the timeout for complex messages, giving comprehension time.
    // Give 1s per 30 chars over the first 25 chars.
    var timeout = options.timeout;
    timeout += Math.max(0, 1000 * (($($.parseHTML(html)).text().length - 25) / 30));

    // Workaround to enable CSS transitions on dynamically inserted elements.
    // Reading random property to force recalculating styles.
    $m.css('top');

    config.show($m, $c).done(function() {
      setTimeout(function() {
        config.hide($m, $c).done(function() {
          $m.remove();
          complete(); // Show next message in queue.
        });
      }, timeout);
    });
  };

  // Main plugin function. Allows for adding a notification and
  // configuring the plugin globally.
  $.notify = function(html, options) {
    // Allow setting global configuration for this plugin.
    if (typeof html === 'object') {
      config = $.extend(config, html);
      return;
    }
    options = $.extend({
      level: null,
      sticky: false,
      timeout: config.timeout
    }, options || {});

    // Prevent flooding; no more than 2 pending messages. We start at
    // zero as this is called before the first item is queued.
    if (queue.queue().length >= config.maxPending) {
      return;
    }
    // Currently only one message at the time. Allowing showing multiple
    // message here will might need a more sophisticated method of managment.
    queue.queue(function(next) {
      render(html, options, next);
    });
  };

})(jQuery);
