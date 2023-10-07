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
    rows: 30,
    columns: 40,
    widgetName: "Container Widget",
    children: [],
   
  },
  properties: {
  
  },
}

export default Widget
