import { WidgetProps } from '@/interface/widget';
import React, { Component, ReactNode } from 'react'



abstract class BaseWidget<T extends WidgetProps, K extends any> extends Component<T, K> {
  /** 获取widget组件Dom*/
  abstract getPageView(): ReactNode;

  /** 获取dom大小*/
  getComponentDimensions = () => {
    return this.calculateWidgetBounds(
      this.props.rightColumn,
      this.props.leftColumn,
      this.props.topRow,
      this.props.bottomRow,
      this.props.parentColumnSpace,
      this.props.parentRowSpace,
    )
  }

  calculateWidgetBounds(
    rightColumn: number,
    leftColumn: number,
    topRow: number,
    bottomRow: number,
    parentColumnSpace: number,
    parentRowSpace: number,
  ): {
    componentWidth: number;
    componentHeight: number;
  } {
    return {
      componentWidth: (rightColumn - leftColumn) * parentColumnSpace,
      componentHeight: (bottomRow - topRow) * parentRowSpace,
    }
  }

  
  private getWidgetView(): ReactNode {
    return (
      <div>baseWidget</div>
    )
  }

  /**
   * 渲染函数，获取React Component
   */
  render() {
    return this.getWidgetView()
  }
}

export default BaseWidget