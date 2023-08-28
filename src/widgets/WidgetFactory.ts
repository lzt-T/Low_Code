export default class WidgetFactory {
  /** 注册组件数量*/
  static widgetNum: number = 0;
  static widgetTypes: Record<string, string> = {}

  /** 创建组件map*/
  static widgetBuilderMap: Map<
    string,
    any
  > = new Map()

  /** 组件信息，比如default，大小位置等等*/
  static widgetConfigMap: Map<
    string,
    any
  > = new Map()


  /**
  * @description注册widget
  * @param widgetType widget类型
  * @param widgetBuilder 组件类
  */
  static registerWidgetBuilder(
    widgetType: string,
    widgetBuilder: any,
  ) {
    if (!this.widgetTypes[widgetType]) {
      this.widgetTypes[widgetType] = widgetType
      this.widgetBuilderMap.set(widgetType, widgetBuilder)
    }
  }

  /**
 * @description 保存widget配置
 * @param widgetType widget类型
 * @param config widget配置
 */
  static storeWidgetConfig(
    widgetType: string,
    config: any
  ) {
    this.widgetConfigMap.set(widgetType, Object.freeze(config))
  }

  /**
 * 从上到下创建widgets
 */
  static createWidget(
    widgetData: any,
    renderMode: string,
  ) {
    const widgetProps = {
      key: widgetData.widgetId,
      isVisible: true,
      ...widgetData,
      renderMode,
    }

    const widgetBuilder = this.widgetBuilderMap.get(widgetData.type)
    
    if (widgetBuilder) {
      return widgetBuilder.buildWidget(widgetProps)
    } else {
      return null
    }
  }

}