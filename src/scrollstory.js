/**
 * Copyright Google. Apache License. Modified by sc0ttj:
 *
 * - removed calls to document.querySelector
 *   - config.container (elem) replaces config.containerSelector (string)
 *   - config.scenes (NodeList) replaces config.panelSelector (string)
 * - removed "chart" stuff, and fullscreenChart stuff:
 *  - use only scenes for defining/dividing scroll content
 * - renamed callbacks available in config:
 *   - enterHandler() => enter()
 *   - exitHandler() => exit()
 *   - progressHandler() => progress()
 * - improved the data/object passed to the callbacks, so each receives:
 *   - { scene, element, progress, direction }
 * - simplified CSS used in example (see scrollytell.html)
 *
 * Usage:
 *
 *  import ScrollStory from "./scrollstory.js";
 *
 *  var story = new ScrollStory({
 *      container: document.querySelector(".container"),
 *      scenes: document.querySelectorAll(".container p"),
 *      debug: false, // true to show panel with scroll info
 *      // define what happens on "enter", "progress" and "exit" of scenes
 *      enter: d => d,
 *      exit: d => d,
 *      progress: d => d,
 *  });
 *
 */

/**
 * The context for all animation corresponding to a container element.
 */
function ScrollStory(config) {
  this.config = config
  this.activeSceneIndex = -1
  this.progressValue = -1
  this.frameCount = 0
  this.prevScrollPos = 0
  this.container = config.container
  if (!this.container) {
    throw Error("container not found.")
  }
  const cstyle = window.getComputedStyle(this.container)
  this.container.style.overflowY = "scroll"
  this.container.style.position = "relative"
  this.scenes = config.scenes
  if (!this.scenes) {
    throw Error("'scenes' not found.")
  }

  /**
   * @returns {boolean} If true, the page is scrolling down
   */

  this.isScrollingDown = function() {
    const currentOffset = this.scrollTop || this.container.scrollTop
    const isScrollingDown = currentOffset > this.prevScrollPos
    this.prevScrollPos = currentOffset
    return isScrollingDown
  }

  this.render = function() {
    // Take care not to do work if no scrolling has occurred. This is an
    // important optimization because it can save power on mobile devices.
    const scrollTop = this.container.scrollTop
    if (scrollTop === this.scrollTop) {
      window.requestAnimationFrame(this.tick)
      return
    }
    this.scrollTop = scrollTop
    // Determine the guideline Y coordinate.
    const cbox = this.container.getBoundingClientRect()
    const guideline = (cbox.top + cbox.bottom) / 2
    // Determine the active scene and progress value.
    const prevActiveScene = this.activeSceneIndex
    const prevProgressValue = this.progressValue
    this.activeSceneIndex = -1
    this.progressValue = -1
    for (const [index, scene] of this.scenes.entries()) {
      const pbox = scene.getBoundingClientRect()
      const outside = pbox.top > guideline || pbox.bottom < guideline
      const active = !outside
      const ratio = (guideline - pbox.top) / pbox.height
      if (active) {
        this.activeSceneIndex = index
        this.progressValue = ratio
        break
      }
    }
    const sceneChanged = prevActiveScene !== this.activeSceneIndex
    const progressChanged = prevProgressValue !== this.progressValue
    const scrollDirection = this.isScrollingDown() ? "down" : "up"

    // Trigger scrollytelling events.
    if (sceneChanged) {
      if (this.config.exit && this.scenes[prevActiveScene]) {
        this.config.exit({
          scene: prevActiveScene,
          element: this.scenes[prevActiveScene],
          progress: this.progressValue,
          direction: scrollDirection
        })
      }
      if (this.config.enter && this.scenes[this.activeSceneIndex]) {
        this.config.enter({
          scene: this.activeSceneIndex,
          element: this.scenes[this.activeSceneIndex],
          progress: this.progressValue,
          direction: scrollDirection
        })
      }
    }
    // Do not update the frame count when scrolling between scenes (i.e.
    // when there is no active scene).
    if (progressChanged || sceneChanged) {
      this.frameCount += 1
      if (this.config.progress && this.scenes[this.activeSceneIndex]) {
        this.config.progress({
          scene: this.activeSceneIndex,
          element: this.scenes[this.activeSceneIndex],
          progress: this.progressValue,
          direction: scrollDirection
        })
      }
    }
    window.requestAnimationFrame(this.tick)
  }

  this.tick = this.render.bind(this)
  window.requestAnimationFrame(this.tick)

  /**
   * Returns the zero-based index of the scene that is currently overlapping
   * the guideline. Returns -1 if no such scene exists.
   */
  this.getActiveSceneIndex = function() {
    return this.activeSceneIndex
  }

  /**
   * Returns a percentage in the range [0, 1] that represents the position of
   * the active scene relative to the guideline. Returns 0 when the top of the
   * scene aligns with the guideline, +1 when the bottom of the scene aligns
   * with the guideline, and -1 if no scene is overlapping the guideline.
   */
  this.getProgressValue = function() {
    return this.progressValue
  }

  /**
   * Forces a re-assessment of the active scene index and progress value. Also forces
   * the progress handler to trigger on the subsequent frame.
   */
  this.refresh = function() {
    this.scrollTop = undefined
    this.activeSceneIndex = -2
  }
}

export default ScrollStory
