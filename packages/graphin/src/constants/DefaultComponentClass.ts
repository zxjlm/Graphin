import BrushSelect from '../behaviors/BrushSelect';
import ClickSelect from '../behaviors/ClickSelect';
import DragCanvas from '../behaviors/DragCanvas';
import DragCombo from '../behaviors/DragCombo';
import DragNode from '../behaviors/DragNode';
import ZoomCanvas from '../behaviors/ZoomCanvas';

/** Graphin默认加载组件 */
export default [
  DragCanvas, // 画布拖拽
  ZoomCanvas, // 画布缩放
  DragNode, // 节点拖拽
  DragCombo, // Combo拖拽
  ClickSelect, // 点击选择
  BrushSelect, // 节点框选
];
