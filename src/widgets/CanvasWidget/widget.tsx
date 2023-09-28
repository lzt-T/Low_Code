import WidgetFactory from "@/widgets/WidgetFactory";
import ContainerWidget from "../ContainerWidget";
import { getCanvasSnapRows } from "@/utils/WidgetPropsUtils";
import { CANVAS_DEFAULT_MIN_HEIGHT_PX, GridDefaults } from "@/constant/canvas";
import DropTargetComponent from "../components/DropTargetComponent";


export default class CanvasWidget extends ContainerWidget {
  static getWidgetType() {
    return 'CANVAS_WIDGET'
  }

  getCanvasProps(): any {
    return {
      ...this.props,
      parentRowSpace: 1,
      parentColumnSpace: 1,
      topRow: 0,
      leftColumn: 0,
      containerStyle: "none",
      detachFromLayout: true,
    }
  }

  /** 渲染容器内容拖拽时的经纬图*/
  renderAsDropTarget() {
    const canvasProps = this.getCanvasProps()
    /** 画布单元格的宽高值*/
    const snapSpace = this.getSnapSpaces()

    return (
      <DropTargetComponent
        {...canvasProps}
        snapColumnSpace={snapSpace.snapColumnSpace}
        snapRowSpace={snapSpace.snapRowSpace}
        minHeight={this.props.minHeight || CANVAS_DEFAULT_MIN_HEIGHT_PX}
      >
        {this.renderAsContainerComponent(canvasProps)}
      </DropTargetComponent>
    )
  }


  /**
   * 选择画布子部件
   * @param childWidgetData
   */
  renderChildWidget(childWidgetData: any): React.ReactNode {
    if (!childWidgetData) return null

    /** 从redux中获取的props中有了*/
    // const childWidget = { ...childWidgetData }
    // const snapSpaces = this.getSnapSpaces()
    // childWidget.parentColumnSpace = snapSpaces.snapColumnSpace
    // childWidget.parentRowSpace = snapSpaces.snapRowSpace
    // // 如果容器没有pad，则子组件计算位置时去掉offset
    // if (this.props.noPad) childWidget.noContainerOffset = true
    // childWidget.parentId = this.props.widgetId
    return WidgetFactory.createWidget(childWidgetData, this.props.renderMode)
  }

  getPageView() {
    let height = 0
    const snapRows = getCanvasSnapRows(
      this.props
    )
    height = snapRows * GridDefaults.DEFAULT_GRID_ROW_HEIGHT

    return (
      this.renderAsContainerComponent(this.getCanvasProps())
    )
  }

  getCanvasView() {
    if (!this.props.dropDisabled) {
      return this.renderAsDropTarget()
    }

    return this.getPageView()
  }
}