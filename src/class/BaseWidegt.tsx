import React, { Component, ReactNode } from 'react'

abstract class BaseWidget<T extends any, K extends any> extends Component<T, K> {
  abstract getPageView(): ReactNode;

  /**
   *
   * @returns 获取组件内容
   */
  private getWidgetView(): ReactNode {
    return (
      <div>asdasd</div>
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