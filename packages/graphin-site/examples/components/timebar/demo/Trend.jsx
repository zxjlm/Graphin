/* eslint-disable no-undef */

import React from 'react';
import ReactDOM from 'react-dom';

import Graphin, { Utils } from '@antv/graphin';
import { Toolbar, TimeBar } from '@antv/graphin-components';

const App = () => {
  const [data] = React.useState(Utils.mock(50).random().graphin());

  const timeBarData = [];

  for (let i = 0; i < 50; i++) {
    timeBarData.push({
      date: `${new Date().getFullYear()}${i+1}`,
      value: Math.round(Math.random() * 300),
    });
  }

  const onTick = () => {
    let minx = 99999999;
    let maxx = -99999999;
    let miny = 99999999;
    let maxy = -99999999;
    const maxsize = -9999999;
    data.nodes.forEach((node) => {
      if (minx > node.x) {
        minx = node.x;
      }
      if (maxx < node.x) {
        maxx = node.x;
      }
      if (miny > node.y) {
        miny = node.y;
      }
      if (maxy < node.y) {
        maxy = node.y;
      }
    });
    const scalex = (constrainBox.width - nodeSize / 2) / (maxx - minx);
    const scaley = (constrainBox.height - nodeSize / 2) / (maxy - miny);
    data.nodes.forEach((node) => {
      node.x = (node.x - minx) * scalex + constrainBox.x;
      node.y = (node.y - miny) * scaley + constrainBox.y;
    });
  };

  return (
    <div>
      <Graphin data={data} layout={{ name: 'force', onTick }}>
        <Toolbar />
        <TimeBar timeBarData={timeBarData} />
      </Graphin>
    </div>
  );
};
const rootElement = document.getElementById('container');
ReactDOM.render(<App />, rootElement);
