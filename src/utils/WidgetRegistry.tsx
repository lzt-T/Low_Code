/** widget注册*/
import WidgetFactory from '@/widgets/WidgetFactory'
import store from '@/store'
import { addWidgetConfig } from '@/store/slices/widgetConfigSlice'
import ContainerWidget, { CONFIG as CONTAINER_WIDGET_CONFIG} from '@/widgets/ContainerWidget'
import CanvasWidget, { CONFIG as CANVAS_WIDGET_CONFIG } from '@/widgets/CanvasWidget'
import ButtonWidget, { config as BUTTON_WIDGET_CONFIG } from '@/widgets/ButtonWidget'
import { generateReactKey } from '@/utils/generators'
import { useAppSelector } from '@/hooks/redux'
import { getWidgetByIdSelector } from '@/store/slices/canvasWidgets'

export const ALL_WIDGETS_AND_CONFIG = [
  [ContainerWidget, CONTAINER_WIDGET_CONFIG],
  [CanvasWidget, CANVAS_WIDGET_CONFIG],
  [ButtonWidget, BUTTON_WIDGET_CONFIG],
  // 扩展...
]

/**
* @description 注册widget
*/
export const registerWidgets = () => {
  WidgetFactory.widgetNum = ALL_WIDGETS_AND_CONFIG.length;
  for (const widget of ALL_WIDGETS_AND_CONFIG) {
    registerWidget(widget[0], widget[1])
  }
}

/**
* @description 高阶组件
*/
export default function getWidgetComponent(Component: any) {
  return (props: any) => {
    let widgetProps = { children: {} }
    const { widgetId, children } = props;

    //获取保存在redux中widget值
    const canvasWidget = useAppSelector(getWidgetByIdSelector(widgetId))

    const canvasWidgetProps = (() => {
      // if (widgetId === MAIN_CONTAINER_WIDGET_ID) {
      //   // 统计根据实际画布宽度，计算根画布的rightColumn
      //   return computeMainContainerWidget(canvasWidget, mainCanvasProps)
      // }
      return canvasWidget
    })()

    widgetProps = { ...canvasWidgetProps }

    widgetProps.children = children;
    widgetProps = { ...props, ...widgetProps, children }
    return <Component {...widgetProps} />
  }
}

export const registerWidget = (Widget: any, config: any) => {
  
  /** widget组件*/
  const WidgetComponent = getWidgetComponent(Widget)
  WidgetFactory.registerWidgetBuilder(
    config.type,
    {
      buildWidget(widgetData: any): JSX.Element {
        return <WidgetComponent {...widgetData} key={widgetData.widgetId} />
      },
    },
  )

  configureWidget(config)
}

export const configureWidget = (config: any) => {
  const features = {}
  const _config = {
    ...features,
    ...config.defaults,
    type: config.type,
    hideCard: !!config.hideCard || !config.icon,
    isDeprecated: !!config.isDeprecated,
    replacement: config.replacement,
    displayName: config.name,
    key: generateReactKey(),
    iconSVG: config.icon,
    isCanvas: config.isCanvas,
    operation: config?.operation,
  }

  store.dispatch(addWidgetConfig(_config))

  WidgetFactory.storeWidgetConfig(config.type, _config)
}