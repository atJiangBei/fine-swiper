import { Options } from './../type/index'
import SlideSwiper from './slide-swiper'
import FineFideSwiper from './fade-swiper'
import createTouch from './createTouch'
const createSlideSwiper = (options: Options): SlideSwiper => {
  return new SlideSwiper(options)
}
const cresteFadeSwiper = (options: Options): FineFideSwiper => {
  return new FineFideSwiper(options)
}


export default {
  createSlideSwiper,
  cresteFadeSwiper,
}
console.log(createTouch)