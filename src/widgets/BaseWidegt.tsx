import { RenderModes } from '@/constant/canvas';
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

  getCanvasView(): ReactNode {
    const content = this.getPageView()
    return content

  }

  getWidgetComponent() {
    const { renderMode } = this.props

    // 如果是画布模式，增加错误边界
    return renderMode === RenderModes.CANVAS
      ? this.getCanvasView()
      : this.getPageView()
  }

  private getWidgetView(): ReactNode {
    let content: ReactNode
    switch (this.props.renderMode) {
      case RenderModes.CANVAS:
        content = this.getWidgetComponent()

        return content
      case RenderModes.PAGE:
        content = this.getWidgetComponent()

        return content
      default:
        throw Error(`RenderMode:${this.props.renderMode} not defined`)
    }
  }

  /**
   * 渲染函数，获取React Component
   */
  render() {
    return this.getWidgetView()
  }
}

export default BaseWidget