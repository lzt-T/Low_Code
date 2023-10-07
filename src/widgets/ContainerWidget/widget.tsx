import React from "react"
import { ReactNode } from 'react'
import ContainerComponent from './component'
import BaseWidget from "@/widgets/components/BaseWidegt"
import { WidgetProps } from "@/interface/widget";
import { CONTAINER_GRID_PADDING, GridDefaults, MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas";
import { WIDGET_PADDING } from "@/constant/widget";
import WidgetFactory from "@/widgets/WidgetFactory";
import { compact, map, sortBy } from "lodash"
import { getCanvasSnapRows } from "@/utils/WidgetPropsUtils";
import CanvasDraggingArena from "../components/CanvasDraggingArena";

interface ContainerWidgetProps extends WidgetProps { }

export interface ContainerWidgetState {
  isLoading: boolean;
}

class ContainerWidget extends BaseWidget<ContainerWidgetProps, ContainerWidgetState> {
  constructor(props: ContainerWidgetProps) {
    super(props)
    this.state = {
      isLoading: false
    }
  }

  /*** 获取画布单元格的宽高值*/
  getSnapSpaces = () => {
    const { componentWidth } = this.getComponentDimensions()
    // let padding = (WIDGET_PADDING) * 2  //20
    // if (
    //   this.props.widgetId === MAIN_CONTAINER_WIDGET_ID ||
    //   this.props.type === "CONTAINER_WIDGET"
    // ) {
    //   padding = CONTAINER_GRID_PADDING * 2  //12
    // }
    let width = componentWidth - (WIDGET_PADDING) * 2
    // width -= (WIDGET_PADDING) * 2

    return {
      snapRowSpace: GridDefaults.DEFAULT_GRID_ROW_HEIGHT, //10
      snapColumnSpace: componentWidth ? width / GridDefaults.DEFAULT_GRID_COLUMNS : 0,
    }
  }

  renderChildWidget(childWidgetData: WidgetProps): ReactNode {

    const childWidget = { ...childWidgetData }

    // const { componentHeight, componentWidth } = this.getComponentDimensions()
    // childWidget.rightColumn = componentWidth
    // childWidget.bottomRow = this.props.shouldScrollContents
    //   ? childWidget.bottomRow
    //   : componentHeight
    // childWidget.minHeight = componentHeight
    // childWidget.shouldScrollContents = false
    // childWidget.canExtend = this.props.shouldScrollContents

    // childWidget.parentId = this.props.widgetId;


    return WidgetFactory.createWidget(childWidget, this.props.renderMode)
  }

  renderChildren() {
    const that = this
    /** 将孩子按照topRow从小到大排序*/
    return map(sortBy(compact(this.props.children), (child: any) => child.topRow), (data) => {
      return that.renderChildWidget(data)
    },
    )
  }

  renderAsContainerComponent(props: ContainerWidgetProps) {
    const snapRows = getCanvasSnapRows(props)
    let height = snapRows * GridDefaults.DEFAULT_GRID_ROW_HEIGHT
    return (
      <ContainerComponent {...props}>
        {
          props.type === 'CANVAS_WIDGET' &&
          //  props.renderMode === RenderModes.CANVAS &&
          (
            //canvas上画的框和拖拽操作
            <CanvasDraggingArena
              {...this.getSnapSpaces()}
              // canExtend={props.canExtend}
              // dropDisabled={!!props.dropDisabled}
              // noPad={this.props.noPad}
              // parentId={props.parentId}
              // snapRows={snapRows}
              widgetId={props.widgetId}
            />
          )
        }
        {/* 画布上的widget */}
        <>{this.renderChildren()}</>
      </ContainerComponent>
    )
  }

  getPageView() {
    return this.renderAsContainerComponent(this.props)
  }

  static getWidgetType() {
    return "CONTAINER_WIDGET"
  }
}

export default ContainerWidget
