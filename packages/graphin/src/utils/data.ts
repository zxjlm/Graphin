import { TREE_LAYOUTS } from '../consts';
import { GraphinData, GraphinTreeData, Layout } from '../typings/type';

/**
 * 是否为Tree模式
 *
 * @export
 * @param {GraphinTreeData} data
 * @param {Layout} [layout]
 * @returns
 */
export function isTreeType(data: GraphinTreeData, layout?: Layout) {
  return data?.children || !!TREE_LAYOUTS.find(item => item === layout?.type);
}

/**
 * 是否为图模式
 *
 * @export
 * @param {(GraphinData | GraphinTreeData)} data
 * @param {Layout} [layout]
 * @returns
 */
export function isGraphType(data: GraphinData | GraphinTreeData, layout?: Layout) {
  return !isTreeType(data as GraphinTreeData, layout);
}
