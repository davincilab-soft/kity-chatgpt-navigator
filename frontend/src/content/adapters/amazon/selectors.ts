export class AmazonSelectors {
  static getScrollContainer(): Element | null {
    return document.scrollingElement || document.documentElement || document.body;
  }

  static getMain(): Element | null {
    return document.querySelector('#search') || document.querySelector('#dp');
  }
}
