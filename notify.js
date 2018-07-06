/*!
 * Notify
 *
 * Copyright (c) 2012 Marius Wilms
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

define('notify', [], function() {
  return class Notify {
    // Usually container will be a reference to the body element.
    constructor(container) {
      this.queue = new Promise((resolve, reject) => {
        resolve();
      });

      let n = document.createElement('div');
      n.classList.add('notify');

      let ms = document.createElement('div');
      ms.classList.add('notify__messages');

      n.appendChild(ms);
      container.appendChild(n)

      // The messages element becomes the container for all future messages.
      this.container = ms;
    }

    // Main entry method.
    queueMessage(html, options = {}) {
      // Base timeout until a message will be removed after it's shown.
      let timeout = options.timeout || 1100;
      let level = options.level || null;
      let sticky = options.sticky || false;

      let m = this.renderMessage(html, sticky, level);
      this.container.appendChild(m);

      if (sticky) {
        this.queue = this.queue.then(() => this.showMessage(m));
        return;
      }

      let wait = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, this.calculateTimeout(m, timeout));
        });
      };

      this.queue = this.queue
        .then(() => this.showMessage(m))
        .then(wait)
        .then(() => this.hideMessage(m))
        .then(() => this.removeMessage(m));
    }

    // Show function used when a message should appear; must return a
    // promise which should be resolved when i.e. the show animation
    // finished.
    showMessage(m) {
      return new Promise((resolve, reject) => {
        let mCSS = window.getComputedStyle(m);

        if (mCSS.getPropertyValue('transition-duration') !== '0s') {
          m.addEventListener('transitionend', () => {
            resolve();
          });
        } else {
          resolve();
        }
        m.classList.remove('invisible');
      });
    }

    // Hide function used when a message should disappear; must return
    // a promise which should be resolved when i.e. the hide animation
    // finished.
    hideMessage(m) {
      return new Promise((resolve, reject) => {
        let mCSS = window.getComputedStyle(m);

        if (mCSS.getPropertyValue('transition-duration') !== '0s') {
          m.addEventListener('transitionend', () => {
            resolve();
          });
        } else {
          resolve();
        }
        m.classList.add('invisible');
      });
    }

    removeMessage(m) {
      return new Promise((resolve) => {
        m.parentNode.removeChild(m);
        resolve();
      });
    }

    renderMessage(html, sticky, level) {
      let m = document.createElement('div');

      m.innerHTML = html;
      m.classList.add('notify__message');
      m.classList.add('invisible');

      if (sticky) {
        m.classList.add('sticky');
      } else {
        m.addEventListener('click', (ev) => {
          ev.preventDefault();
          this.hideMessage(m);
          this.removeMessage(m);
        });
      }
      if (level) {
        m.classList.add(level);
      }
      return m;
    };

    // Multiply the timeout for complex messages, giving comprehension time.
    // Give 1s per 30 chars over the first 25 chars.
    calculateTimeout(message, base) {
      let overLength = message.innerText.length - 25 / 30;
      return base + Math.max(0, 1000 * overLength);
    }
  };
});
