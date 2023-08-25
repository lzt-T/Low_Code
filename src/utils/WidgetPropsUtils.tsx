import { GridDefaults, MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas"
import { WidgetProps } from "@/interface/widget";

/**计算画布行数*/
export const getCanvasSnapRows = (
  props: WidgetProps
): number => {
  let totalRows = 0;
  /** 因为主画布的父亲单位是 1 */
  if (props.widgetId === MAIN_CONTAINER_WIDGET_ID) {
    totalRows = props.bottomRow / GridDefaults.DEFAULT_GRID_ROW_HEIGHT
  } else {
    totalRows = props.topRow - props.bottomRow
  }
  return totalRows - 1
}
