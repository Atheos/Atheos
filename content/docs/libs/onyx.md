# Onyx

### Really small JavaScript (ES6) library for DOM manipulation.

---

So, what is Onyx? Onyx is a JavaScript library for basic DOM manipulation. It has a jQuery-inspired syntax, it was built off of [FemtoJS](https://github.com/vladocar/femtoJS), and designed to use [Chris Ferdinandi's Events.js](https://github.com/cferdinandi/events) for event handling.

Onyx was built to replace an insane level of overcomplexity found in the original [Codiad IDE](https://www.codiad.com) with a much smaller library when I started my own fork of Codiad, [Atheos IDE](https://www.atheos.io). EostrixJS runs much closer to the DOM / VanillaJS, allowing for faster load times and better performance while still providing easier development on Atheos.

Onyx is about **200 lines** of code in size, and the entire library weighs in at just under 0.9kB compressed and gzipped.

Onyx does not have much in the way of error checking / handling. While this is a helper library, it's best to think of it as pure javascript. Onyx is not forgiving and will not let you cut corners or code badly. Onyx exists to make developing easier, not to help you tie your shoes.

Because Onyx is so small and simple, you can add or remove methods directly in the library, meaning it's very customizable. All methods are unrelated, so removing one will not affect any others in any way.

This library is designed to be personalized to meet your needs. It's easy to modify the code to add new methods or change existing ones.

---

## Onyx Methods:

### O(**selector**)

Main constructor function, accepts `String | HTMLElement` as an argument; searches DOM using document.querySelector, and wraps element in Oyx object. Can create new element if HTML tag is passed.
> This is the gateway to femtoJS. This function returns an Onyx object which all of the following methods can be called on.

```javascript
function example() {
    // Creates Onyx obj around 'body' tag.
	const body = O('body');
	
	// Creates Onyx obj around '<input id="userEmail" type="email"></input>'.
	const userEmail = O('#userEmail');
	
	// Creates Onyx obj around newly created element.
	const dynamicAnchor = O('<a>');
}
```

---


### .on(**event**, **callback**)

Subscribes the target element to the **event** listener, using **callback** as the event handler. The **event** can be passed as either `String | Event`, while **callback** accepts a function.
> Event handling in Onyx is handled using [Chris Ferdinandi's Events.js](https://github.com/cferdinandi/events), and as such can be thought of as a wrapper for events.js. Main take away is that Onyx event handling is done through [Event Delegation](https://javascript.info/event-delegation).

```javascript
function example() {
    // This gets logged when the page loads,
	O('body').on('load', function callback() {
		console.log('Body loaded!');
	});
}
```

### .off(**event**, **callback**)

Unsubscribes the target element to the **event** listener, using **callback** as the event handler. The **event** can be passed as either `String | Event`, while **callback** accepts a function.
> Event handling in Onyx is handled using [Chris Ferdinandi's Events.js](https://github.com/cferdinandi/events), and as such can be thought of as a wrapper for events.js. Main take away is that Onyx event handling is done through [Event Delegation](https://javascript.info/event-delegation).

```javascript
function example() {
	function callback() {
		console.log('This will not be logged to the console');
	}

	const body = O('body')
	body.on('load', callback);
	body.off('load', callback);
}
```

### .css(obj)

CSS Getter/Setter function. Pass the function a css key as a `String` and it returns the elements current value for that css key. However by passing an `Object` containing css key-value pairs, this function will update the target element with new inline-css values.
> Inspired from jquery's .css() function, this makes it slightly eaiser to get/set css values.
```javascript
function example() {
	O('body').css({
	    background-color: green,
	    font-color: blue           
	});
	console.log(O('body').css('background-color'); // Logs Green
	console.log(O('body').css('font-color'); // Logs Blue
}
```
---
### .html(innerhtml)

| Argument | Type |
| innerhtml | `string` |

Sets the InnerHTML of an element to the argument `innerhtml`.

```javascript
function example() {
	$('body').html('You\'ve Been Hacked!' +
	               ' Please Contact Microsoft For' +
	               ' Support At This Number:' +
	               ' 1-XXX-XXX-XXXX' +
	               ' Your Computer Is At Risk!')
	// real virus
}
```

### .before(content)

| Argument | Type |
| content | `string | HTMLElement | femtoJS` |

If `content` is a `string`, append that HTML before the start of the elements. If it's a `HTMLElement`, append that element before the start of the elements. If it's a `femtoJS` object, append everything in its selection before the start of the elements. `string` is recommended if you have more than one element in this object's selection.

```javascript
function example() {
	$('body').before('<p>Hi!</p>')
	// creates a paragraph BEFORE the body element
	// the paragraph is not the first element in the
	// body, but actually comes before it, like:
	//   ...
	// </head>
	// <p>Hi!</p>
	// <body>
	//   ...
}
```

### .after(content)

| Argument | Type |
| content | `string | HTMLElement | femtoJS` |

If `content` is a `string`, append that HTML after the end of the elements. If it's a `HTMLElement`, append that element after the end of the elements. If it's a `femtoJS` object, append everything in its selection after the end of the elements. `string` is recommended if you have more than one element in this object's selection.

```javascript
function example() {
	$('body').after('<p>Hi!</p>')
	// creates a paragraph AFTER the body element
	// the paragraph is not the last element in the
	// body, but actually comes after it, like:
	//     ...
	//   </body>
	//   <p>Hi!</p>
	// </html>
}
```

### .first(content)

| Argument | Type |
| content | `string | HTMLElement | femtoJS` |

If `content` is a `string`, append that HTML to the beginning of the elements. If it's a `HTMLElement`, append that element to the beginning of the elements. If it's a `femtoJS` object, append everything in its selection to the beginning of the elements. `string` is recommended if you have more than one element in this object's selection.

```javascript
function example() {
	$('body').first('<p>Hi!</p>')
	// prepends a paragraph to the body element
	// the paragraph is now the first element in the
	// body, like:
	// ...
	// <body>
	//   <p>Hi!</p>
	//   ...
}
```

### .last(content)

| Argument | Type |
| content | `string | HTMLElement | femtoJS` |

If `content` is a `string`, append that HTML to the end of the elements. If it's a `HTMLElement`, append that element to the end of the elements. If it's a `femtoJS` object, append everything in its selection to the end of the elements. `string` is recommended if you have more than one element in this object's selection.

```javascript
function example() {
	$('body').last('<p>Hi!</p>')
	// appends a paragraph to the body element
	// the paragraph is now the last element in the
	// body, like:
	//     ...
	//     <p>Hi!</p>
	//   </body>
	// </html>
}
```

### .insertBefore(content)

| Argument | Type |
| content | `HTMLElement | femtoJS` |

Move all objects in the selection to right before the start of the `HTMLElement` or the first object in the `femtoJS` object's selection.

```javascript
function example() {
	$('<p>').text('Hi!').insertBefore($('body'))
	// creates a paragraph BEFORE the body element
	// the paragraph is not the first element in the
	// body, but actually comes before it, like:
	//   ...
	// </head>
	// <p>Hi!</p>
	// <body>
	//   ...
}
```

### .insertAfter(content)

| Argument | Type |
| content | `HTMLElement | femtoJS` |

Move all objects in the selection to right after the start of the `HTMLElement` or the first object in the `femtoJS` object's selection.

```javascript
function example() {
	$('<p>').text('Hi!').insertAfter($('body'))
	// creates a paragraph AFTER the body element
	// the paragraph is not the last element in the
	// body, but actually comes after it, like:
	//     ...
	//   </body>
	//   <p>Hi!</p>
	// </html>
}
```

### .insertFirst(content)

| Argument | Type |
| content | `HTMLElement | femtoJS` |

Move all objects in the selection to the beginning of the `HTMLElement` or the first object in the `femtoJS` object's selection.

```javascript
function example() {
	$('<p>').text('Hi!').insertFirst($('body'))
	// prepends a paragraph to the body element
	// the paragraph is now the first element in the
	// body, like:
	// ...
	// <body>
	//   <p>Hi!</p>
	//   ...
}
```

### .insertLast(content)

| Argument | Type |
| content | `HTMLElement | femtoJS` |

Move all objects in the selection to the end of the `HTMLElement` or the first object in the `femtoJS` object's selection.

```javascript
function example() {
	$('<p>').text('Hi!').insertLast($('body'))
	// appends a paragraph to the body element
	// the paragraph is now the last element in the
	// body, like:
	//     ...
	//     <p>Hi!</p>
	//   </body>
	// </html>
}
```

### .append(content)

| Argument | Type |
| content | `string | HTMLElement | femtoJS` |

Identical to `last`.

### .prepend(content)

| Argument | Type |
| content | `string | HTMLElement | femtoJS` |

Identical to `first`.

### .text(text)

| Argument | Type |
| text | `string` |

Changes the `innerText` of the selected elements to `text`.

```javascript
function example() {
	$('body').text('Hello, world!')
	// the body now contains "Hello, world!"
}
```

### .addClass(class)

| Argument | Type |
| class | `string` |

Adds the class `class` to all selected elements.

```javascript
function example() {
	$('body').addClass('js-enabled')
	// the body element now has the `js-enabled`
	// class
}
```

### .toggleClass(class)

| Argument | Type |
| class | `string` |

Toggles the class `class` on all selected elements.

```javascript
function example() {
	$('input[type="checkbox"]')
		.toggleClass('selected')

	// probably bad but who knows? maybe someone out
	// there thinks accessibility can take a hike
	// and uses CSS classes for checkboxes
	// ...
	// they can also take a hike, by the way
	// and never come back!
}
```

### .removeClass(class)

| Argument | Type |
| class | `string` |

Removes the class `class` from all selected elements.

```javascript
function example() {
	$('body').removeClass('js-disabled')
	// the body element no longer has the
	// `js-disabled` class
}
```

### .empty()

Empties all selected elements, removing all children.

```javascript
function example() {
	$('body').empty()
	// the page is now blank (unless you have stuff
	// in the head, or your CSS is doing something
	// weird). you happy?
}
```

### .attr(key, value)

| Argument | Type |
| key | `string` |
| value | `any` |

Sets the attribute `key` to `value`.

```javascript
function example() {
	$('<a>').attr('href', 'https://www.google.com')
		.attr('target', '_blank')
		.insertLast($('body'))
	// creates a link that opens a new tab to Google
	// and appends it to the body
}
```

### .getAttr(key)

| Argument | Type |
| key | `string` |

Returns the content of attribute `key` on the first selected element.

```javascript
function example() {
	console.log($('body').getAttr('data-kdfhkk'))
	// this makes sense to me
}
```

### .removeAttr(key)

| Argument | Type |
| key | `string` |

Removes the attribute `key` from all selected elements.

```javascript
function example() {
	console.log($('body').removeAttr('data-kdfhkk'))
	// nevermind, get rid of it, nobody needs this
}
```

### .parent()

Replaces every element in the current selection with its parent element.

```javascript
function example() {
	$('body').parent()
	// <html> element, unless your page has a weird,
	// weird structure, in which case... what?
}
```

### .offset()

Returns the `getBoundingClientRect` of the first element in the selection.

```javascript
function example() {
	// I gotta be honest, I don't know what use this
	// has, so I don't have any example, but you get
	// the idea I hope
}
```

### .sel()

Returns the current selection in its entirety.

```javascript
function example() {
	$('div').sel() // returns all div elements
}
```