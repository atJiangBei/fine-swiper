<p align="center"><img width="150" src="http://jiangbei.online/images/fine-logo.svg"/></p>

<h2 align="center">fine-swiper</h2>
<p align="center">
<img src="https://img.shields.io/github/stars/atJiangBei/fine-swiper.svg"/>
<img src="https://img.shields.io/github/forks/atJiangBei/fine-swiper.svg"/>
</p>
<p  align="center">fine-swiper is the implementation of a JavaScript carousel graph. It supports both mobile H5 and PC. Of course, you can also implement components based on any other JavaScript framework based on this library</p>

```javascript
import { createSlide } from 'fine-swiper';

createSlide({
  root: document.querySelector('#root-0'),
  loop: true,
  slideChange(index) {
    console.log(index);
  },
});
createSlide({
  root: document.querySelector('#root-1'),
  loop: false,
  direction: 'vertical',
  slideChange(index) {
    console.log(index);
  },
});
createSlide({
  root: document.querySelector('#root-2'),
  loop: false,
  scaleValue: 300,
  slideChange(index) {
    console.log(index);
  },
});
```

## 🔗 Links

- [Home page](https://jiangbei.online/fine-swiper/)
- [Github](https://github.com/atJiangBei/fine-swiper)
- [Fine True](https://jiangbei.online/fine-true)
