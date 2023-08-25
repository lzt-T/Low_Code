/** widget注册*/
import WidgetFactory from '@/class/WidgetFactory'
import store from '@/store'
import { addWidgetConfig } from '@/store/slices/widgetConfigSlice'
import ButtonWidget, { config as BUTTON_WIDGET_CONFIG } from '@/widgets/ButtonWidget'

export const ALL_WIDGETS_AND_CONFIG = [
  [ButtonWidget, BUTTON_WIDGET_CONFIG],
  // 扩展...
]

/** 注册widget*/
export const registerWidgets = () => {
  for (const widget of ALL_WIDGETS_AND_CONFIG) {
    registerWidget(widget[0], widget[1])
  }
}


// const generateWidget =function getWidgetComponent(
//   Widget:any,
// ) {
//   const widget = withWidgetProps(Widget)
//   return widget
// }

export const registerWidget = (Widget: any, config: any) => {
  // 将widget全部属性补全
  // const ProfiledWidget = generateWidget(Widget)

  // console.log(ProfiledWidget,32131232123);
  

  // WidgetFactory.registerWidgetBuilder(
  //   config.type,
  //   {
  //     buildWidget(widgetData: any): JSX.Element {
  //       <div>sadsad</div>
  //       // return <ProfiledWidget {...widgetData} key={widgetData.widgetId} />
  //     },
  //   },
  //   // config.properties?.contentConfig,
  //   // config.properties?.styleConfig,
  //   config?.features,
  // )

  configureWidget(config)
}


// export default function withWidgetProps(WrappedWidget: any) {
//   console.log(WrappedWidget,213213);
  
//   return function WrappedPropsComponent(
//     props: any
//   ) {
//     const { widgetId, children } = props;

//     console.log(widgetId,'12312');
    
//     return <div>asdsad</div>
//     // const canvasWidget = useAppSelector(getWidgetByIdSelector(widgetId))
//     // const mainCanvasProps = useAppSelector(getMainCanvasProps)

//     // // const chilWidgets = [];
//     // let widgetProps: WidgetProps = {} as WidgetProps

//     // const canvasWidgetProps = (() => {
//     //   if (widgetId === MAIN_CONTAINER_WIDGET_ID) {
//     //     // 统计根据实际画布宽度，计算根画布的rightColumn
//     //     return computeMainContainerWidget(canvasWidget, mainCanvasProps)
//     //   }

//     //   return canvasWidget
//     // })()

//     // if (isEmpty(canvasWidgetProps)) {
//     //   throw new TypeError(`widget "${widgetId}" props are empty.`)
//     // }
//     // widgetProps = { ...canvasWidgetProps }

//     // if (widgetId !== MAIN_CONTAINER_WIDGET_ID) {
//     //   // 根画布属性重新计算后，保证其他widget的部分属性随之更新为最新
//     //   if (props.type === "CANVAS_WIDGET") {
//     //     widgetProps.rightColumn = props.rightColumn
//     //     widgetProps.bottomRow = props.bottomRow
//     //     widgetProps.minHeight = props.minHeight
//     //     widgetProps.shouldScrollContents = props.shouldScrollContents
//     //     widgetProps.canExtend = props.canExtend
//     //     widgetProps.parentId = props.parentId
//     //   } else {
//     //     widgetProps.parentColumnSpace = props.parentColumnSpace
//     //     widgetProps.parentRowSpace = props.parentRowSpace
//     //     widgetProps.parentId = props.parentId
//     //   }
//     // }

//     // widgetProps.children = children

//     // widgetProps = { ...props, ...widgetProps, children }
//     // return <WrappedWidget {...widgetProps} />

//   }
// }


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
    // key: generateReactKey(),
    iconSVG: config.icon,
    isCanvas: config.isCanvas,
    operation: config?.operation,
  }

  store.dispatch(addWidgetConfig(_config))

  WidgetFactory.storeWidgetConfig(config.type, _config)
}