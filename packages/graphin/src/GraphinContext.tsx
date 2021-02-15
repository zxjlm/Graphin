import { Graph as IGraph } from '@antv/g6';
import React from 'react';
// REVIEW 个人吐槽一下Apis的写法，感觉好Chinglish
import { ApisType } from './apis/types';
// REVIEW remove index
import { ThemeType } from './theme/index';

// REVIEW 不要这样生命吧，要不把IGraph， ApisType等做成Optional
const defaultContext = {
  // REVIEW 同样疑惑什么时候用IGraph, 什么时候用Graph, 什么时候用GraphType
  graph: {} as IGraph,
  apis: {} as ApisType,
  theme: {} as ThemeType,
};
export interface GraphinContextType {
  graph: IGraph;
  apis: ApisType;
  theme: ThemeType;
  // REVIEW kill any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const GraphinContext: React.Context<GraphinContextType> = React.createContext(defaultContext);

export default GraphinContext;
