// REVIEW 这个文件也是包了太多东西进来，以需要拆分出去
// todo ,G6@unpack版本将规范类型的输出
import G6, { Graph as IGraph, GraphData, GraphOptions, TreeGraphData } from '@antv/g6';
import { deepMix } from '@antv/util';
// REVIEW 考虑一下 import cloneDeep from 'lodash/cloneDeep'的写法？一定不会打包整个lodash到编译后的文件中
import { cloneDeep } from 'lodash';
import React, { ErrorInfo } from 'react';
/** 内置API */
import ApiController from './apis';
import { ApisType } from './apis/types';
/** 内置 Behaviros */
import Behaviors from './behaviors';
// REVIEW 拼写错误, DEFAULT_TREE_LATOUT_OPTIONS => DEFAULT_TREE_LAYOUT_OPTIONS, consts => constants
import { DEFAULT_TREE_LATOUT_OPTIONS, TREE_LAYOUTS } from './consts';
/** Context */
import GraphinContext from './GraphinContext';
import './index.less';
/** 内置布局 */
import LayoutController from './layout';
import { getDefaultStyleByTheme, ThemeData } from './theme/index';
/** types  */
import { GraphinData, GraphinProps, GraphinTreeData, IconLoader } from './typings/type';
/** utils */
// import shallowEqual from './utils/shallowEqual';
import deepEqual from './utils/deepEqual';

const { DragCanvas, ZoomCanvas, DragNode, DragCombo, ClickSelect, BrushSelect, ResizeCanvas, Hoverable } = Behaviors;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DiffValue = any;

export interface GraphinState {
  isReady: boolean;
  context: {
    graph: IGraph;
    apis: ApisType;
    theme: ThemeData;
  };
}

// REVIEW kill any
export interface RegisterFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (name: string, options: { [key: string]: any }, extendName?: string): void;
}

// REVIEW 做一下访问作用域限制，private\public\protected
class Graphin extends React.PureComponent<GraphinProps, GraphinState> {
  static registerNode: RegisterFunction = (nodeName, options, extendedNodeName) => {
    G6.registerNode(nodeName, options, extendedNodeName);
  };

  static registerEdge: RegisterFunction = (edgeName, options, extendedEdgeName) => {
    G6.registerEdge(edgeName, options, extendedEdgeName);
  };

  static registerCombo: RegisterFunction = (comboName, options, extendedComboName) => {
    G6.registerCombo(comboName, options, extendedComboName);
  };

  // REVIEW kill any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static registerBehavior(behaviorName: string, behavior: any) {
    G6.registerBehavior(behaviorName, behavior);
  }

  // REVIEW: 这里暴露了registerFontFamily, index为什么还要单独暴露一个接口出去？
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static registerFontFamily(iconLoader: IconLoader): { [icon: string]: any } {
    /**  注册 font icon */
    const iconFont = iconLoader();
    const { glyphs, fontFamily } = iconFont;
    const icons = glyphs.map(item => {
      return {
        name: item.name,
        unicode: String.fromCodePoint(item.unicode_decimal),
      };
    });

    // REVIEW Proxy用要小心兼容性问题
    return new Proxy(icons, {
      get: (target, propKey: string) => {
        const matchIcon = target.find(icon => {
          return icon.name === propKey;
        });
        if (!matchIcon) {
          console.error(`%c fontFamily:${fontFamily},does not found ${propKey} icon`);
          return '';
        }
        return matchIcon?.unicode;
      },
    });
  }

  // REVIEW kill any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static registerLayout(layoutName: string, layout: any) {
    G6.registerLayout(layoutName, layout);
  }

  /** Graph的DOM */
  graphDOM: HTMLDivElement | null = null;

  /** G6 instance */
  graph: IGraph;

  /** layout */
  layout: LayoutController;

  width: number;

  height: number;

  /** 是否为 Tree Graph */
  isTree: boolean;

  /** G6实例中的 nodes,edges,combos 的 model，会比props.data中多一些引用赋值产生的属性，比如node中的 x,y */
  data: GraphinTreeData | GraphinData | undefined;

  options: GraphOptions;

  apis: ApisType;

  theme: ThemeData;

  constructor(props: GraphinProps) {
    super(props);

    const {
      data,
      layout,
      width,
      height,

      ...otherOptions
    } = props;

    this.data = data;
    // REVIEW 这里的判断有点tricky, 还不如显示让用户告诉你，它传进来的数据是tree data还是graph data
    this.isTree =
      Boolean(props.data && (props.data as GraphinTreeData).children) ||
      TREE_LAYOUTS.indexOf(String(layout && layout.type)) !== -1;
    // REVIEW kill cast convert
    this.graph = {} as IGraph;
    this.height = Number(height);
    this.width = Number(width);

    // REVIEW kill cast convert
    this.theme = {} as ThemeData;
    // REVIEW kill cast convert
    this.apis = {} as ApisType;

    this.state = {
      isReady: false,
      context: {
        graph: this.graph,
        apis: this.apis,
        theme: this.theme,
      },
    };

    this.options = { ...otherOptions } as GraphOptions;
    // REVIEW kill cast convert
    this.layout = {} as LayoutController;
  }

  // REVIEW remove console.log, or enable debug by flag
  initData = (data: GraphinProps['data']) => {
    if ((data as GraphinTreeData).children) {
      this.isTree = true;
    }
    console.time('clone data');
    // REVIEW 这里一定要做cloneDeep么？感觉是不是可以只deep graphin需要的字段，其他字段还是引用的方式
    this.data = cloneDeep(data);
    console.timeEnd('clone data');
  };

  // REVIEW 这个方法做了太多事情，是不是考虑拆分到不同的controller中init
  initGraphInstance = () => {
    // REVIEW 哇……
    const {
      theme,
      data,
      layout,
      width,
      height,
      // REVIEW 这几个default字段讨论一下
      defaultCombo,
      defaultEdge,
      defaultNode,
      nodeStateStyles,
      edgeStateStyles,
      comboStateStyles,
      modes = { default: [] },
      animate,
      handleAfterLayout,
      ...otherOptions
    } = this.props;
    if (modes.default.length > 0) {
      // REVIEW 拼写错误
      // TODO :给用户正确的引导，推荐使用Graphin的Bheaviors组件
      console.info('%c suggestion: you can use @antv/graphin Behaviros components', 'color:lightgreen');
    }
    /**  width and height */
    const { clientWidth, clientHeight } = this.graphDOM as HTMLDivElement;
    /** shallow clone */
    this.initData(data);

    /** 重新计算宽度 */
    this.width = Number(width) || clientWidth || 500;
    this.height = Number(height) || clientHeight || 500;

    const themeResult = getDefaultStyleByTheme(theme);

    const {
      defaultNodeStyle,
      defaultEdgeStyle,
      defaultComboStyle,
      defaultNodeStatusStyle,
      defaultEdgeStatusStyle,
      defaultComboStatusStyle,
    } = themeResult;
    // @ts-ignore
    this.theme = themeResult as ThemeData;
    /** graph type */
    // REVIEW 看到好多这种类型的判断了
    this.isTree =
      Boolean((data as GraphinTreeData).children) || TREE_LAYOUTS.indexOf(String(layout && layout.type)) !== -1;
    // REVIEW 这个判断没有看懂
    const isGraphinNodeType = defaultNode?.type === undefined || defaultNode?.type === defaultNodeStyle.type;
    const isGraphinEdgeType = defaultEdge?.type === undefined || defaultEdge?.type === defaultEdgeStyle.type;

    this.options = {
      container: this.graphDOM,
      renderer: 'canvas',
      width: this.width,
      height: this.height,
      animate: animate !== false,
      /** 默认样式 */
      defaultNode: isGraphinNodeType ? deepMix({}, defaultNodeStyle, defaultNode) : defaultNode,
      defaultEdge: isGraphinEdgeType ? deepMix({}, defaultEdgeStyle, defaultEdge) : defaultEdge,
      defaultCombo: deepMix({}, defaultComboStyle, defaultCombo),
      /** status 样式 */
      nodeStateStyles: deepMix({}, defaultNodeStatusStyle, nodeStateStyles),
      edgeStateStyles: deepMix({}, defaultEdgeStatusStyle, edgeStateStyles),
      comboStateStyles: deepMix({}, defaultComboStatusStyle, comboStateStyles),

      modes,
      ...otherOptions,
    } as GraphOptions;

    if (this.isTree) {
      this.options.layout = layout || DEFAULT_TREE_LATOUT_OPTIONS;
      this.graph = new G6.TreeGraph(this.options);
    } else {
      this.graph = new G6.Graph(this.options);
    }

    /** 内置事件:AfterLayout 回调 */
    this.graph.on('afterlayout', () => {
      if (handleAfterLayout) {
        handleAfterLayout(this.graph);
      }
    });

    /** 装载数据 */
    this.graph.data(this.data as GraphData | TreeGraphData);

    /** 初始化布局：仅限网图 */
    if (!this.isTree) {
      this.layout = new LayoutController(this);
      this.layout.start();
    }

    // this.graph.get('canvas').set('localRefresh', true);

    /** 渲染 */
    this.graph.render();
    /** FitView 变为组件可选 */

    /** 初始化状态 */
    this.initStatus();
    /** 生成API */
    // REVIEW 在这里才ready, 会不会存在用户在这之前获取api的情况？至少这里应该有个事件/回掉告知用户，api已经ready
    this.apis = ApiController(this.graph);
    /** 设置Context */
    this.setState({
      isReady: true,
      context: {
        graph: this.graph,
        apis: this.apis,
        theme: this.theme,
      },
    });
  };

  updateLayout = () => {
    this.layout.changeLayout();
  };

  componentDidMount() {
    this.initGraphInstance();
  }

  /**
   * 组件更新的时候
   * @param prevProps
   */
  // REVIEW: 嗯？
  updateOptions = () => {
    const { ...options } = this.props;
    return options;
  };

  /** 初始化状态 */
  initStatus = () => {
    // REVIEW tree模式不需要初始化状态么？
    if (!this.isTree) {
      const { data } = this.props;
      const { nodes = [], edges = [] } = data as GraphinData;
      nodes.forEach(node => {
        const { status } = node;
        if (status) {
          Object.keys(status).forEach(k => {
            this.graph.setItemState(node.id, k, Boolean(status[k]));
          });
        }
      });
      edges.forEach(edge => {
        const { status } = edge;
        if (status) {
          Object.keys(status).forEach(k => {
            this.graph.setItemState(edge.id, k, Boolean(status[k]));
          });
        }
      });
    }
  };

  // REVIEW 1. remove console log 2. 功能做一下拆分吧
  componentDidUpdate(prevProps: GraphinProps) {
    console.time('did-update');

    // REVIEW 这里应该还是存在性能问题把？考虑一下只做第一层比较，或者使用指纹技术（MD5)？
    const isDataChange = this.shouldUpdate(prevProps, 'data');
    const isLayoutChange = this.shouldUpdate(prevProps, 'layout');
    const isOptionsChange = this.shouldUpdate(prevProps, 'options');
    const isThemeChange = this.shouldUpdate(prevProps, 'theme');
    console.timeEnd('did-update');
    const { data } = this.props;
    const isGraphTypeChange = (prevProps.data as GraphinTreeData).children !== (data as GraphinTreeData).children;

    if (isThemeChange) {
      // TODO :Node/Edge/Combo 批量调用 updateItem 来改变
    }

    /** 图类型变化 */
    if (isGraphTypeChange) {
      console.error(
        'The data types of pervProps.data and props.data are inconsistent,Graphin does not support the dynamic switching of TreeGraph and NetworkGraph',
      );
      return;
    }
    /** 配置变化 */
    if (isOptionsChange) {
      this.updateOptions();
      console.log('isOptionsChange');
    }
    /** 数据变化 */
    if (isDataChange) {
      this.initData(data);
      this.layout.changeLayout();
      this.graph.data(this.data as GraphData | TreeGraphData);
      this.graph.changeData(this.data as GraphData | TreeGraphData);
      this.initStatus();
      this.apis = ApiController(this.graph);
      console.log('%c isDataChange', 'color:grey');
      this.setState(
        preState => {
          return {
            ...preState,
            context: {
              graph: this.graph,
              apis: this.apis,
              theme: this.theme,
            },
          };
        },
        () => {
          this.graph.emit('graphin:datachange');
        },
      );
      return;
    }
    /** 布局变化 */
    if (isLayoutChange) {
      /**
       * TODO
       * 1. preset 前置布局判断问题
       * 2. enablework 问题
       * 3. G6 LayoutController 里的逻辑
       */
      /** 数据需要从画布中来 */
      // @ts-ignore
      this.data = this.layout.getDataFromGraph();
      this.layout.changeLayout();
      this.layout.refreshPosition();

      /** 走G6的layoutController */
      // this.graph.updateLayout();
      console.log('%c isLayoutChange', 'color:grey');
      this.graph.emit('graphin:layoutchange');
    }
  }

  /**
   * 组件移除的时候
   */
  componentWillUnmount() {
    this.clear();
  }

  /**
   * 组件崩溃的时候
   * @param error
   * @param info
   */
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Catch component error: ', error, info);
  }

  clear = () => {
    if (this.layout && this.layout.destroy) {
      this.layout.destroy(); // tree graph
    }
    this.layout = {} as LayoutController;
    this.graph!.clear();
    this.data = { nodes: [], edges: [], combos: [] };
    this.graph!.destroy();
  };

  shouldUpdate(prevProps: GraphinProps, key: string) {
    /* eslint-disable react/destructuring-assignment */
    const prevVal = prevProps[key];
    const currentVal = this.props[key] as DiffValue;
    const isEqual = deepEqual(prevVal, currentVal);
    return !isEqual;
  }

  render() {
    console.log('%c graphin render...', 'color:lightblue', this);
    const { isReady } = this.state;
    const { modes, style } = this.props;
    console.log('theme', this.theme);
    return (
      <GraphinContext.Provider value={this.state.context}>
        <div id="graphin-container">
          <div
            data-testid="custom-element"
            className="graphin-core"
            ref={node => {
              this.graphDOM = node;
            }}
            style={{ background: this.theme?.background, ...style }}
          />
          <div className="graphin-components">
            {isReady && (
              <>
                {
                  /** modes 不存在的时候，才启动默认的behaviros，否则会覆盖用户自己传入的 */
                  !modes && (
                    <>
                      {/* 拖拽画布 */}
                      <DragCanvas />
                      {/* 缩放画布 */}
                      <ZoomCanvas />
                      {/* 拖拽节点 */}
                      <DragNode />
                      {/* 点击节点 */}
                      <DragCombo />
                      {/* 点击节点 */}
                      <ClickSelect />
                      {/* 圈选节点 */}
                      <BrushSelect />
                    </>
                  )
                }

                {/** resize 画布 */}
                <ResizeCanvas graphDOM={this.graphDOM as HTMLDivElement} />
                <Hoverable bindType="node" />
                {/* <Hoverable bindType="edge" /> */}
                {this.props.children}
              </>
            )}
          </div>
        </div>
      </GraphinContext.Provider>
    );
  }
}
export default Graphin;
