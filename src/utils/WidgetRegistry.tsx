/** widget注册*/
import WidgetFactory from '@/class/WidgetFactory'
import store from '@/store'
import { addWidgetConfig } from '@/store/slices/widgetConfigSlice'
import CanvasWidget, { CONFIG as CANVAS_WIDGET_CONFIG } from '@/widgets/CanvasWidget'
import ButtonWidget, { config as BUTTON_WIDGET_CONFIG } from '@/widgets/ButtonWidget'
import { generateReactKey } from '@/utils/generators'

export const ALL_WIDGETS_AND_CONFIG = [
  [CanvasWidget, CANVAS_WIDGET_CONFIG],
  [ButtonWidget, BUTTON_WIDGET_CONFIG],
  // 扩展...
]

/**
* @description 注册widget
*/
export const registerWidgets = () => {
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