import { direction, effect, timer, Options } from './../type/index'
import { noop } from './../util/index'
const fadeFloat: number = 0.05

class FineSwiper {
  public root: Element
  public direction: direction
  public loop: boolean
  public auto: boolean
  public delayed: number
  public startTime: number
  public callback: Function
  public enter: Function
  public startingPoint: number
  public isTracking: boolean
  public captureClick: boolean
  public disabledHandSlideing: boolean
  public timer: timer
  public defaultIndex: number
  public slider: Element
  public children: HTMLCollection
  public length: number
  public scaleSize: number
  public index: number
  public will: boolean
  public scaleWidth: number
  public scaleHeight: number
  public _closeDefault: (event: Event) => void
  constructor(options: Options) {
    this.root = options.root
    this.direction = options.direction
    this.loop = options.loop
    this.auto = options.auto
    this.delayed = options.delayed
    this.startTime = 0
    this.callback = options.callback || noop
    this.enter = options.enter || noop
    this.startingPoint = 0
    this.isTracking = false
    this.captureClick = false
    this.disabledHandSlideing = !!options.disabledHand
    this.timer = null
    this.defaultIndex = this.loop ? -1 : 0
    this.slider = this.root.children[0]
    this.children = this.slider.children
    const children: HTMLCollection = this.children
    this.length = children.length
    const firstElement: Element = children[0]
    const { width, height } = firstElement.getBoundingClientRect()
    this.scaleWidth = width
    this.scaleHeight = height
    this.scaleSize = this.direction === 'horizontal' ? width : height
    this._closeDefault = ev => {
      this.closeDefault(ev)
    }
    this.slider.addEventListener('click', this._closeDefault, true)

    document.addEventListener(
      'visibilitychange',
      this._visibilitychange.bind(this)
    )
  }
  private closeDefault(ev) {
    const e = ev || event
    if (this.captureClick) {
      //On the PC side, default events are disabled in MouseDown events
      //For example, there are jump links in sliding elements, and if default events are not prohibited, jumps are made.
      e.preventDefault()
      //In the event capture phase,
      //When the mouse slides
      //Prohibit click events to extend inward
      e.stopPropagation()
    }
  }
  public _visibilitychange() {}
  public clear() {
    window.clearInterval(this.timer)
  }
  public startMove(
    nowDistance: number,
    targetDistance: number,
    speed: number | any = 30,
    cb: Function
  ) {
    let n: number = nowDistance
    const t: number = targetDistance
    let signal: Function
    const pro = new Promise(res => (signal = res))
    const step = () => {
      if (n < t) {
        n += speed
        if (n >= t) {
          n = t
        }
      } else if (n > t) {
        n -= speed
        if (n <= t) {
          n = t
        }
      }
      cb(n)
      if (nowDistance > targetDistance) {
        if (n > t) {
          window.requestAnimationFrame(step)
        } else {
          signal()
        }
      }
      if (nowDistance < targetDistance) {
        if (n < t) {
          window.requestAnimationFrame(step)
        } else {
          signal()
        }
      }
    }
    window.requestAnimationFrame(step)
    return pro
  }
}

export default FineSwiper
