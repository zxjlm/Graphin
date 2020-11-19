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
  timeBarWidth: number;
  timeBarHeight: number;
  type: string;
  timeBarData: never[];
}

const TimeBar: React.FC<TimeBar> = (props) => {
  const { graph, graphVars = {}, timeBarWidth, timeBarHeight = 150, type = 'trend', timeBarData } = props;
  const { width = 0 } = graphVars;
  const timebar = new G6.TimeBar({
    x: 0,
    y: 0,
    width: timeBarWidth || width,
    height: timeBarHeight,
    padding: 10,
    type,
    trend: {
      data: timeBarData,
    },
  });
  graph.addPlugin(timebar);
  return <div className="time-bar-content" />;
};

export default TimeBar;
