

export default class WidgetFactory {
  static widgetTypes: Record<string, string> = {}
  static widgetMap: Map<
    string,
    any
  > = new Map()

  static widgetConfigMap: Map<
    string,
    any
    > = new Map()
  
  /**
    * 注册widget
    * @param widgetType widget类型
    * @param widgetBuilder 组件类
    */
  static registerWidgetBuilder(
    widgetType: string,
    widgetBuilder: any,
    features?: any,
  ) {
    if (!this.widgetTypes[widgetType]) {
      this.widgetTypes[widgetType] = widgetType
      this.widgetMap.set(widgetType, widgetBuilder)


      // if (propertyPaneContentConfig) {

      //   this.propertyPaneContentConfigsMap.set(
      //     widgetType,
      //     propertyPaneContentConfig

      //   )
      // }

      // if (propertyPaneStyleConfig) {

      //   this.propertyPaneStyleConfigsMap.set(
      //     widgetType,
      //     propertyPaneStyleConfig,
      //   )
      // }
    }
  }

  /**
 * 保存widget配置
 * @param widgetType widget类型
 * @param config widget配置
 */
  static storeWidgetConfig(
    widgetType: string,
    config: any
  ) {
    this.widgetConfigMap.set(widgetType, Object.freeze(config))
  }

}