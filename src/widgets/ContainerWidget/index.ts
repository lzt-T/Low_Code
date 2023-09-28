import IconSVG from "./icon.svg"
import Widget from "./widget"
export const CONFIG: any = {
  type: Widget.getWidgetType(),
  name: "Container",
  icon: IconSVG,
  isCanvas: true,
  hideCard: false,
  displayName: '容器',
  defaults: {
    backgroundColor: "#FFFFFF",
    rows: 30,
    columns: 40,
    widgetName: "Container Widget",
    containerStyle: "card",
    borderColor:"#E0DEDE",
    borderWidth: "1",
    animateLoading: true,
    children: [],
    version: 1,
    blueprint: {
      view: [
        {
          type: 'CANVAS_WIDGET',
          position: { top: 0, left: 0 },
          props: {
            containerStyle: "none",
            canExtend: false,
            detachFromLayout: true,
            children: [],
          }
        }
      ]
    }
  },
  properties: {
  
  },
}

export default Widget
