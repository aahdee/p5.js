/**
 * <p>The web is much more than just canvas and the DOM functionality makes it easy to interact
 * with other HTML5 objects, including text, hyperlink, image, input, video,
 * audio, and webcam.</p>
 * <p>There is a set of creation methods, DOM manipulation methods, and
 * an extended <a href="#/p5.Element">p5.Element</a> that supports a range of HTML elements. See the
 * <a href='https://github.com/processing/p5.js/wiki/Beyond-the-canvas'>
 * beyond the canvas tutorial</a> for a full overview of how this addon works.
 *
 * <p>See <a href='https://github.com/processing/p5.js/wiki/Beyond-the-canvas'>tutorial: beyond the canvas</a>
 * for more info on how to use this library.</a>
 *
 * @module DOM
 * @submodule DOM
 * @for p5
 * @requires p5
 */

import p5 from '../core/main';

/**
 * Searches the page for an element with the given ID, class, or tag name (using the '#' or '.'
 * prefixes to specify an ID or class respectively, and none for a tag) and returns it as
 * a <a href="#/p5.Element">p5.Element</a>. If a class or tag name is given with more than 1 element,
 * only the first element will be returned.
 * The DOM node itself can be accessed with .elt.
 * Returns null if none found. You can also specify a container to search within.
 *
 * @method select
 * @param  {String} name id, class, or tag name of element to search for
 * @param  {String|p5.Element|HTMLElement} [container] id, <a href="#/p5.Element">p5.Element</a>, or
 *                                             HTML element to search within
 * @return {p5.Element|null} <a href="#/p5.Element">p5.Element</a> containing node found
 * @example
 * <div ><code class='norender'>
 * function setup() {
 *   createCanvas(100, 100);
 *   //translates canvas 50px down
 *   select('canvas').position(100, 100);
 * }
 * </code></div>
 * <div><code class='norender'>
 * // these are all valid calls to select()
 * let a = select('#moo');
 * let b = select('#blah', '#myContainer');
 * let c, e;
 * if (b) {
 *   c = select('#foo', b);
 * }
 * let d = document.getElementById('beep');
 * if (d) {
 *   e = select('p', d);
 * }
 * [a, b, c, d, e]; // unused
 * </code></div>
 *
 */
p5.prototype.select = function(e, p) {
  p5._validateParameters('select', arguments);
  var res = null;
  var container = getContainer(p);
  if (e[0] === '.') {
    e = e.slice(1);
    res = container.getElementsByClassName(e);
    if (res.length) {
      res = res[0];
    } else {
      res = null;
    }
  } else if (e[0] === '#') {
    e = e.slice(1);
    res = container.getElementById(e);
  } else {
    res = container.getElementsByTagName(e);
    if (res.length) {
      res = res[0];
    } else {
      res = null;
    }
  }
  if (res) {
    return this._wrapElement(res);
  } else {
    return null;
  }
};

/**
 * Searches the page for elements with the given class or tag name (using the '.' prefix
 * to specify a class and no prefix for a tag) and returns them as <a href="#/p5.Element">p5.Element</a>s
 * in an array.
 * The DOM node itself can be accessed with .elt.
 * Returns an empty array if none found.
 * You can also specify a container to search within.
 *
 * @method selectAll
 * @param  {String} name class or tag name of elements to search for
 * @param  {String} [container] id, <a href="#/p5.Element">p5.Element</a>, or HTML element to search within
 * @return {p5.Element[]} Array of <a href="#/p5.Element">p5.Element</a>s containing nodes found
 * @example
 * <div class='norender'><code>
 * function setup() {
 *   createButton('btn');
 *   createButton('2nd btn');
 *   createButton('3rd btn');
 *   let buttons = selectAll('button');
 *
 *   for (let i = 0; i < buttons.length; i++) {
 *     buttons[i].size(100, 100);
 *   }
 * }
 * </code></div>
 * <div class='norender'><code>
 * // these are all valid calls to selectAll()
 * let a = selectAll('.moo');
 * a = selectAll('div');
 * a = selectAll('button', '#myContainer');
 *
 * let d = select('#container');
 * a = selectAll('p', d);
 *
 * let f = document.getElementById('beep');
 * a = select('.blah', f);
 *
 * a; // unused
 * </code></div>
 *
 */
p5.prototype.selectAll = function(e, p) {
  p5._validateParameters('selectAll', arguments);
  var arr = [];
  var res;
  var container = getContainer(p);
  if (e[0] === '.') {
    e = e.slice(1);
    res = container.getElementsByClassName(e);
  } else {
    res = container.getElementsByTagName(e);
  }
  if (res) {
    for (var j = 0; j < res.length; j++) {
      var obj = this._wrapElement(res[j]);
      arr.push(obj);
    }
  }
  return arr;
};

/**
 * Helper function for select and selectAll
 */
function getContainer(p) {
  var container = document;
  if (typeof p === 'string' && p[0] === '#') {
    p = p.slice(1);
    container = document.getElementById(p) || document;
  } else if (p instanceof p5.Element) {
    container = p.elt;
  } else if (p instanceof HTMLElement) {
    container = p;
  }
  return container;
}

/**
 * Helper function for getElement and getElements.
 */
p5.prototype._wrapElement = function(elt) {
  var children = Array.prototype.slice.call(elt.children);
  if (elt.tagName === 'INPUT' && elt.type === 'checkbox') {
    var converted = new p5.Element(elt, this);
    converted.checked = function() {
      if (arguments.length === 0) {
        return this.elt.checked;
      } else if (arguments[0]) {
        this.elt.checked = true;
      } else {
        this.elt.checked = false;
      }
      return this;
    };
    return converted;
  } else if (elt.tagName === 'VIDEO' || elt.tagName === 'AUDIO') {
    return new p5.MediaElement(elt, this);
  } else if (elt.tagName === 'SELECT') {
    return this.createSelect(new p5.Element(elt, this));
  } else if (
    children.length > 0 &&
    children.every(function(c) {
      return c.tagName === 'INPUT' || c.tagName === 'LABEL';
    })
  ) {
    return this.createRadio(new p5.Element(elt, this));
  } else {
    return new p5.Element(elt, this);
  }
};

/**
 * Removes all elements created by p5, except any canvas / graphics
 * elements created by <a href="#/p5/createCanvas">createCanvas</a> or <a href="#/p5/createGraphics">createGraphics</a>.
 * Event handlers are removed, and element is removed from the DOM.
 * @method removeElements
 * @example
 * <div class='norender'><code>
 * function setup() {
 *   createCanvas(100, 100);
 *   createDiv('this is some text');
 *   createP('this is a paragraph');
 * }
 * function mousePressed() {
 *   removeElements(); // this will remove the div and p, not canvas
 * }
 * </code></div>
 *
 */
p5.prototype.removeElements = function(e) {
  p5._validateParameters('removeElements', arguments);
  for (var i = 0; i < this._elements.length; i++) {
    if (!(this._elements[i].elt instanceof HTMLCanvasElement)) {
      this._elements[i].remove();
    }
  }
};

/**
 * The .<a href="#/p5.Element/changed">changed()</a> function is called when the value of an
 * element changes.
 * This can be used to attach an element specific event listener.
 *
 * @method changed
 * @param  {Function|Boolean} fxn function to be fired when the value of
 *                                an element changes.
 *                                if `false` is passed instead, the previously
 *                                firing function will no longer fire.
 * @chainable
 * @example
 * <div><code>
 * let sel;
 *
 * function setup() {
 *   textAlign(CENTER);
 *   background(200);
 *   sel = createSelect();
 *   sel.position(10, 10);
 *   sel.option('pear');
 *   sel.option('kiwi');
 *   sel.option('grape');
 *   sel.changed(mySelectEvent);
 * }
 *
 * function mySelectEvent() {
 *   let item = sel.value();
 *   background(200);
 *   text("it's a " + item + '!', 50, 50);
 * }
 * </code></div>
 *
 * <div><code>
 * let checkbox;
 * let cnv;
 *
 * function setup() {
 *   checkbox = createCheckbox(' fill');
 *   checkbox.changed(changeFill);
 *   cnv = createCanvas(100, 100);
 *   cnv.position(0, 30);
 *   noFill();
 * }
 *
 * function draw() {
 *   background(200);
 *   ellipse(50, 50, 50, 50);
 * }
 *
 * function changeFill() {
 *   if (checkbox.checked()) {
 *     fill(0);
 *   } else {
 *     noFill();
 *   }
 * }
 * </code></div>
 *
 * @alt
 * dropdown: pear, kiwi, grape. When selected text "its a" + selection shown.
 *
 */
p5.Element.prototype.changed = function(fxn) {
  p5.Element._adjustListener('change', fxn, this);
  return this;
};

/**
 * The .<a href="#/p5.Element/input">input()</a> function is called when any user input is
 * detected with an element. The input event is often used
 * to detect keystrokes in a input element, or changes on a
 * slider element. This can be used to attach an element specific
 * event listener.
 *
 * @method input
 * @param  {Function|Boolean} fxn function to be fired when any user input is
 *                                detected within the element.
 *                                if `false` is passed instead, the previously
 *                                firing function will no longer fire.
 * @chainable
 * @example
 * <div class='norender'><code>
 * // Open your console to see the output
 * function setup() {
 *   let inp = createInput('');
 *   inp.input(myInputEvent);
 * }
 *
 * function myInputEvent() {
 *   console.log('you are typing: ', this.value());
 * }
 * </code></div>
 *
 * @alt
 * no display.
 *
 */
p5.Element.prototype.input = function(fxn) {
  p5.Element._adjustListener('input', fxn, this);
  return this;
};

/**
 * Helpers for create methods.
 */
function addElement(elt, pInst, media) {
  var node = pInst._userNode ? pInst._userNode : document.body;
  node.appendChild(elt);
  var c = media ? new p5.MediaElement(elt, pInst) : new p5.Element(elt, pInst);
  pInst._elements.push(c);
  return c;
}

/**
 * Creates a &lt;div&gt;&lt;/div&gt; element in the DOM with given inner HTML.
 *
 * @method createDiv
 * @param  {String} [html] inner HTML for element created
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div class='norender'><code>
 * createDiv('this is some text');
 * </code></div>
 */

/**
 * Creates a &lt;p&gt;&lt;/p&gt; element in the DOM with given inner HTML. Used
 * for paragraph length text.
 *
 * @method createP
 * @param  {String} [html] inner HTML for element created
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div class='norender'><code>
 * createP('this is some text');
 * </code></div>
 */

/**
 * Creates a &lt;span&gt;&lt;/span&gt; element in the DOM with given inner HTML.
 *
 * @method createSpan
 * @param  {String} [html] inner HTML for element created
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div class='norender'><code>
 * createSpan('this is some text');
 * </code></div>
 */
var tags = ['div', 'p', 'span'];
tags.forEach(function(tag) {
  var method = 'create' + tag.charAt(0).toUpperCase() + tag.slice(1);
  p5.prototype[method] = function(html) {
    var elt = document.createElement(tag);
    elt.innerHTML = typeof html === 'undefined' ? '' : html;
    return addElement(elt, this);
  };
});

/**
 * Creates an &lt;img&gt; element in the DOM with given src and
 * alternate text.
 *
 * @method createImg
 * @param  {String} src src path or url for image
 * @param  {String} alt <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Img#Attributes">alternate text</a> to be used if image does not load. You can use also an empty string (`""`) if that an image is not intended to be viewed.
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div class='norender'><code>
 * createImg(
 *   'https://p5js.org/assets/img/asterisk-01.png',
 *   'the p5 magenta asterisk'
 * );
 * </code></div>
 */
/**
 * @method createImg
 * @param  {String} src
 * @param  {String} alt
 * @param  {String} crossOrigin <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes">crossOrigin property</a> of the `img` element; use either 'anonymous' or 'use-credentials' to retrieve the image with cross-origin access (for later use with `canvas`. if an empty string(`""`) is passed, CORS is not used
 * @param  {Function} [successCallback] callback to be called once image data is loaded with the <a href="#/p5.Element">p5.Element</a> as argument
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 */
p5.prototype.createImg = function() {
  p5._validateParameters('createImg', arguments);
  var elt = document.createElement('img');
  var args = arguments;
  var self;
  if (args.length > 1 && typeof args[1] === 'string') {
    elt.alt = args[1];
  }
  if (args.length > 2 && typeof args[2] === 'string') {
    elt.crossOrigin = args[2];
  }
  elt.src = args[0];
  self = addElement(elt, this);
  elt.addEventListener('load', function() {
    self.width = elt.offsetWidth || elt.width;
    self.height = elt.offsetHeight || elt.height;
    var last = args[args.length - 1];
    if (typeof last === 'function') last(self);
  });
  return self;
};

/**
 * Creates an &lt;a&gt;&lt;/a&gt; element in the DOM for including a hyperlink.
 *
 * @method createA
 * @param  {String} href       url of page to link to
 * @param  {String} html       inner html of link element to display
 * @param  {String} [target]   target where new link should open,
 *                             could be _blank, _self, _parent, _top.
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div class='norender'><code>
 * createA('http://p5js.org/', 'this is a link');
 * </code></div>
 */
p5.prototype.createA = function(href, html, target) {
  p5._validateParameters('createA', arguments);
  var elt = document.createElement('a');
  elt.href = href;
  elt.innerHTML = html;
  if (target) elt.target = target;
  return addElement(elt, this);
};

/** INPUT **/

/**
 * Creates a slider &lt;input&gt;&lt;/input&gt; element in the DOM.
 * Use .size() to set the display length of the slider.
 *
 * @method createSlider
 * @param  {Number} min minimum value of the slider
 * @param  {Number} max maximum value of the slider
 * @param  {Number} [value] default value of the slider
 * @param  {Number} [step] step size for each tick of the slider (if step is set to 0, the slider will move continuously from the minimum to the maximum value)
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div><code>
 * let slider;
 * function setup() {
 *   slider = createSlider(0, 255, 100);
 *   slider.position(10, 10);
 *   slider.style('width', '80px');
 * }
 *
 * function draw() {
 *   let val = slider.value();
 *   background(val);
 * }
 * </code></div>
 *
 * <div><code>
 * let slider;
 * function setup() {
 *   colorMode(HSB);
 *   slider = createSlider(0, 360, 60, 40);
 *   slider.position(10, 10);
 *   slider.style('width', '80px');
 * }
 *
 * function draw() {
 *   let val = slider.value();
 *   background(val, 100, 100, 1);
 * }
 * </code></div>
 */
p5.prototype.createSlider = function(min, max, value, step) {
  p5._validateParameters('createSlider', arguments);
  var elt = document.createElement('input');
  elt.type = 'range';
  elt.min = min;
  elt.max = max;
  if (step === 0) {
    elt.step = 0.000000000000000001; // smallest valid step
  } else if (step) {
    elt.step = step;
  }
  if (typeof value === 'number') elt.value = value;
  return addElement(elt, this);
};

/**
 * Creates a &lt;button&gt;&lt;/button&gt; element in the DOM.
 * Use .size() to set the display size of the button.
 * Use .mousePressed() to specify behavior on press.
 *
 * @method createButton
 * @param  {String} label label displayed on the button
 * @param  {String} [value] value of the button
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div class='norender'><code>
 * let button;
 * function setup() {
 *   createCanvas(100, 100);
 *   background(0);
 *   button = createButton('click me');
 *   button.position(19, 19);
 *   button.mousePressed(changeBG);
 * }
 *
 * function changeBG() {
 *   let val = random(255);
 *   background(val);
 * }
 * </code></div>
 */
p5.prototype.createButton = function(label, value) {
  p5._validateParameters('createButton', arguments);
  var elt = document.createElement('button');
  elt.innerHTML = label;
  if (value) elt.value = value;
  return addElement(elt, this);
};

/**
 * Creates a checkbox &lt;input&gt;&lt;/input&gt; element in the DOM.
 * Calling .checked() on a checkbox returns if it is checked or not
 *
 * @method createCheckbox
 * @param  {String} [label] label displayed after checkbox
 * @param  {boolean} [value] value of the checkbox; checked is true, unchecked is false
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div class='norender'><code>
 * let checkbox;
 *
 * function setup() {
 *   checkbox = createCheckbox('label', false);
 *   checkbox.changed(myCheckedEvent);
 * }
 *
 * function myCheckedEvent() {
 *   if (this.checked()) {
 *     console.log('Checking!');
 *   } else {
 *     console.log('Unchecking!');
 *   }
 * }
 * </code></div>
 */
p5.prototype.createCheckbox = function() {
  p5._validateParameters('createCheckbox', arguments);
  var elt = document.createElement('div');
  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  elt.appendChild(checkbox);
  //checkbox must be wrapped in p5.Element before label so that label appears after
  var self = addElement(elt, this);
  self.checked = function() {
    var cb = self.elt.getElementsByTagName('input')[0];
    if (cb) {
      if (arguments.length === 0) {
        return cb.checked;
      } else if (arguments[0]) {
        cb.checked = true;
      } else {
        cb.checked = false;
      }
    }
    return self;
  };
  this.value = function(val) {
    self.value = val;
    return this;
  };
  if (arguments[0]) {
    var ran = Math.random()
      .toString(36)
      .slice(2);
    var label = document.createElement('label');
    checkbox.setAttribute('id', ran);
    label.htmlFor = ran;
    self.value(arguments[0]);
    label.appendChild(document.createTextNode(arguments[0]));
    elt.appendChild(label);
  }
  if (arguments[1]) {
    checkbox.checked = true;
  }
  return self;
};

/**
 * Creates a dropdown menu &lt;select&gt;&lt;/select&gt; element in the DOM.
 * It also helps to assign select-box methods to <a href="#/p5.Element">p5.Element</a> when selecting existing select box.
 * The .option() method can be used to set options for the select after it is created.
 * The .value() method will return the currently selected option.
 * The .selected() method will return current dropdown element which is an instance of <a href="#/p5.Element">p5.Element</a>
 * The .selected() method can be used to make given option selected by default when the page first loads.
 * The .disable() method marks given option as disabled and marks whole of dropdown element as disabled when invoked with no parameter.
 * @method createSelect
 * @param {boolean} [multiple] true if dropdown should support multiple selections
 * @return {p5.Element}
 * @example
 * <div><code>
 * let sel;
 *
 * function setup() {
 *   textAlign(CENTER);
 *   background(200);
 *   sel = createSelect();
 *   sel.position(10, 10);
 *   sel.option('pear');
 *   sel.option('kiwi');
 *   sel.option('grape');
 *   sel.selected('kiwi');
 *   sel.changed(mySelectEvent);
 * }
 *
 * function mySelectEvent() {
 *   let item = sel.value();
 *   background(200);
 *   text('It is a ' + item + '!', 50, 50);
 * }
 * </code></div>
 *
 * <div><code>
 * let sel;
 *
 * function setup() {
 *   textAlign(CENTER);
 *   background(200);
 *   sel = createSelect();
 *   sel.position(10, 10);
 *   sel.option('oil');
 *   sel.option('milk');
 *   sel.option('bread');
 *   sel.disable('milk');
 * }
 * </code></div>
 *
 */
/**
 * @method createSelect
 * @param {Object} existing DOM select element
 * @return {p5.Element}
 */

p5.prototype.createSelect = function() {
  p5._validateParameters('createSelect', arguments);
  var elt, self;
  var arg = arguments[0];
  if (typeof arg === 'object' && arg.elt.nodeName === 'SELECT') {
    self = arg;
    elt = this.elt = arg.elt;
  } else {
    elt = document.createElement('select');
    if (arg && typeof arg === 'boolean') {
      elt.setAttribute('multiple', 'true');
    }
    self = addElement(elt, this);
  }
  self.option = function(name, value) {
    var index;
    //see if there is already an option with this name
    for (var i = 0; i < this.elt.length; i++) {
      if (this.elt[i].innerHTML === name) {
        index = i;
        break;
      }
    }
    //if there is an option with this name we will modify it
    if (index !== undefined) {
      //if the user passed in false then delete that option
      if (value === false) {
        this.elt.remove(index);
      } else {
        //otherwise if the name and value are the same then change both
        if (this.elt[index].innerHTML === this.elt[index].value) {
          this.elt[index].innerHTML = this.elt[index].value = value;
          //otherwise just change the value
        } else {
          this.elt[index].value = value;
        }
      }
    } else {
      //if it doesn't exist make it
      var opt = document.createElement('option');
      opt.innerHTML = name;
      if (arguments.length > 1) opt.value = value;
      else opt.value = name;
      elt.appendChild(opt);
      this._pInst._elements.push(opt);
    }
  };
  self.selected = function(value) {
    var arr = [],
      i;
    if (arguments.length > 0) {
      for (i = 0; i < this.elt.length; i++) {
        if (value.toString() === this.elt[i].value) {
          this.elt.selectedIndex = i;
        }
      }
      return this;
    } else {
      if (this.elt.getAttribute('multiple')) {
        for (i = 0; i < this.elt.selectedOptions.length; i++) {
          arr.push(this.elt.selectedOptions[i].value);
        }
        return arr;
      } else {
        return this.elt.value;
      }
    }
  };

  self.disable = function(value) {
    if (value !== undefined && typeof value === 'string') {
      for (let i = 0; i < this.elt.length; i++) {
        if (this.elt[i].value === value) {
          this.elt[i].disabled = true;
        }
      }
      return this;
    } else if (arguments.length === 0) {
      this.elt.disabled = true;
      return this;
    }
  };

  return self;
};

/**
 * Creates a radio button &lt;input&gt;&lt;/input&gt; element in the DOM.
 * The .option() method can be used to set options for the radio after it is
 * created. The .value() method will return the currently selected option.
 *
 * @method createRadio
 * @param  {String} [divId] the id and name of the created div and input field respectively
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div><code>
 * let radio;
 *
 * function setup() {
 *   radio = createRadio();
 *   radio.option('black');
 *   radio.option('white');
 *   radio.option('gray');
 *   radio.style('width', '60px');
 *   textAlign(CENTER);
 *   fill(255, 0, 0);
 * }
 *
 * function draw() {
 *   let val = radio.value();
 *   background(val);
 *   text(val, width / 2, height / 2);
 * }
 * </code></div>
 * <div><code>
 * let radio;
 *
 * function setup() {
 *   radio = createRadio();
 *   radio.option('apple', 1);
 *   radio.option('bread', 2);
 *   radio.option('juice', 3);
 *   radio.style('width', '60px');
 *   textAlign(CENTER);
 * }
 *
 * function draw() {
 *   background(200);
 *   let val = radio.value();
 *   if (val) {
 *     text('item cost is $' + val, width / 2, height / 2);
 *   }
 * }
 * </code></div>
 */
p5.prototype.createRadio = function(existing_radios) {
  p5._validateParameters('createRadio', arguments);
  // do some prep by counting number of radios on page
  var radios = document.querySelectorAll('input[type=radio]');
  var count = 0;
  if (radios.length > 1) {
    var length = radios.length;
    var prev = radios[0].name;
    var current = radios[1].name;
    count = 1;
    for (var i = 1; i < length; i++) {
      current = radios[i].name;
      if (prev !== current) {
        count++;
      }
      prev = current;
    }
  } else if (radios.length === 1) {
    count = 1;
  }
  // see if we got an existing set of radios from callee
  var elt, self;
  if (typeof existing_radios === 'object') {
    // use existing elements
    self = existing_radios;
    elt = this.elt = existing_radios.elt;
  } else {
    // create a set of radio buttons
    elt = document.createElement('div');
    self = addElement(elt, this);
  }
  // setup member functions
  self._getInputChildrenArray = function() {
    return Array.prototype.slice.call(this.elt.children).filter(function(c) {
      return c.tagName === 'INPUT';
    });
  };

  var times = -1;
  self.option = function(name, value) {
    var opt = document.createElement('input');
    opt.type = 'radio';
    opt.innerHTML = name;
    if (value) opt.value = value;
    else opt.value = name;
    opt.setAttribute('name', 'defaultradio' + count);
    elt.appendChild(opt);
    if (name) {
      times++;
      var label = document.createElement('label');
      opt.setAttribute('id', 'defaultradio' + count + '-' + times);
      label.htmlFor = 'defaultradio' + count + '-' + times;
      label.appendChild(document.createTextNode(name));
      elt.appendChild(label);
    }
    return opt;
  };
  self.selected = function(value) {
    var i;
    var inputChildren = self._getInputChildrenArray();
    if (value) {
      for (i = 0; i < inputChildren.length; i++) {
        if (inputChildren[i].value === value) inputChildren[i].checked = true;
      }
      return this;
    } else {
      for (i = 0; i < inputChildren.length; i++) {
        if (inputChildren[i].checked === true) return inputChildren[i].value;
      }
    }
  };
  self.value = function(value) {
    var i;
    var inputChildren = self._getInputChildrenArray();
    if (value) {
      for (i = 0; i < inputChildren.length; i++) {
        if (inputChildren[i].value === value) inputChildren[i].checked = true;
      }
      return this;
    } else {
      for (i = 0; i < inputChildren.length; i++) {
        if (inputChildren[i].checked === true) return inputChildren[i].value;
      }
      return '';
    }
  };
  return self;
};

/**
 * Creates a colorPicker element in the DOM for color input.
 * The .value() method will return a hex string (#rrggbb) of the color.
 * The .color() method will return a p5.Color object with the current chosen color.
 *
 * @method createColorPicker
 * @param {String|p5.Color} [value] default color of element
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div><code>
 * let colorPicker;
 * function setup() {
 *   createCanvas(100, 100);
 *   colorPicker = createColorPicker('#ed225d');
 *   colorPicker.position(0, height + 5);
 * }
 *
 * function draw() {
 *   background(colorPicker.color());
 * }
 * </code></div>
 * <div><code>
 * let inp1, inp2;
 * function setup() {
 *   createCanvas(100, 100);
 *   background('grey');
 *   inp1 = createColorPicker('#ff0000');
 *   inp1.position(0, height + 5);
 *   inp1.input(setShade1);
 *   inp2 = createColorPicker(color('yellow'));
 *   inp2.position(0, height + 30);
 *   inp2.input(setShade2);
 *   setMidShade();
 * }
 *
 * function setMidShade() {
 *   // Finding a shade between the two
 *   let commonShade = lerpColor(inp1.color(), inp2.color(), 0.5);
 *   fill(commonShade);
 *   rect(20, 20, 60, 60);
 * }
 *
 * function setShade1() {
 *   setMidShade();
 *   console.log('You are choosing shade 1 to be : ', this.value());
 * }
 * function setShade2() {
 *   setMidShade();
 *   console.log('You are choosing shade 2 to be : ', this.value());
 * }
 * </code></div>
 */
p5.prototype.createColorPicker = function(value) {
  p5._validateParameters('createColorPicker', arguments);
  var elt = document.createElement('input');
  var self;
  elt.type = 'color';
  if (value) {
    if (value instanceof p5.Color) {
      elt.value = value.toString('#rrggbb');
    } else {
      p5.prototype._colorMode = 'rgb';
      p5.prototype._colorMaxes = {
        rgb: [255, 255, 255, 255],
        hsb: [360, 100, 100, 1],
        hsl: [360, 100, 100, 1]
      };
      elt.value = p5.prototype.color(value).toString('#rrggbb');
    }
  } else {
    elt.value = '#000000';
  }
  self = addElement(elt, this);
  // Method to return a p5.Color object for the given color.
  self.color = function() {
    if (value.mode) {
      p5.prototype._colorMode = value.mode;
    }
    if (value.maxes) {
      p5.prototype._colorMaxes = value.maxes;
    }
    return p5.prototype.color(this.elt.value);
  };
  return self;
};

/**
 * Creates an &lt;input&gt;&lt;/input&gt; element in the DOM for text input.
 * Use .<a href="#/p5.Element/size">size()</a> to set the display length of the box.
 *
 * @method createInput
 * @param {String} [value] default value of the input box
 * @param {String} [type] type of text, ie text, password etc. Defaults to text
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div class='norender'><code>
 * function setup() {
 *   let inp = createInput('');
 *   inp.input(myInputEvent);
 * }
 *
 * function myInputEvent() {
 *   console.log('you are typing: ', this.value());
 * }
 * </code></div>
 */
p5.prototype.createInput = function(value, type) {
  p5._validateParameters('createInput', arguments);
  var elt = document.createElement('input');
  elt.type = type ? type : 'text';
  if (value) elt.value = value;
  return addElement(elt, this);
};

/**
 * Creates an &lt;input&gt;&lt;/input&gt; element in the DOM of type 'file'.
 * This allows users to select local files for use in a sketch.
 *
 * @method createFileInput
 * @param  {Function} [callback] callback function for when a file loaded
 * @param  {String} [multiple] optional to allow multiple files selected
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created DOM element
 * @example
 * <div><code>
 * let input;
 * let img;
 *
 * function setup() {
 *   input = createFileInput(handleFile);
 *   input.position(0, 0);
 * }
 *
 * function draw() {
 *   background(255);
 *   if (img) {
 *     image(img, 0, 0, width, height);
 *   }
 * }
 *
 * function handleFile(file) {
 *   print(file);
 *   if (file.type === 'image') {
 *     img = createImg(file.data, '');
 *     img.hide();
 *   } else {
 *     img = null;
 *   }
 * }
 * </code></div>
 */
p5.prototype.createFileInput = function(callback, multiple) {
  p5._validateParameters('createFileInput', arguments);
  // Function to handle when a file is selected
  // We're simplifying life and assuming that we always
  // want to load every selected file
  function handleFileSelect(evt) {
    // These are the files
    var files = evt.target.files;
    // Load each one and trigger a callback
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      p5.File._load(f, callback);
    }
  }
  // Is the file stuff supported?
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Yup, we're ok and make an input file selector
    var elt = document.createElement('input');
    elt.type = 'file';

    // If we get a second argument that evaluates to true
    // then we are looking for multiple files
    if (multiple) {
      // Anything gets the job done
      elt.multiple = 'multiple';
    }

    // Now let's handle when a file was selected
    elt.addEventListener('change', handleFileSelect, false);
    return addElement(elt, this);
  } else {
    console.log(
      'The File APIs are not fully supported in this browser. Cannot create element.'
    );
  }
};

/** VIDEO STUFF **/

function createMedia(pInst, type, src, callback) {
  var elt = document.createElement(type);

  // allow src to be empty
  src = src || '';
  if (typeof src === 'string') {
    src = [src];
  }
  for (var i = 0; i < src.length; i++) {
    var source = document.createElement('source');
    source.src = src[i];
    elt.appendChild(source);
  }
  if (typeof callback !== 'undefined') {
    var callbackHandler = function() {
      callback();
      elt.removeEventListener('canplaythrough', callbackHandler);
    };
    elt.addEventListener('canplaythrough', callbackHandler);
  }

  var c = addElement(elt, pInst, true);
  c.loadedmetadata = false;
  // set width and height onload metadata
  elt.addEventListener('loadedmetadata', function() {
    c.width = elt.videoWidth;
    c.height = elt.videoHeight;
    //c.elt.playbackRate = s;
    // set elt width and height if not set
    if (c.elt.width === 0) c.elt.width = elt.videoWidth;
    if (c.elt.height === 0) c.elt.height = elt.videoHeight;
    if (c.presetPlaybackRate) {
      c.elt.playbackRate = c.presetPlaybackRate;
      delete c.presetPlaybackRate;
    }
    c.loadedmetadata = true;
  });

  return c;
}
/**
 * Creates an HTML5 &lt;video&gt; element in the DOM for simple playback
 * of audio/video. Shown by default, can be hidden with .<a href="#/p5.Element/hide">hide()</a>
 * and drawn into canvas using video(). The first parameter
 * can be either a single string path to a video file, or an array of string
 * paths to different formats of the same video. This is useful for ensuring
 * that your video can play across different browsers, as each supports
 * different formats. See <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats'>this
 * page</a> for further information about supported formats.
 *
 * @method createVideo
 * @param  {String|String[]} src path to a video file, or array of paths for
 *                             supporting different browsers
 * @param  {Function} [callback] callback function to be called upon
 *                             'canplaythrough' event fire, that is, when the
 *                             browser can play the media, and estimates that
 *                             enough data has been loaded to play the media
 *                             up to its end without having to stop for
 *                             further buffering of content
 * @return {p5.MediaElement}   pointer to video <a href="#/p5.Element">p5.Element</a>
 * @example
 * <div><code>
 * let vid;
 * function setup() {
 *   noCanvas();
 *
 *   vid = createVideo(
 *     ['assets/small.mp4', 'assets/small.ogv', 'assets/small.webm'],
 *     vidLoad
 *   );
 *
 *   vid.size(100, 100);
 * }
 *
 * // This function is called when the video loads
 * function vidLoad() {
 *   vid.loop();
 *   vid.volume(0);
 * }
 * </code></div>
 */
p5.prototype.createVideo = function(src, callback) {
  p5._validateParameters('createVideo', arguments);
  return createMedia(this, 'video', src, callback);
};

/** AUDIO STUFF **/

/**
 * Creates a hidden HTML5 &lt;audio&gt; element in the DOM for simple audio
 * playback. The first parameter can be either a single string path to a
 * audio file, or an array of string paths to different formats of the same
 * audio. This is useful for ensuring that your audio can play across
 * different browsers, as each supports different formats.
 * See <a href='https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats'>this
 * page for further information about supported formats</a>.
 *
 * @method createAudio
 * @param  {String|String[]} [src] path to an audio file, or array of paths
 *                             for supporting different browsers
 * @param  {Function} [callback] callback function to be called upon
 *                             'canplaythrough' event fire, that is, when the
 *                             browser can play the media, and estimates that
 *                             enough data has been loaded to play the media
 *                             up to its end without having to stop for
 *                             further buffering of content
 * @return {p5.MediaElement}   pointer to audio <a href="#/p5.Element">p5.Element</a>
 * @example
 * <div><code>
 * let ele;
 * function setup() {
 *   ele = createAudio('assets/beat.mp3');
 *
 *   // here we set the element to autoplay
 *   // The element will play as soon
 *   // as it is able to do so.
 *   ele.autoplay(true);
 * }
 * </code></div>
 */
p5.prototype.createAudio = function(src, callback) {
  p5._validateParameters('createAudio', arguments);
  return createMedia(this, 'audio', src, callback);
};

/** CAMERA STUFF **/

/**
 * @property {String} VIDEO
 * @final
 * @category Constants
 */
p5.prototype.VIDEO = 'video';
/**
 * @property {String} AUDIO
 * @final
 * @category Constants
 */
p5.prototype.AUDIO = 'audio';

// from: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = function(constraints) {
    // First get ahold of the legacy getUserMedia, if present
    var getUserMedia =
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
      return Promise.reject(
        new Error('getUserMedia is not implemented in this browser')
      );
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  };
}

/**
 * <p>Creates a new HTML5 &lt;video&gt; element that contains the audio/video
 * feed from a webcam. The element is separate from the canvas and is
 * displayed by default. The element can be hidden using .<a href="#/p5.Element/hide">hide()</a>. The feed
 * can be drawn onto the canvas using <a href="#/p5/image">image()</a>. The loadedmetadata property can
 * be used to detect when the element has fully loaded (see second example).</p>
 * <p>More specific properties of the feed can be passing in a Constraints object.
 * See the
 * <a href='http://w3c.github.io/mediacapture-main/getusermedia.html#media-track-constraints'> W3C
 * spec</a> for possible properties. Note that not all of these are supported
 * by all browsers.</p>
 * <p>Security note: A new browser security specification requires that getUserMedia,
 * which is behind <a href="#/p5/createCapture">createCapture()</a>, only works when you're running the code locally,
 * or on HTTPS. Learn more <a href='http://stackoverflow.com/questions/34197653/getusermedia-in-chrome-47-without-using-https'>here</a>
 * and <a href='https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia'>here</a>.</p>
 *
 * @method createCapture
 * @param  {String|Constant|Object}   type type of capture, either VIDEO or
 *                                   AUDIO if none specified, default both,
 *                                   or a Constraints object
 * @param  {Function}                 [callback] function to be called once
 *                                   stream has loaded
 * @return {p5.Element} capture video <a href="#/p5.Element">p5.Element</a>
 * @example
 * <div class='norender notest'><code>
 * let capture;
 *
 * function setup() {
 *   createCanvas(480, 480);
 *   capture = createCapture(VIDEO);
 *   capture.hide();
 * }
 *
 * function draw() {
 *   image(capture, 0, 0, width, width * capture.height / capture.width);
 *   filter(INVERT);
 * }
 * </code></div>
 * <div class='norender notest'><code>
 * function setup() {
 *   createCanvas(480, 120);
 *   let constraints = {
 *     video: {
 *       mandatory: {
 *         minWidth: 1280,
 *         minHeight: 720
 *       },
 *       optional: [{ maxFrameRate: 10 }]
 *     },
 *     audio: true
 *   };
 *   createCapture(constraints, function(stream) {
 *     console.log(stream);
 *   });
 * }
 * </code></div>
 * <code><div class='norender notest'>
 * let capture;
 *
 * function setup() {
 *   createCanvas(640, 480);
 *   capture = createCapture(VIDEO);
 * }
 * function draw() {
 *   background(0);
 *   if (capture.loadedmetadata) {
 *     let c = capture.get(0, 0, 100, 100);
 *     image(c, 0, 0);
 *   }
 * }
 * </code></div>
 */
p5.prototype.createCapture = function() {
  p5._validateParameters('createCapture', arguments);
  var useVideo = true;
  var useAudio = true;
  var constraints;
  var cb;
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i] === p5.prototype.VIDEO) {
      useAudio = false;
    } else if (arguments[i] === p5.prototype.AUDIO) {
      useVideo = false;
    } else if (typeof arguments[i] === 'object') {
      constraints = arguments[i];
    } else if (typeof arguments[i] === 'function') {
      cb = arguments[i];
    }
  }
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    var elt = document.createElement('video');
    // required to work in iOS 11 & up:
    elt.setAttribute('playsinline', '');

    if (!constraints) {
      constraints = { video: useVideo, audio: useAudio };
    }

    navigator.mediaDevices.getUserMedia(constraints).then(
      function(stream) {
        try {
          if ('srcObject' in elt) {
            elt.srcObject = stream;
          } else {
            elt.src = window.URL.createObjectURL(stream);
          }
        } catch (err) {
          elt.src = stream;
        }
      },
      function(e) {
        console.log(e);
      }
    );
  } else {
    throw 'getUserMedia not supported in this browser';
  }
  var c = addElement(elt, this, true);
  c.loadedmetadata = false;
  // set width and height onload metadata
  elt.addEventListener('loadedmetadata', function() {
    elt.play();

    if (elt.width) {
      c.width = elt.width;
      c.height = elt.height;
    } else {
      c.width = c.elt.width = elt.videoWidth;
      c.height = c.elt.height = elt.videoHeight;
    }
    c.loadedmetadata = true;
    if (cb) {
      cb(elt.srcObject);
    }
  });
  return c;
};

/**
 * Creates element with given tag in the DOM with given content.
 *
 * @method createElement
 * @param  {String} tag tag for the new element
 * @param  {String} [content] html content to be inserted into the element
 * @return {p5.Element} pointer to <a href="#/p5.Element">p5.Element</a> holding created node
 * @example
 * <div class='norender'><code>
 * createElement('h2', 'im an h2 p5.element!');
 * </code></div>
 */
p5.prototype.createElement = function(tag, content) {
  p5._validateParameters('createElement', arguments);
  var elt = document.createElement(tag);
  if (typeof content !== 'undefined') {
    elt.innerHTML = content;
  }
  return addElement(elt, this);
};

// =============================================================================
//                         p5.Element additions
// =============================================================================
/**
 *
 * Adds specified class to the element.
 *
 * @for p5.Element
 * @method addClass
 * @param  {String} class name of class to add
 * @chainable
 * @example
 * <div class='norender'><code>
 * let div = createDiv('div');
 * div.addClass('myClass');
 * </code></div>
 */
p5.Element.prototype.addClass = function(c) {
  if (this.elt.className) {
    if (!this.hasClass(c)) {
      this.elt.className = this.elt.className + ' ' + c;
    }
  } else {
    this.elt.className = c;
  }
  return this;
};

/**
 *
 * Removes specified class from the element.
 *
 * @method removeClass
 * @param  {String} class name of class to remove
 * @chainable
 * @example
 * <div class='norender'><code>
 * // In this example, a class is set when the div is created
 * // and removed when mouse is pressed. This could link up
 * // with a CSS style rule to toggle style properties.
 *
 * let div;
 *
 * function setup() {
 *   div = createDiv('div');
 *   div.addClass('myClass');
 * }
 *
 * function mousePressed() {
 *   div.removeClass('myClass');
 * }
 * </code></div>
 */
p5.Element.prototype.removeClass = function(c) {
  // Note: Removing a class that does not exist does NOT throw an error in classList.remove method
  this.elt.classList.remove(c);
  return this;
};

/**
 *
 * Checks if specified class already set to element
 *
 * @method hasClass
 * @returns {boolean} a boolean value if element has specified class
 * @param c {String} class name of class to check
 * @example
 * <div class='norender'><code>
 * let div;
 *
 * function setup() {
 *   div = createDiv('div');
 *   div.addClass('show');
 * }
 *
 * function mousePressed() {
 *   if (div.hasClass('show')) {
 *     div.addClass('show');
 *   } else {
 *     div.removeClass('show');
 *   }
 * }
 * </code></div>
 */
p5.Element.prototype.hasClass = function(c) {
  return this.elt.classList.contains(c);
};

/**
 *
 * Toggles element class
 *
 * @method toggleClass
 * @param c {String} class name to toggle
 * @chainable
 * @example
 * <div class='norender'><code>
 * let div;
 *
 * function setup() {
 *   div = createDiv('div');
 *   div.addClass('show');
 * }
 *
 * function mousePressed() {
 *   div.toggleClass('show');
 * }
 * </code></div>
 */
p5.Element.prototype.toggleClass = function(c) {
  // classList also has a toggle() method, but we cannot use that yet as support is unclear.
  // See https://github.com/processing/p5.js/issues/3631
  // this.elt.classList.toggle(c);
  if (this.elt.classList.contains(c)) {
    this.elt.classList.remove(c);
  } else {
    this.elt.classList.add(c);
  }
  return this;
};

/**
 *
 * Attaches the element  as a child to the parent specified.
 * Accepts either a string ID, DOM node, or <a href="#/p5.Element">p5.Element</a>.
 * If no argument is specified, an array of children DOM nodes is returned.
 *
 * @method child
 * @returns {Node[]} an array of child nodes
 * @example
 * <div class='norender'><code>
 * let div0 = createDiv('this is the parent');
 * let div1 = createDiv('this is the child');
 * div0.child(div1); // use p5.Element
 * </code></div>
 * <div class='norender'><code>
 * let div0 = createDiv('this is the parent');
 * let div1 = createDiv('this is the child');
 * div1.id('apples');
 * div0.child('apples'); // use id
 * </code></div>
 * <div class='norender notest'><code>
 * // this example assumes there is a div already on the page
 * // with id "myChildDiv"
 * let div0 = createDiv('this is the parent');
 * let elt = document.getElementById('myChildDiv');
 * div0.child(elt); // use element from page
 * </code></div>
 */
/**
 * @method child
 * @param  {String|p5.Element} [child] the ID, DOM node, or <a href="#/p5.Element">p5.Element</a>
 *                         to add to the current element
 * @chainable
 */
p5.Element.prototype.child = function(c) {
  if (typeof c === 'undefined') {
    return this.elt.childNodes;
  }
  if (typeof c === 'string') {
    if (c[0] === '#') {
      c = c.substring(1);
    }
    c = document.getElementById(c);
  } else if (c instanceof p5.Element) {
    c = c.elt;
  }
  this.elt.appendChild(c);
  return this;
};

/**
 * Centers a p5 Element either vertically, horizontally,
 * or both, relative to its parent or according to
 * the body if the Element has no parent. If no argument is passed
 * the Element is aligned both vertically and horizontally.
 *
 * @method center
 * @param  {String} [align]       passing 'vertical', 'horizontal' aligns element accordingly
 * @chainable
 *
 * @example
 * <div><code>
 * function setup() {
 *   let div = createDiv('').size(10, 10);
 *   div.style('background-color', 'orange');
 *   div.center();
 * }
 * </code></div>
 */
p5.Element.prototype.center = function(align) {
  var style = this.elt.style.display;
  var hidden = this.elt.style.display === 'none';
  var parentHidden = this.parent().style.display === 'none';
  var pos = { x: this.elt.offsetLeft, y: this.elt.offsetTop };

  if (hidden) this.show();

  this.elt.style.display = 'block';
  this.position(0, 0);

  if (parentHidden) this.parent().style.display = 'block';

  var wOffset = Math.abs(this.parent().offsetWidth - this.elt.offsetWidth);
  var hOffset = Math.abs(this.parent().offsetHeight - this.elt.offsetHeight);
  var y = pos.y;
  var x = pos.x;

  if (align === 'both' || align === undefined) {
    this.position(wOffset / 2, hOffset / 2);
  } else if (align === 'horizontal') {
    this.position(wOffset / 2, y);
  } else if (align === 'vertical') {
    this.position(x, hOffset / 2);
  }

  this.style('display', style);

  if (hidden) this.hide();

  if (parentHidden) this.parent().style.display = 'none';

  return this;
};

/**
 *
 * If an argument is given, sets the inner HTML of the element,
 * replacing any existing html. If true is included as a second
 * argument, html is appended instead of replacing existing html.
 * If no arguments are given, returns
 * the inner HTML of the element.
 *
 * @for p5.Element
 * @method html
 * @returns {String} the inner HTML of the element
 * @example
 * <div class='norender'><code>
 * let div = createDiv('').size(100, 100);
 * div.html('hi');
 * </code></div>
 * <div class='norender'><code>
 * let div = createDiv('Hello ').size(100, 100);
 * div.html('World', true);
 * </code></div>
 */
/**
 * @method html
 * @param  {String} [html] the HTML to be placed inside the element
 * @param  {boolean} [append] whether to append HTML to existing
 * @chainable
 */
p5.Element.prototype.html = function() {
  if (arguments.length === 0) {
    return this.elt.innerHTML;
  } else if (arguments[1]) {
    this.elt.insertAdjacentHTML('beforeend', arguments[0]);
    return this;
  } else {
    this.elt.innerHTML = arguments[0];
    return this;
  }
};

/**
 *
 * Sets the position of the element. If no position type argument is given, the
 * position will be relative to (0, 0) of the window.
 * Essentially, this sets position:absolute and left and top
 * properties of style. If an optional third argument specifying position type is given,
 * the x and y coordinates will be interpreted based on the <a target="_blank"
 * href="https://developer.mozilla.org/en-US/docs/Web/CSS/position">positioning scheme</a>.
 * If no arguments given, the function returns the x and y position of the element.
 *
 * @method position
 * @returns {Object} the x and y position of the element in an object
 * @example
 * <div><code class='norender'>
 * function setup() {
 *   let cnv = createCanvas(100, 100);
 *   // positions canvas 50px to the right and 100px
 *   // below upper left corner of the window
 *   cnv.position(50, 100);
 * }
 * </code></div>
 * <div><code class='norender'>
 * function setup() {
 *   let cnv = createCanvas(100, 100);
 *   // positions canvas 50px to the right and 100px
 *   // below upper left corner of the window
 *   cnv.position(0, 0, 'fixed');
 * }
 * </code></div>
 */
/**
 * @method position
 * @param  {Number} [x] x-position relative to upper left of window (optional)
 * @param  {Number} [y] y-position relative to upper left of window (optional)
 * @param  {String} positionType it can be static, fixed, relative, sticky, initial or inherit (optional)
 * @chainable
 */
p5.Element.prototype.position = function() {
  if (arguments.length === 0) {
    return { x: this.elt.offsetLeft, y: this.elt.offsetTop };
  } else {
    let positionType = 'absolute';
    if (
      arguments[2] === 'static' ||
      arguments[2] === 'fixed' ||
      arguments[2] === 'relative' ||
      arguments[2] === 'sticky' ||
      arguments[2] === 'initial' ||
      arguments[2] === 'inherit'
    ) {
      positionType = arguments[2];
    }
    this.elt.style.position = positionType;
    this.elt.style.left = arguments[0] + 'px';
    this.elt.style.top = arguments[1] + 'px';
    this.x = arguments[0];
    this.y = arguments[1];
    return this;
  }
};

/* Helper method called by p5.Element.style() */
p5.Element.prototype._translate = function() {
  this.elt.style.position = 'absolute';
  // save out initial non-translate transform styling
  var transform = '';
  if (this.elt.style.transform) {
    transform = this.elt.style.transform.replace(/translate3d\(.*\)/g, '');
    transform = transform.replace(/translate[X-Z]?\(.*\)/g, '');
  }
  if (arguments.length === 2) {
    this.elt.style.transform =
      'translate(' + arguments[0] + 'px, ' + arguments[1] + 'px)';
  } else if (arguments.length > 2) {
    this.elt.style.transform =
      'translate3d(' +
      arguments[0] +
      'px,' +
      arguments[1] +
      'px,' +
      arguments[2] +
      'px)';
    if (arguments.length === 3) {
      this.elt.parentElement.style.perspective = '1000px';
    } else {
      this.elt.parentElement.style.perspective = arguments[3] + 'px';
    }
  }
  // add any extra transform styling back on end
  this.elt.style.transform += transform;
  return this;
};

/* Helper method called by p5.Element.style() */
p5.Element.prototype._rotate = function() {
  // save out initial non-rotate transform styling
  var transform = '';
  if (this.elt.style.transform) {
    transform = this.elt.style.transform.replace(/rotate3d\(.*\)/g, '');
    transform = transform.replace(/rotate[X-Z]?\(.*\)/g, '');
  }

  if (arguments.length === 1) {
    this.elt.style.transform = 'rotate(' + arguments[0] + 'deg)';
  } else if (arguments.length === 2) {
    this.elt.style.transform =
      'rotate(' + arguments[0] + 'deg, ' + arguments[1] + 'deg)';
  } else if (arguments.length === 3) {
    this.elt.style.transform = 'rotateX(' + arguments[0] + 'deg)';
    this.elt.style.transform += 'rotateY(' + arguments[1] + 'deg)';
    this.elt.style.transform += 'rotateZ(' + arguments[2] + 'deg)';
  }
  // add remaining transform back on
  this.elt.style.transform += transform;
  return this;
};

/**
 * Sets the given style (css) property (1st arg) of the element with the
 * given value (2nd arg). If a single argument is given, .style()
 * returns the value of the given property; however, if the single argument
 * is given in css syntax ('text-align:center'), .style() sets the css
 * appropriately.
 *
 * @method style
 * @param  {String} property   property to be set
 * @returns {String} value of property
 * @example
 * <div><code class='norender'>
 * let myDiv = createDiv('I like pandas.');
 * myDiv.style('font-size', '18px');
 * myDiv.style('color', '#ff0000');
 * </code></div>
 * <div><code class='norender'>
 * let col = color(25, 23, 200, 50);
 * let button = createButton('button');
 * button.style('background-color', col);
 * button.position(10, 10);
 * </code></div>
 * <div><code class='norender'>
 * let myDiv;
 * function setup() {
 *   background(200);
 *   myDiv = createDiv('I like gray.');
 *   myDiv.position(20, 20);
 * }
 *
 * function draw() {
 *   myDiv.style('font-size', mouseX + 'px');
 * }
 * </code></div>
 */
/**
 * @method style
 * @param  {String} property
 * @param  {String|Number|p5.Color} value     value to assign to property
 * @return {String} current value of property, if no value is given as second argument
 * @chainable
 */
p5.Element.prototype.style = function(prop, val) {
  var self = this;

  if (val instanceof p5.Color) {
    val =
      'rgba(' +
      val.levels[0] +
      ',' +
      val.levels[1] +
      ',' +
      val.levels[2] +
      ',' +
      val.levels[3] / 255 +
      ')';
  }

  if (typeof val === 'undefined') {
    // input provided as single line string
    if (prop.indexOf(':') === -1) {
      var styles = window.getComputedStyle(self.elt);
      var style = styles.getPropertyValue(prop);
      return style;
    } else {
      var attrs = prop.split(';');
      for (var i = 0; i < attrs.length; i++) {
        var parts = attrs[i].split(':');
        if (parts[0] && parts[1]) {
          this.elt.style[parts[0].trim()] = parts[1].trim();
        }
      }
    }
  } else {
    // input provided as key,val pair
    this.elt.style[prop] = val;
    if (
      prop === 'width' ||
      prop === 'height' ||
      prop === 'left' ||
      prop === 'top'
    ) {
      var numVal = val.replace(/\D+/g, '');
      this[prop] = parseInt(numVal, 10);
    }
  }
  return this;
};

/**
 *
 * Adds a new attribute or changes the value of an existing attribute
 * on the specified element. If no value is specified, returns the
 * value of the given attribute, or null if attribute is not set.
 *
 * @method attribute
 * @return {String} value of attribute
 *
 * @example
 * <div class='norender'><code>
 * let myDiv = createDiv('I like pandas.');
 * myDiv.attribute('align', 'center');
 * </code></div>
 */
/**
 * @method attribute
 * @param  {String} attr       attribute to set
 * @param  {String} value      value to assign to attribute
 * @chainable
 */
p5.Element.prototype.attribute = function(attr, value) {
  //handling for checkboxes and radios to ensure options get
  //attributes not divs
  if (
    this.elt.firstChild != null &&
    (this.elt.firstChild.type === 'checkbox' ||
      this.elt.firstChild.type === 'radio')
  ) {
    if (typeof value === 'undefined') {
      return this.elt.firstChild.getAttribute(attr);
    } else {
      for (var i = 0; i < this.elt.childNodes.length; i++) {
        this.elt.childNodes[i].setAttribute(attr, value);
      }
    }
  } else if (typeof value === 'undefined') {
    return this.elt.getAttribute(attr);
  } else {
    this.elt.setAttribute(attr, value);
    return this;
  }
};

/**
 *
 * Removes an attribute on the specified element.
 *
 * @method removeAttribute
 * @param  {String} attr       attribute to remove
 * @chainable
 *
 * @example
 * <div><code>
 * let button;
 * let checkbox;
 *
 * function setup() {
 *   checkbox = createCheckbox('enable', true);
 *   checkbox.changed(enableButton);
 *   button = createButton('button');
 *   button.position(10, 10);
 * }
 *
 * function enableButton() {
 *   if (this.checked()) {
 *     // Re-enable the button
 *     button.removeAttribute('disabled');
 *   } else {
 *     // Disable the button
 *     button.attribute('disabled', '');
 *   }
 * }
 * </code></div>
 */
p5.Element.prototype.removeAttribute = function(attr) {
  if (
    this.elt.firstChild != null &&
    (this.elt.firstChild.type === 'checkbox' ||
      this.elt.firstChild.type === 'radio')
  ) {
    for (var i = 0; i < this.elt.childNodes.length; i++) {
      this.elt.childNodes[i].removeAttribute(attr);
    }
  }
  this.elt.removeAttribute(attr);
  return this;
};

/**
 * Either returns the value of the element if no arguments
 * given, or sets the value of the element.
 *
 * @method value
 * @return {String|Number} value of the element
 * @example
 * <div class='norender'><code>
 * // gets the value
 * let inp;
 * function setup() {
 *   inp = createInput('');
 * }
 *
 * function mousePressed() {
 *   print(inp.value());
 * }
 * </code></div>
 * <div class='norender'><code>
 * // sets the value
 * let inp;
 * function setup() {
 *   inp = createInput('myValue');
 * }
 *
 * function mousePressed() {
 *   inp.value('myValue');
 * }
 * </code></div>
 */
/**
 * @method value
 * @param  {String|Number}     value
 * @chainable
 */
p5.Element.prototype.value = function() {
  if (arguments.length > 0) {
    this.elt.value = arguments[0];
    return this;
  } else {
    if (this.elt.type === 'range') {
      return parseFloat(this.elt.value);
    } else return this.elt.value;
  }
};

/**
 *
 * Shows the current element. Essentially, setting display:block for the style.
 *
 * @method show
 * @chainable
 * @example
 * <div class='norender'><code>
 * let div = createDiv('div');
 * div.style('display', 'none');
 * div.show(); // turns display to block
 * </code></div>
 */
p5.Element.prototype.show = function() {
  this.elt.style.display = 'block';
  return this;
};

/**
 * Hides the current element. Essentially, setting display:none for the style.
 *
 * @method hide
 * @chainable
 * @example
 * <div class='norender'><code>
 * let div = createDiv('this is a div');
 * div.hide();
 * </code></div>
 */
p5.Element.prototype.hide = function() {
  this.elt.style.display = 'none';
  return this;
};

/**
 *
 * Sets the width and height of the element. AUTO can be used to
 * only adjust one dimension at a time. If no arguments are given, it
 * returns the width and height of the element in an object. In case of
 * elements which need to be loaded, such as images, it is recommended
 * to call the function after the element has finished loading.
 *
 * @method size
 * @return {Object} the width and height of the element in an object
 * @example
 * <div class='norender'><code>
 * let div = createDiv('this is a div');
 * div.size(100, 100);
 * let img = createImg(
 *   'assets/rockies.jpg',
 *   'A tall mountain with a small forest and field in front of it on a sunny day',
 *   '',
 *   () => {
 *     img.size(10, AUTO);
 *   }
 * );
 * </code></div>
 */
/**
 * @method size
 * @param  {Number|Constant} w    width of the element, either AUTO, or a number
 * @param  {Number|Constant} [h] height of the element, either AUTO, or a number
 * @chainable
 */
p5.Element.prototype.size = function(w, h) {
  if (arguments.length === 0) {
    return { width: this.elt.offsetWidth, height: this.elt.offsetHeight };
  } else {
    var aW = w;
    var aH = h;
    var AUTO = p5.prototype.AUTO;
    if (aW !== AUTO || aH !== AUTO) {
      if (aW === AUTO) {
        aW = h * this.width / this.height;
      } else if (aH === AUTO) {
        aH = w * this.height / this.width;
      }
      // set diff for cnv vs normal div
      if (this.elt instanceof HTMLCanvasElement) {
        var j = {};
        var k = this.elt.getContext('2d');
        var prop;
        for (prop in k) {
          j[prop] = k[prop];
        }
        this.elt.setAttribute('width', aW * this._pInst._pixelDensity);
        this.elt.setAttribute('height', aH * this._pInst._pixelDensity);
        this.elt.style.width = aW + 'px';
        this.elt.style.height = aH + 'px';
        this._pInst.scale(this._pInst._pixelDensity, this._pInst._pixelDensity);
        for (prop in j) {
          this.elt.getContext('2d')[prop] = j[prop];
        }
      } else {
        this.elt.style.width = aW + 'px';
        this.elt.style.height = aH + 'px';
        this.elt.width = aW;
        this.elt.height = aH;
      }

      this.width = this.elt.offsetWidth;
      this.height = this.elt.offsetHeight;

      if (this._pInst && this._pInst._curElement) {
        // main canvas associated with p5 instance
        if (this._pInst._curElement.elt === this.elt) {
          this._pInst._setProperty('width', this.elt.offsetWidth);
          this._pInst._setProperty('height', this.elt.offsetHeight);
        }
      }
    }
    return this;
  }
};

/**
 * Removes the element, stops all media streams, and deregisters all listeners.
 * @method remove
 * @example
 * <div class='norender'><code>
 * let myDiv = createDiv('this is some text');
 * myDiv.remove();
 * </code></div>
 */
p5.Element.prototype.remove = function() {
  // stop all audios/videos and detach all devices like microphone/camera etc
  // used as input/output for audios/videos.
  if (this instanceof p5.MediaElement) {
    const tracks = this.elt.srcObject.getTracks();
    tracks.forEach(function(track) {
      track.stop();
    });
  }

  // delete the reference in this._pInst._elements
  const index = this._pInst._elements.indexOf(this);
  if (index !== -1) {
    this._pInst._elements.splice(index, 1);
  }

  // deregister events
  for (let ev in this._events) {
    this.elt.removeEventListener(ev, this._events[ev]);
  }
  if (this.elt && this.elt.parentNode) {
    this.elt.parentNode.removeChild(this.elt);
  }
};

/**
 * Registers a callback that gets called every time a file that is
 * dropped on the element has been loaded.
 * p5 will load every dropped file into memory and pass it as a p5.File object to the callback.
 * Multiple files dropped at the same time will result in multiple calls to the callback.
 *
 * You can optionally pass a second callback which will be registered to the raw
 * <a href="https://developer.mozilla.org/en-US/docs/Web/Events/drop">drop</a> event.
 * The callback will thus be provided the original
 * <a href="https://developer.mozilla.org/en-US/docs/Web/API/DragEvent">DragEvent</a>.
 * Dropping multiple files at the same time will trigger the second callback once per drop,
 * whereas the first callback will trigger for each loaded file.
 *
 * @method drop
 * @param  {Function} callback  callback to receive loaded file, called for each file dropped.
 * @param  {Function} [fxn]     callback triggered once when files are dropped with the drop event.
 * @chainable
 * @example
 * <div><code>
 * function setup() {
 *   let c = createCanvas(100, 100);
 *   background(200);
 *   textAlign(CENTER);
 *   text('drop file', width / 2, height / 2);
 *   c.drop(gotFile);
 * }
 *
 * function gotFile(file) {
 *   background(200);
 *   text('received file:', width / 2, height / 2);
 *   text(file.name, width / 2, height / 2 + 50);
 * }
 * </code></div>
 *
 * <div><code>
 * let img;
 *
 * function setup() {
 *   let c = createCanvas(100, 100);
 *   background(200);
 *   textAlign(CENTER);
 *   text('drop image', width / 2, height / 2);
 *   c.drop(gotFile);
 * }
 *
 * function draw() {
 *   if (img) {
 *     image(img, 0, 0, width, height);
 *   }
 * }
 *
 * function gotFile(file) {
 *   img = createImg(file.data, '').hide();
 * }
 * </code></div>
 *
 * @alt
 * Canvas turns into whatever image is dragged/dropped onto it.
 */
p5.Element.prototype.drop = function(callback, fxn) {
  // Is the file stuff supported?
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    if (!this._dragDisabled) {
      this._dragDisabled = true;

      var preventDefault = function(evt) {
        evt.preventDefault();
      };

      // If you want to be able to drop you've got to turn off
      // a lot of default behavior.
      // avoid `attachListener` here, since it overrides other handlers.
      this.elt.addEventListener('dragover', preventDefault);

      // If this is a drag area we need to turn off the default behavior
      this.elt.addEventListener('dragleave', preventDefault);
    }

    // Deal with the files
    p5.Element._attachListener(
      'drop',
      function(evt) {
        evt.preventDefault();
        // Call the second argument as a callback that receives the raw drop event
        if (typeof fxn === 'function') {
          fxn.call(this, evt);
        }
        // A FileList
        var files = evt.dataTransfer.files;

        // Load each one and trigger the callback
        for (var i = 0; i < files.length; i++) {
          var f = files[i];
          p5.File._load(f, callback);
        }
      },
      this
    );
  } else {
    console.log('The File APIs are not fully supported in this browser.');
  }

  return this;
};

// =============================================================================
//                         p5.MediaElement additions
// =============================================================================

/**
 * Extends <a href="#/p5.Element">p5.Element</a> to handle audio and video. In addition to the methods
 * of <a href="#/p5.Element">p5.Element</a>, it also contains methods for controlling media. It is not
 * called directly, but <a href="#/p5.MediaElement">p5.MediaElement</a>s are created by calling <a href="#/p5/createVideo">createVideo</a>,
 * <a href="#/p5/createAudio">createAudio</a>, and <a href="#/p5/createCapture">createCapture</a>.
 *
 * @class p5.MediaElement
 * @constructor
 * @param {String} elt DOM node that is wrapped
 */
p5.MediaElement = function(elt, pInst) {
  p5.Element.call(this, elt, pInst);

  var self = this;
  this.elt.crossOrigin = 'anonymous';

  this._prevTime = 0;
  this._cueIDCounter = 0;
  this._cues = [];
  this._pixelsState = this;
  this._pixelDensity = 1;
  this._modified = false;

  /**
   * Path to the media element source.
   *
   * @property src
   * @return {String} src
   * @example
   * <div><code>
   * let ele;
   *
   * function setup() {
   *   background(250);
   *
   *   //p5.MediaElement objects are usually created
   *   //by calling the createAudio(), createVideo(),
   *   //and createCapture() functions.
   *
   *   //In this example we create
   *   //a new p5.MediaElement via createAudio().
   *   ele = createAudio('assets/beat.mp3');
   *
   *   //We'll set up our example so that
   *   //when you click on the text,
   *   //an alert box displays the MediaElement's
   *   //src field.
   *   textAlign(CENTER);
   *   text('Click Me!', width / 2, height / 2);
   * }
   *
   * function mouseClicked() {
   *   //here we test if the mouse is over the
   *   //canvas element when it's clicked
   *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
   *     //Show our p5.MediaElement's src field
   *     alert(ele.src);
   *   }
   * }
   * </code></div>
   */
  Object.defineProperty(self, 'src', {
    get: function() {
      var firstChildSrc = self.elt.children[0].src;
      var srcVal = self.elt.src === window.location.href ? '' : self.elt.src;
      var ret = firstChildSrc === window.location.href ? srcVal : firstChildSrc;
      return ret;
    },
    set: function(newValue) {
      for (var i = 0; i < self.elt.children.length; i++) {
        self.elt.removeChild(self.elt.children[i]);
      }
      var source = document.createElement('source');
      source.src = newValue;
      elt.appendChild(source);
      self.elt.src = newValue;
      self.modified = true;
    }
  });

  // private _onended callback, set by the method: onended(callback)
  self._onended = function() {};
  self.elt.onended = function() {
    self._onended(self);
  };
};
p5.MediaElement.prototype = Object.create(p5.Element.prototype);

/**
 * Play an HTML5 media element.
 *
 * @method play
 * @chainable
 * @example
 * <div><code>
 * let ele;
 *
 * function setup() {
 *   //p5.MediaElement objects are usually created
 *   //by calling the createAudio(), createVideo(),
 *   //and createCapture() functions.
 *
 *   //In this example we create
 *   //a new p5.MediaElement via createAudio().
 *   ele = createAudio('assets/beat.mp3');
 *
 *   background(250);
 *   textAlign(CENTER);
 *   text('Click to Play!', width / 2, height / 2);
 * }
 *
 * function mouseClicked() {
 *   //here we test if the mouse is over the
 *   //canvas element when it's clicked
 *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
 *     //Here we call the play() function on
 *     //the p5.MediaElement we created above.
 *     //This will start the audio sample.
 *     ele.play();
 *
 *     background(200);
 *     text('You clicked Play!', width / 2, height / 2);
 *   }
 * }
 * </code></div>
 */
p5.MediaElement.prototype.play = function() {
  if (this.elt.currentTime === this.elt.duration) {
    this.elt.currentTime = 0;
  }
  var promise;
  if (this.elt.readyState > 1) {
    promise = this.elt.play();
  } else {
    // in Chrome, playback cannot resume after being stopped and must reload
    this.elt.load();
    promise = this.elt.play();
  }
  if (promise && promise.catch) {
    promise.catch(function(e) {
      // if it's an autoplay failure error
      if (e.name === 'NotAllowedError') {
        p5._friendlyAutoplayError(this.src);
      } else {
        // any other kind of error
        console.error('Media play method encountered an unexpected error', e);
      }
    });
  }
  return this;
};

/**
 * Stops an HTML5 media element (sets current time to zero).
 *
 * @method stop
 * @chainable
 * @example
 * <div><code>
 * //This example both starts
 * //and stops a sound sample
 * //when the user clicks the canvas
 *
 * //We will store the p5.MediaElement
 * //object in here
 * let ele;
 *
 * //while our audio is playing,
 * //this will be set to true
 * let sampleIsPlaying = false;
 *
 * function setup() {
 *   //Here we create a p5.MediaElement object
 *   //using the createAudio() function.
 *   ele = createAudio('assets/beat.mp3');
 *   background(200);
 *   textAlign(CENTER);
 *   text('Click to play!', width / 2, height / 2);
 * }
 *
 * function mouseClicked() {
 *   //here we test if the mouse is over the
 *   //canvas element when it's clicked
 *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
 *     background(200);
 *
 *     if (sampleIsPlaying) {
 *       //if the sample is currently playing
 *       //calling the stop() function on
 *       //our p5.MediaElement will stop
 *       //it and reset its current
 *       //time to 0 (i.e. it will start
 *       //at the beginning the next time
 *       //you play it)
 *       ele.stop();
 *
 *       sampleIsPlaying = false;
 *       text('Click to play!', width / 2, height / 2);
 *     } else {
 *       //loop our sound element until we
 *       //call ele.stop() on it.
 *       ele.loop();
 *
 *       sampleIsPlaying = true;
 *       text('Click to stop!', width / 2, height / 2);
 *     }
 *   }
 * }
 * </code></div>
 */
p5.MediaElement.prototype.stop = function() {
  this.elt.pause();
  this.elt.currentTime = 0;
  return this;
};

/**
 * Pauses an HTML5 media element.
 *
 * @method pause
 * @chainable
 * @example
 * <div><code>
 * //This example both starts
 * //and pauses a sound sample
 * //when the user clicks the canvas
 *
 * //We will store the p5.MediaElement
 * //object in here
 * let ele;
 *
 * //while our audio is playing,
 * //this will be set to true
 * let sampleIsPlaying = false;
 *
 * function setup() {
 *   //Here we create a p5.MediaElement object
 *   //using the createAudio() function.
 *   ele = createAudio('assets/lucky_dragons.mp3');
 *   background(200);
 *   textAlign(CENTER);
 *   text('Click to play!', width / 2, height / 2);
 * }
 *
 * function mouseClicked() {
 *   //here we test if the mouse is over the
 *   //canvas element when it's clicked
 *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
 *     background(200);
 *
 *     if (sampleIsPlaying) {
 *       //Calling pause() on our
 *       //p5.MediaElement will stop it
 *       //playing, but when we call the
 *       //loop() or play() functions
 *       //the sample will start from
 *       //where we paused it.
 *       ele.pause();
 *
 *       sampleIsPlaying = false;
 *       text('Click to resume!', width / 2, height / 2);
 *     } else {
 *       //loop our sound element until we
 *       //call ele.pause() on it.
 *       ele.loop();
 *
 *       sampleIsPlaying = true;
 *       text('Click to pause!', width / 2, height / 2);
 *     }
 *   }
 * }
 * </code></div>
 */
p5.MediaElement.prototype.pause = function() {
  this.elt.pause();
  return this;
};

/**
 * Set 'loop' to true for an HTML5 media element, and starts playing.
 *
 * @method loop
 * @chainable
 * @example
 * <div><code>
 * //Clicking the canvas will loop
 * //the audio sample until the user
 * //clicks again to stop it
 *
 * //We will store the p5.MediaElement
 * //object in here
 * let ele;
 *
 * //while our audio is playing,
 * //this will be set to true
 * let sampleIsLooping = false;
 *
 * function setup() {
 *   //Here we create a p5.MediaElement object
 *   //using the createAudio() function.
 *   ele = createAudio('assets/lucky_dragons.mp3');
 *   background(200);
 *   textAlign(CENTER);
 *   text('Click to loop!', width / 2, height / 2);
 * }
 *
 * function mouseClicked() {
 *   //here we test if the mouse is over the
 *   //canvas element when it's clicked
 *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
 *     background(200);
 *
 *     if (!sampleIsLooping) {
 *       //loop our sound element until we
 *       //call ele.stop() on it.
 *       ele.loop();
 *
 *       sampleIsLooping = true;
 *       text('Click to stop!', width / 2, height / 2);
 *     } else {
 *       ele.stop();
 *
 *       sampleIsLooping = false;
 *       text('Click to loop!', width / 2, height / 2);
 *     }
 *   }
 * }
 * </code></div>
 */
p5.MediaElement.prototype.loop = function() {
  this.elt.setAttribute('loop', true);
  this.play();
  return this;
};
/**
 * Set 'loop' to false for an HTML5 media element. Element will stop
 * when it reaches the end.
 *
 * @method noLoop
 * @chainable
 * @example
 * <div><code>
 * //This example both starts
 * //and stops loop of sound sample
 * //when the user clicks the canvas
 *
 * //We will store the p5.MediaElement
 * //object in here
 * let ele;
 * //while our audio is playing,
 * //this will be set to true
 * let sampleIsPlaying = false;
 *
 * function setup() {
 *   //Here we create a p5.MediaElement object
 *   //using the createAudio() function.
 *   ele = createAudio('assets/beat.mp3');
 *   background(200);
 *   textAlign(CENTER);
 *   text('Click to play!', width / 2, height / 2);
 * }
 *
 * function mouseClicked() {
 *   //here we test if the mouse is over the
 *   //canvas element when it's clicked
 *   if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
 *     background(200);
 *
 *     if (sampleIsPlaying) {
 *       ele.noLoop();
 *       text('No more Loops!', width / 2, height / 2);
 *     } else {
 *       ele.loop();
 *       sampleIsPlaying = true;
 *       text('Click to stop looping!', width / 2, height / 2);
 *     }
 *   }
 * }
 * </code></div>
 *
 */
p5.MediaElement.prototype.noLoop = function() {
  this.elt.setAttribute('loop', false);
  return this;
};

/**
 * Sets up logic to check that autoplay succeeded.
 *
 * @method setupAutoplayFailDetection
 * @private
 */
p5.MediaElement.prototype._setupAutoplayFailDetection = function() {
  const timeout = setTimeout(() => p5._friendlyAutoplayError(this.src), 500);
  this.elt.addEventListener('play', () => clearTimeout(timeout), {
    passive: true,
    once: true
  });
};

/**
 * Set HTML5 media element to autoplay or not.
 *
 * @method autoplay
 * @param {Boolean} autoplay whether the element should autoplay
 * @chainable
 */
p5.MediaElement.prototype.autoplay = function(val) {
  const oldVal = this.elt.getAttribute('autoplay');
  this.elt.setAttribute('autoplay', val);
  // if we turned on autoplay
  if (val && !oldVal) {
    // bind method to this scope
    const setupAutoplayFailDetection = () => this._setupAutoplayFailDetection();
    // if media is ready to play, schedule check now
    if (this.elt.readyState === 4) {
      setupAutoplayFailDetection();
    } else {
      // otherwise, schedule check whenever it is ready
      this.elt.addEventListener('canplay', setupAutoplayFailDetection, {
        passive: true,
        once: true
      });
    }
  }

  return this;
};

/**
 * Sets volume for this HTML5 media element. If no argument is given,
 * returns the current volume.
 *
 * @method volume
 * @return {Number} current volume
 *
 * @example
 * <div><code>
 * let ele;
 * function setup() {
 *   // p5.MediaElement objects are usually created
 *   // by calling the createAudio(), createVideo(),
 *   // and createCapture() functions.
 *   // In this example we create
 *   // a new p5.MediaElement via createAudio().
 *   ele = createAudio('assets/lucky_dragons.mp3');
 *   background(250);
 *   textAlign(CENTER);
 *   text('Click to Play!', width / 2, height / 2);
 * }
 * function mouseClicked() {
 *   // Here we call the volume() function
 *   // on the sound element to set its volume
 *   // Volume must be between 0.0 and 1.0
 *   ele.volume(0.2);
 *   ele.play();
 *   background(200);
 *   text('You clicked Play!', width / 2, height / 2);
 * }
 * </code></div>
 * <div><code>
 * let audio;
 * let counter = 0;
 *
 * function loaded() {
 *   audio.play();
 * }
 *
 * function setup() {
 *   audio = createAudio('assets/lucky_dragons.mp3', loaded);
 *   textAlign(CENTER);
 * }
 *
 * function draw() {
 *   if (counter === 0) {
 *     background(0, 255, 0);
 *     text('volume(0.9)', width / 2, height / 2);
 *   } else if (counter === 1) {
 *     background(255, 255, 0);
 *     text('volume(0.5)', width / 2, height / 2);
 *   } else if (counter === 2) {
 *     background(255, 0, 0);
 *     text('volume(0.1)', width / 2, height / 2);
 *   }
 * }
 *
 * function mousePressed() {
 *   counter++;
 *   if (counter === 0) {
 *     audio.volume(0.9);
 *   } else if (counter === 1) {
 *     audio.volume(0.5);
 *   } else if (counter === 2) {
 *     audio.volume(0.1);
 *   } else {
 *     counter = 0;
 *     audio.volume(0.9);
 *   }
 * }
 * </code>
 * </div>
 */
/**
 * @method volume
 * @param {Number}            val volume between 0.0 and 1.0
 * @chainable
 */
p5.MediaElement.prototype.volume = function(val) {
  if (typeof val === 'undefined') {
    return this.elt.volume;
  } else {
    this.elt.volume = val;
  }
};

/**
 * If no arguments are given, returns the current playback speed of the
 * element. The speed parameter sets the speed where 2.0 will play the
 * element twice as fast, 0.5 will play at half the speed, and -1 will play
 * the element in normal speed in reverse.(Note that not all browsers support
 * backward playback and even if they do, playback might not be smooth.)
 *
 * @method speed
 * @return {Number} current playback speed of the element
 *
 * @example
 * <div class='norender notest'><code>
 * //Clicking the canvas will loop
 * //the audio sample until the user
 * //clicks again to stop it
 *
 * //We will store the p5.MediaElement
 * //object in here
 * let ele;
 * let button;
 *
 * function setup() {
 *   createCanvas(710, 400);
 *   //Here we create a p5.MediaElement object
 *   //using the createAudio() function.
 *   ele = createAudio('assets/beat.mp3');
 *   ele.loop();
 *   background(200);
 *
 *   button = createButton('2x speed');
 *   button.position(100, 68);
 *   button.mousePressed(twice_speed);
 *
 *   button = createButton('half speed');
 *   button.position(200, 68);
 *   button.mousePressed(half_speed);
 *
 *   button = createButton('reverse play');
 *   button.position(300, 68);
 *   button.mousePressed(reverse_speed);
 *
 *   button = createButton('STOP');
 *   button.position(400, 68);
 *   button.mousePressed(stop_song);
 *
 *   button = createButton('PLAY!');
 *   button.position(500, 68);
 *   button.mousePressed(play_speed);
 * }
 *
 * function twice_speed() {
 *   ele.speed(2);
 * }
 *
 * function half_speed() {
 *   ele.speed(0.5);
 * }
 *
 * function reverse_speed() {
 *   ele.speed(-1);
 * }
 *
 * function stop_song() {
 *   ele.stop();
 * }
 *
 * function play_speed() {
 *   ele.play();
 * }
 * </code></div>
 */
/**
 * @method speed
 * @param {Number} speed  speed multiplier for element playback
 * @chainable
 */
p5.MediaElement.prototype.speed = function(val) {
  if (typeof val === 'undefined') {
    return this.presetPlaybackRate || this.elt.playbackRate;
  } else {
    if (this.loadedmetadata) {
      this.elt.playbackRate = val;
    } else {
      this.presetPlaybackRate = val;
    }
  }
};

/**
 * If no arguments are given, returns the current time of the element.
 * If an argument is given the current time of the element is set to it.
 *
 * @method time
 * @return {Number} current time (in seconds)
 *
 * @example
 * <div><code>
 * let ele;
 * let beginning = true;
 * function setup() {
 *   //p5.MediaElement objects are usually created
 *   //by calling the createAudio(), createVideo(),
 *   //and createCapture() functions.
 *
 *   //In this example we create
 *   //a new p5.MediaElement via createAudio().
 *   ele = createAudio('assets/lucky_dragons.mp3');
 *   background(250);
 *   textAlign(CENTER);
 *   text('start at beginning', width / 2, height / 2);
 * }
 *
 * // this function fires with click anywhere
 * function mousePressed() {
 *   if (beginning === true) {
 *     // here we start the sound at the beginning
 *     // time(0) is not necessary here
 *     // as this produces the same result as
 *     // play()
 *     ele.play().time(0);
 *     background(200);
 *     text('jump 2 sec in', width / 2, height / 2);
 *     beginning = false;
 *   } else {
 *     // here we jump 2 seconds into the sound
 *     ele.play().time(2);
 *     background(250);
 *     text('start at beginning', width / 2, height / 2);
 *     beginning = true;
 *   }
 * }
 * </code></div>
 */
/**
 * @method time
 * @param {Number} time time to jump to (in seconds)
 * @chainable
 */
p5.MediaElement.prototype.time = function(val) {
  if (typeof val === 'undefined') {
    return this.elt.currentTime;
  } else {
    this.elt.currentTime = val;
    return this;
  }
};

/**
 * Returns the duration of the HTML5 media element.
 *
 * @method duration
 * @return {Number} duration
 *
 * @example
 * <div><code>
 * let ele;
 * function setup() {
 *   //p5.MediaElement objects are usually created
 *   //by calling the createAudio(), createVideo(),
 *   //and createCapture() functions.
 *   //In this example we create
 *   //a new p5.MediaElement via createAudio().
 *   ele = createAudio('assets/doorbell.mp3');
 *   background(250);
 *   textAlign(CENTER);
 *   text('Click to know the duration!', 10, 25, 70, 80);
 * }
 * function mouseClicked() {
 *   ele.play();
 *   background(200);
 *   //ele.duration dislpays the duration
 *   text(ele.duration() + ' seconds', width / 2, height / 2);
 * }
 * </code></div>
 */
p5.MediaElement.prototype.duration = function() {
  return this.elt.duration;
};
p5.MediaElement.prototype.pixels = [];
p5.MediaElement.prototype._ensureCanvas = function() {
  if (!this.canvas) {
    this.canvas = document.createElement('canvas');
    this.drawingContext = this.canvas.getContext('2d');
    this.setModified(true);
  }
  if (this.loadedmetadata) {
    // wait for metadata for w/h
    if (this.canvas.width !== this.elt.width) {
      this.canvas.width = this.elt.width;
      this.canvas.height = this.elt.height;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }

    this.drawingContext.drawImage(
      this.elt,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.setModified(true);
  }
};
p5.MediaElement.prototype.loadPixels = function() {
  this._ensureCanvas();
  return p5.Renderer2D.prototype.loadPixels.apply(this, arguments);
};
p5.MediaElement.prototype.updatePixels = function(x, y, w, h) {
  if (this.loadedmetadata) {
    // wait for metadata
    this._ensureCanvas();
    p5.Renderer2D.prototype.updatePixels.call(this, x, y, w, h);
  }
  this.setModified(true);
  return this;
};
p5.MediaElement.prototype.get = function() {
  this._ensureCanvas();
  return p5.Renderer2D.prototype.get.apply(this, arguments);
};
p5.MediaElement.prototype._getPixel = function() {
  this.loadPixels();
  return p5.Renderer2D.prototype._getPixel.apply(this, arguments);
};

p5.MediaElement.prototype.set = function(x, y, imgOrCol) {
  if (this.loadedmetadata) {
    // wait for metadata
    this._ensureCanvas();
    p5.Renderer2D.prototype.set.call(this, x, y, imgOrCol);
    this.setModified(true);
  }
};
p5.MediaElement.prototype.copy = function() {
  this._ensureCanvas();
  p5.prototype.copy.apply(this, arguments);
};
p5.MediaElement.prototype.mask = function() {
  this.loadPixels();
  this.setModified(true);
  p5.Image.prototype.mask.apply(this, arguments);
};
/**
 * helper method for web GL mode to figure out if the element
 * has been modified and might need to be re-uploaded to texture
 * memory between frames.
 * @method isModified
 * @private
 * @return {boolean} a boolean indicating whether or not the
 * image has been updated or modified since last texture upload.
 */
p5.MediaElement.prototype.isModified = function() {
  return this._modified;
};
/**
 * helper method for web GL mode to indicate that an element has been
 * changed or unchanged since last upload. gl texture upload will
 * set this value to false after uploading the texture; or might set
 * it to true if metadata has become available but there is no actual
 * texture data available yet..
 * @method setModified
 * @param {boolean} val sets whether or not the element has been
 * modified.
 * @private
 */
p5.MediaElement.prototype.setModified = function(value) {
  this._modified = value;
};
/**
 * Schedule an event to be called when the audio or video
 * element reaches the end. If the element is looping,
 * this will not be called. The element is passed in
 * as the argument to the onended callback.
 *
 * @method  onended
 * @param  {Function} callback function to call when the
 *                             soundfile has ended. The
 *                             media element will be passed
 *                             in as the argument to the
 *                             callback.
 * @chainable
 * @example
 * <div><code>
 * function setup() {
 *   let audioEl = createAudio('assets/beat.mp3');
 *   audioEl.showControls();
 *   audioEl.onended(sayDone);
 * }
 *
 * function sayDone(elt) {
 *   alert('done playing ' + elt.src);
 * }
 * </code></div>
 */
p5.MediaElement.prototype.onended = function(callback) {
  this._onended = callback;
  return this;
};

/*** CONNECT TO WEB AUDIO API / p5.sound.js ***/

/**
 * Send the audio output of this element to a specified audioNode or
 * p5.sound object. If no element is provided, connects to p5's master
 * output. That connection is established when this method is first called.
 * All connections are removed by the .disconnect() method.
 *
 * This method is meant to be used with the p5.sound.js addon library.
 *
 * @method  connect
 * @param  {AudioNode|Object} audioNode AudioNode from the Web Audio API,
 * or an object from the p5.sound library
 */
p5.MediaElement.prototype.connect = function(obj) {
  var audioContext, masterOutput;

  // if p5.sound exists, same audio context
  if (typeof p5.prototype.getAudioContext === 'function') {
    audioContext = p5.prototype.getAudioContext();
    masterOutput = p5.soundOut.input;
  } else {
    try {
      audioContext = obj.context;
      masterOutput = audioContext.destination;
    } catch (e) {
      throw 'connect() is meant to be used with Web Audio API or p5.sound.js';
    }
  }

  // create a Web Audio MediaElementAudioSourceNode if none already exists
  if (!this.audioSourceNode) {
    this.audioSourceNode = audioContext.createMediaElementSource(this.elt);

    // connect to master output when this method is first called
    this.audioSourceNode.connect(masterOutput);
  }

  // connect to object if provided
  if (obj) {
    if (obj.input) {
      this.audioSourceNode.connect(obj.input);
    } else {
      this.audioSourceNode.connect(obj);
    }
  } else {
    // otherwise connect to master output of p5.sound / AudioContext
    this.audioSourceNode.connect(masterOutput);
  }
};

/**
 * Disconnect all Web Audio routing, including to master output.
 * This is useful if you want to re-route the output through
 * audio effects, for example.
 *
 * @method  disconnect
 */
p5.MediaElement.prototype.disconnect = function() {
  if (this.audioSourceNode) {
    this.audioSourceNode.disconnect();
  } else {
    throw 'nothing to disconnect';
  }
};

/*** SHOW / HIDE CONTROLS ***/

/**
 * Show the default MediaElement controls, as determined by the web browser.
 *
 * @method  showControls
 * @example
 * <div><code>
 * let ele;
 * function setup() {
 *   //p5.MediaElement objects are usually created
 *   //by calling the createAudio(), createVideo(),
 *   //and createCapture() functions.
 *   //In this example we create
 *   //a new p5.MediaElement via createAudio()
 *   ele = createAudio('assets/lucky_dragons.mp3');
 *   background(200);
 *   textAlign(CENTER);
 *   text('Click to Show Controls!', 10, 25, 70, 80);
 * }
 * function mousePressed() {
 *   ele.showControls();
 *   background(200);
 *   text('Controls Shown', width / 2, height / 2);
 * }
 * </code></div>
 */
p5.MediaElement.prototype.showControls = function() {
  // must set style for the element to show on the page
  this.elt.style['text-align'] = 'inherit';
  this.elt.controls = true;
};

/**
 * Hide the default mediaElement controls.
 * @method hideControls
 * @example
 * <div><code>
 * let ele;
 * function setup() {
 *   //p5.MediaElement objects are usually created
 *   //by calling the createAudio(), createVideo(),
 *   //and createCapture() functions.
 *   //In this example we create
 *   //a new p5.MediaElement via createAudio()
 *   ele = createAudio('assets/lucky_dragons.mp3');
 *   ele.showControls();
 *   background(200);
 *   textAlign(CENTER);
 *   text('Click to hide Controls!', 10, 25, 70, 80);
 * }
 * function mousePressed() {
 *   ele.hideControls();
 *   background(200);
 *   text('Controls hidden', width / 2, height / 2);
 * }
 * </code></div>
 */
p5.MediaElement.prototype.hideControls = function() {
  this.elt.controls = false;
};

/*** SCHEDULE EVENTS ***/

// Cue inspired by JavaScript setTimeout, and the
// Tone.js Transport Timeline Event, MIT License Yotam Mann 2015 tonejs.org
var Cue = function(callback, time, id, val) {
  this.callback = callback;
  this.time = time;
  this.id = id;
  this.val = val;
};

/**
 * Schedule events to trigger every time a MediaElement
 * (audio/video) reaches a playback cue point.
 *
 * Accepts a callback function, a time (in seconds) at which to trigger
 * the callback, and an optional parameter for the callback.
 *
 * Time will be passed as the first parameter to the callback function,
 * and param will be the second parameter.
 *
 *
 * @method  addCue
 * @param {Number}   time     Time in seconds, relative to this media
 *                             element's playback. For example, to trigger
 *                             an event every time playback reaches two
 *                             seconds, pass in the number 2. This will be
 *                             passed as the first parameter to
 *                             the callback function.
 * @param {Function} callback Name of a function that will be
 *                             called at the given time. The callback will
 *                             receive time and (optionally) param as its
 *                             two parameters.
 * @param {Object} [value]    An object to be passed as the
 *                             second parameter to the
 *                             callback function.
 * @return {Number} id ID of this cue,
 *                     useful for removeCue(id)
 * @example
 * <div><code>
 * //
 * //
 * function setup() {
 *   noCanvas();
 *
 *   let audioEl = createAudio('assets/beat.mp3');
 *   audioEl.showControls();
 *
 *   // schedule three calls to changeBackground
 *   audioEl.addCue(0.5, changeBackground, color(255, 0, 0));
 *   audioEl.addCue(1.0, changeBackground, color(0, 255, 0));
 *   audioEl.addCue(2.5, changeBackground, color(0, 0, 255));
 *   audioEl.addCue(3.0, changeBackground, color(0, 255, 255));
 *   audioEl.addCue(4.2, changeBackground, color(255, 255, 0));
 *   audioEl.addCue(5.0, changeBackground, color(255, 255, 0));
 * }
 *
 * function changeBackground(val) {
 *   background(val);
 * }
 * </code></div>
 */
p5.MediaElement.prototype.addCue = function(time, callback, val) {
  var id = this._cueIDCounter++;

  var cue = new Cue(callback, time, id, val);
  this._cues.push(cue);

  if (!this.elt.ontimeupdate) {
    this.elt.ontimeupdate = this._onTimeUpdate.bind(this);
  }

  return id;
};

/**
 * Remove a callback based on its ID. The ID is returned by the
 * addCue method.
 * @method removeCue
 * @param  {Number} id ID of the cue, as returned by addCue
 * @example
 * <div><code>
 * let audioEl, id1, id2;
 * function setup() {
 *   background(255, 255, 255);
 *   audioEl = createAudio('assets/beat.mp3');
 *   audioEl.showControls();
 *   // schedule five calls to changeBackground
 *   id1 = audioEl.addCue(0.5, changeBackground, color(255, 0, 0));
 *   audioEl.addCue(1.0, changeBackground, color(0, 255, 0));
 *   audioEl.addCue(2.5, changeBackground, color(0, 0, 255));
 *   audioEl.addCue(3.0, changeBackground, color(0, 255, 255));
 *   id2 = audioEl.addCue(4.2, changeBackground, color(255, 255, 0));
 *   text('Click to remove first and last Cue!', 10, 25, 70, 80);
 * }
 * function mousePressed() {
 *   audioEl.removeCue(id1);
 *   audioEl.removeCue(id2);
 * }
 * function changeBackground(val) {
 *   background(val);
 * }
 * </code></div>
 */
p5.MediaElement.prototype.removeCue = function(id) {
  for (var i = 0; i < this._cues.length; i++) {
    if (this._cues[i].id === id) {
      console.log(id);
      this._cues.splice(i, 1);
    }
  }

  if (this._cues.length === 0) {
    this.elt.ontimeupdate = null;
  }
};

/**
 * Remove all of the callbacks that had originally been scheduled
 * via the addCue method.
 * @method  clearCues
 * @param  {Number} id ID of the cue, as returned by addCue
 * @example
 * <div><code>
 * let audioEl;
 * function setup() {
 *   background(255, 255, 255);
 *   audioEl = createAudio('assets/beat.mp3');
 *   //Show the default MediaElement controls, as determined by the web browser
 *   audioEl.showControls();
 *   // schedule calls to changeBackground
 *   background(200);
 *   text('Click to change Cue!', 10, 25, 70, 80);
 *   audioEl.addCue(0.5, changeBackground, color(255, 0, 0));
 *   audioEl.addCue(1.0, changeBackground, color(0, 255, 0));
 *   audioEl.addCue(2.5, changeBackground, color(0, 0, 255));
 *   audioEl.addCue(3.0, changeBackground, color(0, 255, 255));
 *   audioEl.addCue(4.2, changeBackground, color(255, 255, 0));
 * }
 * function mousePressed() {
 *   // here we clear the scheduled callbacks
 *   audioEl.clearCues();
 *   // then we add some more callbacks
 *   audioEl.addCue(1, changeBackground, color(2, 2, 2));
 *   audioEl.addCue(3, changeBackground, color(255, 255, 0));
 * }
 * function changeBackground(val) {
 *   background(val);
 * }
 * </code></div>
 */
p5.MediaElement.prototype.clearCues = function() {
  this._cues = [];
  this.elt.ontimeupdate = null;
};

// private method that checks for cues to be fired if events
// have been scheduled using addCue(callback, time).
p5.MediaElement.prototype._onTimeUpdate = function() {
  var playbackTime = this.time();

  for (var i = 0; i < this._cues.length; i++) {
    var callbackTime = this._cues[i].time;
    var val = this._cues[i].val;

    if (this._prevTime < callbackTime && callbackTime <= playbackTime) {
      // pass the scheduled callbackTime as parameter to the callback
      this._cues[i].callback(val);
    }
  }

  this._prevTime = playbackTime;
};

/**
 * Base class for a file.
 * Used for Element.drop and createFileInput.
 *
 * @class p5.File
 * @constructor
 * @param {File} file File that is wrapped
 */
p5.File = function(file, pInst) {
  /**
   * Underlying File object. All normal File methods can be called on this.
   *
   * @property file
   */
  this.file = file;

  this._pInst = pInst;

  // Splitting out the file type into two components
  // This makes determining if image or text etc simpler
  var typeList = file.type.split('/');
  /**
   * File type (image, text, etc.)
   *
   * @property type
   */
  this.type = typeList[0];
  /**
   * File subtype (usually the file extension jpg, png, xml, etc.)
   *
   * @property subtype
   */
  this.subtype = typeList[1];
  /**
   * File name
   *
   * @property name
   */
  this.name = file.name;
  /**
   * File size
   *
   * @property size
   */
  this.size = file.size;

  /**
   * URL string containing either image data, the text contents of the file or
   * a parsed object if file is JSON and p5.XML if XML
   *
   * @property data
   */
  this.data = undefined;
};

p5.File._createLoader = function(theFile, callback) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var p5file = new p5.File(theFile);
    if (p5file.file.type === 'application/json') {
      // Parse JSON and store the result in data
      p5file.data = JSON.parse(e.target.result);
    } else if (p5file.file.type === 'text/xml') {
      // Parse XML, wrap it in p5.XML and store the result in data
      const parser = new DOMParser();
      const xml = parser.parseFromString(e.target.result, 'text/xml');
      p5file.data = new p5.XML(xml.documentElement);
    } else {
      p5file.data = e.target.result;
    }
    callback(p5file);
  };
  return reader;
};

p5.File._load = function(f, callback) {
  // Text or data?
  // This should likely be improved
  if (/^text\//.test(f.type) || f.type === 'application/json') {
    p5.File._createLoader(f, callback).readAsText(f);
  } else if (!/^(video|audio)\//.test(f.type)) {
    p5.File._createLoader(f, callback).readAsDataURL(f);
  } else {
    var file = new p5.File(f);
    file.data = URL.createObjectURL(f);
    callback(file);
  }
};

export default p5;
