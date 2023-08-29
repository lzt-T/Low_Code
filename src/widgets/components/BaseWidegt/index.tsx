import { RenderModes } from '@/constant/canvas';
import { WidgetProps } from '@/interface/widget';
import React, { Component, ReactNode } from 'react'
import PositionedContainer from '../PositionedContainer';
import ResizableComponent from '../ResizableComponent';
import DraggableComponent from '../DraggableComponent';



abstract class BaseWidget<T extends WidgetProps, K extends any> extends Component<T, K> {
  /** 获取widget组件Dom*/
  abstract getPageView(): ReactNode;

  /** 
   * @description 获取dom框大小，实际大小还要减去padding，原理 (r-l)*单位长度
  */
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


  /**
   * @description 拖拽位置组件
   * @param content
   */
  makeDraggable(content: ReactNode) {
    return <DraggableComponent {...this.props}>{content}</DraggableComponent>
  }

  /**
   * @description 增加拖拽宽高组件
   * @param content
   */
  makeResizable(content: ReactNode) {
    return (
      <ResizableComponent
        {...this.props}
      >
        {content}
      </ResizableComponent>
    )
  }


  /** 设定组件位置*/
  makePositioned(content: ReactNode) {
    const { componentHeight, componentWidth } = this.getComponentDimensions()
    return (
      <PositionedContainer
        componentHeight={componentHeight}
        componentWidth={componentWidth}
        focused={this.props.focused}
        leftColumn={this.props.leftColumn}
        noContainerOffset={this.props.noContainerOffset}
        parentColumnSpace={this.props.parentColumnSpace}
        parentId={this.props.parentId}
        parentRowSpace={this.props.parentRowSpace}
        resizeDisabled={this.props.resizeDisabled}
        selected={this.props.selected}
        topRow={this.props.topRow}
        widgetId={this.props.widgetId}
        widgetType={this.props.type}
      >
        {content}
      </PositionedContainer>
    )
  }

  private getWidgetView(): ReactNode {
    let content: ReactNode
    switch (this.props.renderMode) {
      case RenderModes.CANVAS:
        content = this.getWidgetComponent()
        //当为true时不能变化大小
        if (!this.props.resizeDisabled) content = this.makeResizable(content)
        /** 拖拽*/
        content = this.makeDraggable(content)
        /** 定位*/
        content = this.makePositioned(content)
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