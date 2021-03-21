import Swiper from './swiper'
import { Options, timer } from './../type/index'
import { time } from './../util/index'
const scale: number = 30 / 375

class FineSlideSwiper extends Swiper {
  private speed: number
  private _start: (event: Event) => void
  private _move: (event: Event) => void
  private _end: (event: Event) => void
  constructor(props: Options) {
    super(props)
    const scaleSize = this.scaleSize
    this.speed = Math.ceil(scale * scaleSize)
    this.initSetIndex(props.index)
    this.isLoop()
    if (this.auto) {
      this.timer = this.setInterval()
    }
    this._start = ev => {
      this.start(ev)
    }
    this._move = ev => {
      this.move(ev)
    }
    this._end = ev => {
      this.end(ev)
    }
    this.slider.addEventListener('touchstart', this._start, this.will)
    this.slider.addEventListener('touchmove', this._move, this.will)
    this.slider.addEventListener('touchend', this._end, this.will)
    this.slider.addEventListener('touchcancel', this._end, this.will)
    this.slider.addEventListener('mousedown', this._start, this.will)
    this.slider.addEventListener('mousemove', this._move, this.will)
    this.slider.addEventListener('mouseup', this._end, this.will)
  }
  _visibilitychange() {
    if (document.hidden) {
      this.clear()
    } else {
      if (this.auto) {
        this.timer = this.setInterval()
      }
    }
  }
  private isLoop() {
    const children = this.children
    const length = this.length
    if (this.loop) {
      const first: Node = children[0].cloneNode(true)
      const last: Node = children[length - 1].cloneNode(true)
      this.slider.appendChild(first)
      this.slider.insertBefore(last, children[0])
    }
  }
  private initSetIndex(index: number) {
    index = Math.min(Math.abs(index), this.length - 1)
    if (this.loop) {
      this.defaultIndex = -(index + 1)
    } else {
      this.defaultIndex = -index
    }
    this.slideMove(this.defaultIndex * this.scaleSize)
    this.index = index
  }
  public setInterval(): timer {
    return window.setInterval(this.aotoplay.bind(this), this.delayed)
  }
  private start(ev) {
    const e = ev || event
    if (e.type === 'mousedown') {
      //On the PC side, default events are disabled in MouseDown events
      //For example, there are jump links in sliding elements, and if default events are not prohibited, jumps are made.
      //360 Browser
      e.preventDefault()
    }
    const touches = e.touches
    const target = touches ? touches[0] : e
    const { direction, disabledHandSlideing } = this
    this.startingPoint =
      direction === 'horizontal' ? target.clientX : target.clientY
    this.startTime = time()
    this.isTracking = true
    this.captureClick = false
    if (disabledHandSlideing) return
  }
  private move(ev) {
    if (!this.isTracking) {
      //Disabled sliding after loosening the mouse
      return
    }
    const e = ev || event
    if (e.type === 'mousemove') {
      this.captureClick = true
    }
    //Default events are prohibited when sliding events occur on the mobile side(For example, click events)
    e.preventDefault()
    const { disabledHandSlideing, direction } = this
    if (disabledHandSlideing) return
    const touches = e.changedTouches
    const target = touches ? touches[0] : e
    const moved =
      direction === 'horizontal'
        ? target.clientX - this.startingPoint
        : target.clientY - this.startingPoint
    this.clear()
    this.slideProcess(moved + this.defaultIndex * this.scaleSize, moved)
  }
  end(ev) {
    if (!this.isTracking) {
      return
    }
    this.isTracking = false
    if (this.disabledHandSlideing) return
    const e = ev || event
    const touches: Array<object> = e.changedTouches
    const target = touches ? touches[0] : e
    let moved: number =
      this.direction === 'horizontal'
        ? target.clientX - this.startingPoint
        : target.clientY - this.startingPoint
    if (Math.abs(moved) === 0) {
      return
    }
    const duration: number = time() - this.startTime
    const toNext: boolean =
      Math.abs(moved) > this.scaleSize / 2 || duration < 300
    const loop: boolean = this.loop
    const length: number = this.length
    const noLoopMinDefaultIndex: number = -(this.length - 1)
    const loopMinDefaultIndex: number = -(this.length + 1)
    const speed: number = this.speed
    const oldIndex: number = this.defaultIndex
    let bufferSpeed: number = speed
    const scaleIndex = moved > 0 ? 1 : -1
    const maxDefaultIndex = 0
    if (loop) {
      let nowDistance: number = oldIndex * this.scaleSize + moved
      if (toNext) {
        this.defaultIndex += scaleIndex
        if (moved > 0) {
          if (this.defaultIndex > 0) {
            this.defaultIndex = 0
          }
        } else {
          if (Math.abs(this.defaultIndex) > Math.abs(loopMinDefaultIndex)) {
            this.defaultIndex = loopMinDefaultIndex
          }
        }
      } else {
        //Do nothing
      }
      this.numericalConversion(this.defaultIndex)
      const targetDistance: number = this.defaultIndex * this.scaleSize
      this.startMove(nowDistance, targetDistance, bufferSpeed, (n: number) => {
        this.slideMove(n)
      }).then(() => {
        if (this.defaultIndex <= loopMinDefaultIndex) {
          //1，Solution in Cycle
          //2，Slide from the first to the first
          //3，The problem of momentary blankness caused by stopping manual sliding and triggering the timer
          this.defaultIndex = -1
          this.slideMove(this.defaultIndex * this.scaleSize)
        }
        if (this.defaultIndex >= 0) {
          this.defaultIndex = -length
          this.slideMove(this.defaultIndex * this.scaleSize)
        }
        this.enter(this.index)
        if (this.auto) {
          this.clear()
          this.timer = this.setInterval()
        }
      })
    } else {
      if (toNext) {
        if (moved > 0) {
          //1 = scaleIndex
          if (this.defaultIndex < 0) {
            this.defaultIndex += scaleIndex
          } else {
            moved /= 3
          }
        } else {
          //scaleIndex   -1
          if (Math.abs(this.defaultIndex) < Math.abs(noLoopMinDefaultIndex)) {
            this.defaultIndex += scaleIndex
          } else {
            moved /= 3
          }
        }
      } else {
        const distance = this.defaultIndex * this.scaleSize + moved
        const max = this.scaleSize * noLoopMinDefaultIndex
        if (distance > 0) {
          moved /= 3
        } else {
          if (distance < max) {
            moved /= 3
          }
        }
      }
      this.numericalConversion(this.defaultIndex)
      let nowDistance: number = oldIndex * this.scaleSize + moved
      const targetDistance: number = this.defaultIndex * this.scaleSize
      this.startMove(nowDistance, targetDistance, bufferSpeed, (n: number) => {
        this.slideMove(n)
      }).then(() => {
        this.enter(this.index)
        if (this.auto) {
          this.clear()
          this.timer = this.setInterval()
        }
      })
    }
  }
  private slideProcess(distance: number, moved: number) {
    if (!this.loop) {
      if (distance >= 0) {
        distance /= 3
        this.slideMove(distance)
      } else {
        const max: number = this.length - 1
        if (distance <= this.scaleSize * -max) {
          moved /= 3
          distance = this.scaleSize * -max + moved
        }
        this.slideMove(distance)
      }
      return
    }
    if (distance >= 0) {
      this.defaultIndex = -this.length
      this.slideMove(this.defaultIndex * this.scaleSize)
    } else if (distance <= -((this.length + 1) * this.scaleSize)) {
      this.defaultIndex = -1
      this.slideMove(this.defaultIndex * this.scaleSize)
    } else {
      this.slideMove(distance)
    }
  }
  private numericalConversion(index: number): void {
    // defaultIndex Convert to index
    let num: number
    if (this.loop) {
      switch (index) {
        case -1:
        case -(this.length + 1):
          num = 0
          break
        case 0:
          num = this.length - 1
          break
        default:
          num = Math.abs(index) - 1
          break
      }
      if (num !== this.index) {
        this.index = num
      }
      this.callback(this.index)
    } else {
      num = Math.abs(index)
      if (num !== this.index) {
        this.index = num
        this.callback(this.index)
      }
    }
  }
  moveTo(index: number): void {
    this.clear()
    index = Math.abs(index)
    const loopMinDefaultIndex: number = -(this.length + 1)
    const min: number = this.length - 1
    const speed: number = this.speed
    if (index > min) {
      index = min
    }
    const oldIndex: number = this.index
    const newIndex: number = (this.index = index)
    const length: number = this.length
    const oldDefaultIndex = this.defaultIndex
    if (oldIndex === newIndex) return

    if (this.loop) {
      if (index === min) {
        index = -length
        const nowDistance: number = this.defaultIndex * this.scaleSize
        const targetDistance: number = index * this.scaleSize
        this.defaultIndex = index
        this.numericalConversion(this.defaultIndex)
        const s =
          Math.abs(oldIndex - Math.abs(this.defaultIndex)) * speed < 100
            ? 100
            : Math.abs(oldIndex - Math.abs(this.defaultIndex)) * speed

        this.startMove(nowDistance, targetDistance, s, (n: number) => {
          this.slideMove(n)
        }).then(() => {
          if (this.defaultIndex <= loopMinDefaultIndex) {
            //1，Solution in Cycle
            //2，Slide from the first to the first
            //3，The problem of momentary blankness caused by stopping manual sliding and triggering the timer
            this.defaultIndex = -1
            this.slideMove(this.defaultIndex * this.scaleSize)
          }
          if (this.defaultIndex >= 0) {
            this.defaultIndex = -length
            this.slideMove(this.defaultIndex * this.scaleSize)
          }
          this.enter(this.index)
          if (this.auto) {
            this.clear()
            this.timer = this.setInterval()
          }
        })
        return
      }
      if (index === 0) {
        if (this.defaultIndex === loopMinDefaultIndex) {
          this.defaultIndex = -1
          this.slideMove(this.defaultIndex * this.scaleSize)
          return
        }
      }
      index = -index - 1

      const nowDistance = this.defaultIndex * this.scaleSize
      const targetDistance = index * this.scaleSize
      this.defaultIndex = index
      const disparity: number = Math.max(
        Math.abs(oldIndex - Math.abs(this.defaultIndex)),
        3
      )
      const s: number = disparity * speed
      this.numericalConversion(this.defaultIndex)
      this.startMove(nowDistance, targetDistance, s, (n: number) => {
        this.slideMove(n)
      }).then(() => {
        if (this.defaultIndex <= loopMinDefaultIndex) {
          //1，Solution in Cycle
          //2，Slide from the first to the first
          //3，The problem of momentary blankness caused by stopping manual sliding and triggering the timer
          this.defaultIndex = -1
          this.slideMove(this.defaultIndex * this.scaleSize)
        }
        if (this.defaultIndex >= 0) {
          this.defaultIndex = -length
          this.slideMove(this.defaultIndex * this.scaleSize)
        }
        this.enter(this.index)
        if (this.auto) {
          this.clear()
          this.timer = this.setInterval()
        }
      })
    } else {
      index = -index
      const disparity: number = Math.max(
        Math.abs(oldIndex - Math.abs(index)),
        3
      )
      const s: number = disparity * speed
      const nowDistance: number = this.defaultIndex * this.scaleSize
      const targetDistance: number = index * this.scaleSize
      this.defaultIndex = index
      this.callback(Math.abs(index))
      this.startMove(nowDistance, targetDistance, s, (n: number) => {
        this.slideMove(n)
      }).then(() => {
        if (this.defaultIndex <= loopMinDefaultIndex) {
          //1，Solution in Cycle
          //2，Slide from the first to the first
          //3，The problem of momentary blankness caused by stopping manual sliding and triggering the timer
          this.defaultIndex = -1
          this.slideMove(this.defaultIndex * this.scaleSize)
        }
        if (this.defaultIndex >= 0) {
          this.defaultIndex = -length
          this.slideMove(this.defaultIndex * this.scaleSize)
        }
        this.enter(this.index)
        if (this.auto) {
          this.clear()
          this.timer = this.setInterval()
        }
      })
    }
  }
  private aotoplay() {
    const speed: number = this.speed
    const startplay = (): void => {
      const oldIndex: number = this.defaultIndex
      const loopMinDefaultIndex: number = -(this.length + 1)
      this.defaultIndex += -1
      if (this.loop) {
        if (this.defaultIndex <= loopMinDefaultIndex) {
          this.defaultIndex = loopMinDefaultIndex
        }
      } else {
        if (this.defaultIndex <= -this.length) {
          this.defaultIndex = 0
        }
      }
      this.numericalConversion(this.defaultIndex)
      let newSpeed: number =
        (speed * Math.abs(Math.abs(oldIndex) - Math.abs(this.defaultIndex))) / 2
      const nowDistance: number = oldIndex * this.scaleSize
      const targetDistance: number = this.defaultIndex * this.scaleSize
      this.startMove(nowDistance, targetDistance, newSpeed, (n: number) => {
        this.slideMove(n)
      }).then(() => {
        this.enter(this.index)
        if (this.loop) {
          if (this.defaultIndex <= loopMinDefaultIndex) {
            this.defaultIndex = -1
            this.slideMove(this.defaultIndex * this.scaleSize)
          }
        }
      })
    }
    return startplay()
  }
  private slideMove(distance: number): void {
    const direction: string = this.direction
    const slider = this.slider
    if (direction === 'horizontal') {
      slider['style']['transform'] = 'translate3d(' + distance + 'px,0,0)'
    }
    if (direction === 'vertical') {
      slider['style']['transform'] = 'translate3d(0,' + distance + 'px,0)'
    }
    slider['style'].transition = null
  }
  destroy() {
    this.clear()
    this.slider.removeEventListener('touchstart', this._start, this.will)
    this.slider.removeEventListener('touchmove', this._move, this.will)
    this.slider.removeEventListener('touchend', this._end, this.will)
    this.slider.removeEventListener('mousedown', this._start, this.will)
    this.slider.removeEventListener('mousemove', this._move, this.will)
    this.slider.removeEventListener('mouseup', this._end, this.will)
    this.slider.removeEventListener('click', this._closeDefault, true)
    document.addEventListener('visibilitychange', this._visibilitychange)
  }
}

export default FineSlideSwiper
