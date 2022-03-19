export type Root = HTMLElement;
//方向
export type direction = 'horizontal' | 'vertical';
//轮播的类型
export type effect = 'slide' | 'fade';
export type timer = null | number;
//配置项
export interface Options {
  root: Root;
  direction: direction;
  loop: boolean;
  auto: boolean;
  delayed: number;
  effect: effect;
  callback: Function;
  enter: Function;
  disabledHand: boolean;
  index: number;
  scaleValue: number;
  slideChange: (index: number) => void;
}
