// REVIEW 感觉这个页面塞的东西有点多，可以考虑拆分一下。

import Graphin from './Graphin';
import GraphinContext, { GraphinContextType } from './GraphinContext';
import Utils from './utils';
import Layout from './layout';
import Behaviors from './behaviors';
import registerGraphinForce from './layout/inner/registerGraphinForce';
import registerPresetLayout from './layout/inner/registerPresetLayout';
import { registerGraphinCircle, registerGraphinLine } from './shape';
/** export type */
export { NodeStyle, EdgeStyle, GraphinData, GraphinTreeData } from './typings/type';
// REVIEW 只暴露GraphinContext不行么？为什么这里要单独暴露GraphinContextType ?
export { GraphinContextType };

/** 注册 Graphin force 布局 */
registerGraphinForce();
/** 注册 Graphin preset 布局 */
registerPresetLayout();

/** 注册 Graphin Circle Node */
registerGraphinCircle();

/** 注册 Graphin line Edge */
registerGraphinLine();

/** 解构静态方法 */
const { registerFontFamily } = Graphin;

/** export */
export default Graphin;
// REVIEW 这里暴露的几个类最好给一下TS说明。另外registerFontFamily与其他几个形式不一样，有点强迫症
export { Utils, Layout, GraphinContext, Behaviors, registerFontFamily };

export {
  /** export G6 */
  default as G6,
  /** export G6 Type  */
  Graph,
  // REVIEW: 这里为什么又是以Graph开头？
  IG6GraphEvent,
  // REVIEW GraphData 和 GraphinData的区别是什么，以及NodeConfig/EdgeConfig/NodeStyle,EdgeStyle是什么？
  // 感觉最好不要把这些信息暴露出来，或者只暴露GraphinData, 或者通过namespace的方式区分是G6的TS类型定义，还是Graphin的
  GraphData,
  TreeGraphData,
  NodeConfig,
  EdgeConfig,
} from '@antv/g6';

// REVIEW 消灭any, 考虑使用Generics来替代
export interface GraphEvent extends MouseEvent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any;
}
