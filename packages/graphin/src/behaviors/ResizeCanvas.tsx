import { debounce } from '@antv/util';
import * as React from 'react';
import GraphinContext from '../GraphinContext';

/**
 * 监听窗口Resize Props
 *
 * @export
 * @interface ResizeCanvasProps
 */
export interface ResizeCanvasProps {
  target: HTMLDivElement | null;
}

/**
 * 监听窗口Resize
 *
 * @param {ResizeCanvasProps} props
 * @returns
 */
function ResizeCanvas(props: ResizeCanvasProps) {
  const { target } = props;
  const graphin = React.useContext(GraphinContext);
  React.useEffect(() => {
    if (!props.target) return;
    const onResize = debounce(() => {
      const { clientWidth, clientHeight } = target as HTMLDivElement;

      graphin.graph.set('width', clientWidth);
      graphin.graph.set('height', clientHeight);

      const canvas = graphin.graph.get('canvas');
      if (!canvas) return;

      canvas.changeSize(clientWidth, clientHeight);
      graphin.graph.autoPaint();
    }, 200);
    window.addEventListener('resize', onResize, false);
    return () => {
      window.removeEventListener('resize', onResize, false);
    };
  }, [target]);

  return null;
}

export default ResizeCanvas;
