import React from 'react';
import Hoverable from './behaviors/Hoverable';
import ResizeCanvas from './behaviors/ResizeCanvas';
import DefaultComponentClass from './constants/DefaultComponentClass';
import { GraphinProps } from './typings/type';

export function GraphinComponentsContainer(props: GraphinProps & { isReady: boolean; target: HTMLDivElement | null }) {
  const getDefaultComponent = () =>
    DefaultComponentClass.map((ComponentClass, index) => <ComponentClass key={index.toString()} />);
  const { isReady, target, modes, children } = props;
  if (!isReady) return null;
  return (
    <div className="graphin-components">
      {!modes && getDefaultComponent()}
      <ResizeCanvas target={target} />
      <Hoverable bindType="node" />
      {children}
    </div>
  );
}
