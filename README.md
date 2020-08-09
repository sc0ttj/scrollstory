# ScrollStory

A tiny (~770 bytes) JavaScript library for creating animations that synchronize with
page scrolling. It uses `requestAnimationFrame` to check the scroll status and
trigger scrollytelling events.

[![npm version](https://badge.fury.io/js/%40scottjarvis%2Fscrollstory.svg)](https://badge.fury.io/js/%40scottjarvis%2Fscrollstory) [![Dependency Status](https://david-dm.org/sc0ttj/scrollstory.svg)](https://david-dm.org/sc0ttj/scrollstory) [![devDependencies Status](https://david-dm.org/sc0ttj/scrollstory/dev-status.svg)](https://david-dm.org/sc0ttj/scrollstory?type=dev) [![Node version](https://badgen.net/npm/node/@scottjarvis/scrollstory)](http://nodejs.org/download/) [![Build Status](https://travis-ci.org/sc0ttj/scrollstory.svg?branch=master)](https://travis-ci.org/sc0ttj/scrollstory) [![bundle size](https://badgen.net/bundlephobia/minzip/@scottjarvis/scrollstory?color=green&label=gzipped)](https://badgen.net/bundlephobia/minzip/@scottjarvis/scrollstory) [![Downloads](https://badgen.net/npm/dt/@scottjarvis/scrollstory)](https://badgen.net/npm/dt/@scottjarvis/scrollstory)

Check out the mobile-friendly [examples](./examples/) that can be used as templates.

Before going over the [usage and API](#usage-api), let's establish a vocabulary.

<dl>
    <dt>container</dt>
    <dd>
        The outermost DOM element of concern for a single scrollstory.
        Style must include <code>overflow-y: scroll</code> and
        <code>position: relative</code>.
    </dd>
    <dt>guideline</dt>
    <dd>
        An invisible line stretched horizontally over the middle of the
        container that does not scroll with its content. As panels cross the
        guideline they trigger scrollstory events (`enter`, `exit`, `progress`).
    </dd>
    <dt>scene</dt>
    <dd>
        One of several block-level DOM elements that form a scrollytelling
        sequence. Scenes trigger scrollstory events as they cross the guideline.
        The <i>active scene</i> is the scene that currently overlaps the
        guideline.
    </dd>
    <dt>progress value</dt>
    <dd>
        Percentage in [0,1] that represents the vertical position of the active
        scene relative to the guideline. When the top of the scene aligns with
        the guideline, the progress value is 0. When the bottom of the scene
        aligns with the guideline, the progress value is 1.
    </dd>
    <dt>story</dt>
    <dd>
        The context for a scrollstory animation. Corresponds to a specific
        container element.
    </dd>
</dl>

## Installation

### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/scrollstory"></script>
<script>
  // use it here
</script>
```

### In NodeJS:

Install it:

```
npm i @scottjarvis/scrollstory
```

Then import it into your project:

```js
import ScrollStory from "@scottjarvis/scrollstory";
```

## Usage (API)

Just create a `ScrollStory` object and pass in a config object.

The config contains event handlers and elements. The only two
required fields are `container` (which should select a single DOM
element) and `scenes` (which should be a NodeList or Array of several DOM elements). 

Here's an example:

```js
var story = new ScrollStory({
    container: document.querySelector(".container"),
    scenes: document.querySelectorAll(".scene"),
    // Define what happens on "enter", "progress" and "exit" of scenes
    enter: data => console.log(data),
    progress: data => console.log(data),
    exit: data => console.log(data),
});
```

Note, the `data` param passed into `enter`, `exit` and `progress` will contain stuff like this:

```js
{ 
  scene: 1,
  element: <scene elem>, 
  progress: 0.809890765659, 
  direction: "down" 
}
```

To make a useful story, you'll probably want to do something useful in
`enter`, `progress` and `exit` callbacks, which are triggered when a scene crosses in or out of the guideline.

For continuous-style scrollytelling, you can provide a `progress` calback which
is triggered every time the progress value changes or the active scene changes.

See [examples/basic-usage.html](examples/basic-usage.html).

Putting your code in the `progress` handler saves power on mobile devices because it only does work when the scroll position changes.

## Custom render loops

Additionally, the `ScrollStory` object exposes a few methods:

```ts
/**
 * Returns the zero-based index of the panel that is currently overlapping
 * the guideline. Returns -1 if no such panel exists.
 */
getActivePanelIndex(): number;

/**
 * Returns a percentage in the range [0, 1] that represents the position of
 * the active panel relative to the guideline. Returns 0 when the top of the
 * panel aligns with the guideline, +1 when the bottom of the panel aligns
 * with the guideline, and -1 if no panel is overlapping the guideline.
 */
getProgressValue(): number;

```

The above methods provide a way of using the library if you'd like to avoid the
event handlers and instead create your own render loop that polls the status of
the story.

## Issues

Because of its focus on mobile platforms, currently scrollstory does
not gracefully handle situations where the container is resized by the user
(e.g. if the container expands to fill a browser window). This may be fixed in
the future.

## Credits

Based on [google/scrollytell](https://github.com/google/scrollytell/). 

## Changelog

**v1.0.0**

Started with [google/scrollytell](https://github.com/google/scrollytell/), then:

- made more portable: removed internal calls to `document.querySelector`
  - you must now pass in the elements to the config, not the selectors:
    - `config.container` (elem) replaces `config.containerSelector` (string)
    - `config.scenes` (NodeList) replaces `config.panelSelector` (string)
- simplified: removed "chart" stuff, and fullscreenChart stuff:
  - use only "scenes" for defining/dividing scroll content
- simplified CSS used in examples (see [basic-usage.html](./examples/basic-usage.html))
- simplfied: renamed callbacks available in config:
  - `enterHandler()` => `enter()`
  - `exitHandler()` => `exit()`
  - `progressHandler()` => `progress()`
- improved the data/object passed to the callbacks, so each receives:
  - `{ scene, element, progress, direction }`
- removed developer HUD / debug console (just console log `d` in callbacks instead)

## Alternative projects

- [google/scrollytell](https://github.com/google/scrollytell/) - tiny mobile-friendly scrollytelling library, uses [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [scrollama](https://github.com/russellgoldenberg/scrollama) - uses [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) in favor of scroll events
- [scroller](https://github.com/rdmurphy/scroller) - a super tiny library for scrollytelling, uses [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
