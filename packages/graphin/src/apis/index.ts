import { Graph } from '@antv/g6';
import * as elementApis from './element';
import { ApisType } from './types';
// import { handleAutoZoom, handleRealZoom, handleChangeZoom, handleZoomIn, handleZoomOut } from './zoom';
// import { focusNodeById, highlightNodeById } from './element';
import * as zoomApis from './zoom';

const apis = {
  ...zoomApis,
  ...elementApis,
};

// REVIEW 感觉api controller做薄了
const ApiController = (graph: Graph) => {
  const apiKeys = Object.keys(apis);
  return apiKeys.reduce((acc, curr) => {
    return {
      ...acc,
      // @ts-ignore
      [curr]: apis[curr](graph),
    };
  }, {}) as ApisType;
};

export default ApiController;
