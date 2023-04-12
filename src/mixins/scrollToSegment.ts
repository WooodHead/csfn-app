import {DirectiveOptions} from 'vue'

export const scrollToSegment: DirectiveOptions = {
  inserted(el: HTMLElement) {
    el.addEventListener('click', () => el.scrollIntoView())
  }
}