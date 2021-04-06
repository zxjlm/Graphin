import { IconLoader } from '../typings/type';
import { error } from '../utils/debug';

/**
 * 注册Font Family
 *
 * @export
 * @param {IconLoader} iconLoader
 * @returns
 */
export default function registerFontFamily(iconLoader: IconLoader) {
  const iconFont = iconLoader();
  const { glyphs, fontFamily } = iconFont;
  const icons = glyphs.map(item => {
    return {
      name: item.name,
      unicode: String.fromCodePoint(item.unicode_decimal),
    };
  });

  return new Proxy(icons, {
    get: (target, propKey: string) => {
      const matchIcon = target.find(icon => {
        return icon.name === propKey;
      });
      if (!matchIcon) {
        error('font')(`fontFamily:${fontFamily},does not found ${propKey} icon`);
        return '';
      }
      return matchIcon?.unicode;
    },
  });
}
