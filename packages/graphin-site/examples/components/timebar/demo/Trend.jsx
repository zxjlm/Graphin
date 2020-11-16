/* eslint-disable no-undef */

import React from 'react';
import ReactDOM from 'react-dom';

import Graphin, { Utils } from '@antv/graphin';
import { Toolbar, TimeBar } from '@antv/graphin-components';

const App = () => {
  const [data, setData] = React.useState(Utils.mock(100).circle().graphin());

  for (let i = 0; i < 100; i++) {
    const id = `node-${i}`;
    data.nodes.push({
      id,
      date: `2020${i}`,
      value: Math.round(Math.random() * 300),
    });

    data.edges.push({
      source: `node-${Math.round(Math.random() * 90)}`,
      target: `node-${Math.round(Math.random() * 90)}`,
    });
  }

  const timeBarData = [];

  for (let i = 0; i < 100; i++) {
    timeBarData.push({
      date: `2020${i}`,
      value: Math.round(Math.random() * 300),
    });
  }

  return (
    <div>
      <Graphin data={data} layout={{ name: 'force' }}>
        <Toolbar />
        <TimeBar timeBarData={timeBarData} />
      </Graphin>
    </div>
  );
};
const rootElement = document.getElementById('container');
ReactDOM.render(<App />, rootElement);
