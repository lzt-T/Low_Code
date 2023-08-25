import WidgetFactory from "@/class/WidgetFactory";
import ContainerWidget from "../ContainerWidget";
import { getCanvasSnapRows } from "@/utils/WidgetPropsUtils";
import { GridDefaults } from "@/constant/canvas";


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


  /**
   * 选择画布子部件
   * @param childWidgetData
   */
  renderChildWidget(childWidgetData: any): React.ReactNode {
    if (!childWidgetData) return null

    const childWidget = { ...childWidgetData }
    const snapSpaces = this.getSnapSpaces()

    childWidget.parentColumnSpace = snapSpaces.snapColumnSpace
    childWidget.parentRowSpace = snapSpaces.snapRowSpace
    // 如果容器没有pad，则子组件计算位置时去掉offset
    if (this.props.noPad) childWidget.noContainerOffset = true
    childWidget.parentId = this.props.widgetId
    return WidgetFactory.createWidget(childWidget, this.props.renderMode)
  }

  getPageView() {
    let height = 0
    const snapRows = getCanvasSnapRows(
      this.props
    )
    height = snapRows * GridDefaults.DEFAULT_GRID_ROW_HEIGHT

    const style: React.CSSProperties = {
      width: '100%',
      height: `${height}px`,
      background: 'none',
      position: 'relative'
    }

    return (
      <div style={style}>
        <div>canvas</div>
        {this.renderAsContainerComponent(this.getCanvasProps())}
      </div>
    )
  }

  getCanvasView() {
    // if (!this.props.dropDisabled) {
    //   return this.renderAsDropTarget()
    // }

    return this.getPageView()
  }
}