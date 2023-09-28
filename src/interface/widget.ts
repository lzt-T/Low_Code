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

export interface WidgetsRowCols { 
  [widgetId: string]: WidgetRowCols
}

export interface WidgetConfigs{
  columns:number
  detachFromLayout :boolean,
  displayName:string
  iconSVG: string,
  key:string
  rows:number,
  searchTags:any,
  type: string,
  [propName: string]: any
}

export interface IWidgetCard  {
  columns: number
  detachFromLayout: boolean,
  displayName: string
  icon: string,
  key: string
  rows: number,
  searchTags: any,
  type: string,
}
