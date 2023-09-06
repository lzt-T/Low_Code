export interface IWidgetConfiguration {

}

export interface WidgetProps {
  parentId?: string;
  widgetId: string,
  topRow: number,
  bottomRow: number
  leftColumn: number,
  rightColumn: number,
  parentColumnSpace: number,
  parentRowSpace: number,
  /** 是否展示边框*/
  showAsBorder?: boolean,
  /** 是否可以改变尺寸*/
  resizeDisabled?:boolean,
  type: string,
  children: string[],
  [propsName: string]: any
}

export interface WidgetRowCols {
  topRow: number;
  bottomRow: number;
  leftColumn: number;
  rightColumn: number;
}