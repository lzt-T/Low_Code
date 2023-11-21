import ContainerWidget from "../ContainerWidget";
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
}