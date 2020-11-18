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
