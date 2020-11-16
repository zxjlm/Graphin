import React, { CSSProperties } from 'react';
import G6, { Graph } from '@antv/g6';
import './index.less';

export interface TimeBar {
  style?: CSSProperties;
  graphDOM?: HTMLElement;
  graph: Graph;
  graphVars?: {
    width?: number;
    height?: number;
  };
  timeBarData: never[];
}

const TimeBar: React.FC<TimeBar> = (props) => {
  const { graph, graphVars = {}, timeBarData } = props;
  const { width = 0 } = graphVars;
  console.log('time', graph);
  const timebar = new G6.TimeBar({
    x: 0,
    y: 0,
    width,
    height: 150,
    padding: 10,
    type: 'trend',
    trend: {
      data: timeBarData,
    },
  });
  graph.addPlugin(timebar);
  return <div className="time-bar-content" />;
};

export default TimeBar;
