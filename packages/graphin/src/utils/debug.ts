/**
 * 默认Debug颜色
 */
const CONSOLE_COLOR = {
  ERROR: '#FF3D3D',
  WARNING: '#FFA40F',
  INFO: '#00C1DE',
  DEBUG: '#0076FF',
};

/**
 * 判断当前执行环境
 *
 * @returns
 */
function isInDevelopmentMode() {
  return process.env.NODE_ENV === 'development';
}

/**
 * 日志输出
 *
 * @param {keyof typeof CONSOLE_COLOR} type
 * @param {string} module
 * @param {({
 *     mode: 'develop' | 'all',
 *   })} [options={
 *     mode: 'develop'
 *   }]
 * @returns
 */
function print(
  type: keyof typeof CONSOLE_COLOR,
  module: string,
  options: {
    mode: 'develop' | 'all';
  } = {
    mode: 'develop',
  },
) {
  const style = `color:  ${CONSOLE_COLOR[type]}; font-style:italic ;padding: 2px;font-weight:700`;
  return (print: Console['debug'] | Console['error'] | Console['info'] | Console['log']) => (...message: unknown[]) => {
    if (options.mode === 'develop' && !isInDevelopmentMode()) return;
    print(`Graphin[%c${module}]`, style, ...message);
  };
}

/**
 * debug
 *
 * @export
 * @param {string} module
 * @returns
 */
export function debug(module: string) {
  return print('DEBUG', module)(console.debug);
}

/**
 * log
 *
 * @param module
 * @returns
 */
export function log(module: string) {
  return print('INFO', module)(console.log);
}

/**
 * warn
 *
 * @export
 * @param {string} module
 * @returns
 */
export function warn(module: string) {
  return print('WARNING', module, { mode: 'all' })(console.warn);
}

/**
 * error
 *
 * @export
 * @param {string} module
 * @returns
 */
export function error(module: string) {
  return print('ERROR', module, { mode: 'all' })(console.error);
}
