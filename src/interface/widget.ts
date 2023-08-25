export interface IWidgetConfiguration {

}

export interface WidgetProps {
  widgetId: string,
  topRow: number,
  bottomRow: number
  leftColumn: number,
  rightColumn: number,
  parentColumnSpace: number,
  parentRowSpace: number,
  type: string,
  children: string[],
  [propsName: string]: any
}