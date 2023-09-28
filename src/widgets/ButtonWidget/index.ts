import Widget from './widget'
import { IWidgetConfiguration} from '@/interface/widget'
import iconSVG from './icon.svg'

export const config: IWidgetConfiguration = {
  //类型
  type: Widget.getWidgetType(),
  name: 'Button',
  //icon
  icon: iconSVG,
  //显示名称
  displayName: 'Button',
  defaults: {
    rows: 4,
    columns: 20,
    widgetName: "Button Widget",
    text: '按钮',
    isDisabled: false,
    isVisible: true,
    buttonColor: '#4f46e5',
    iconAlign: '',
    iconName: '',
    borderRadius: '5px',
    boxShadow: 'none',
  },
  properties: {

  }
}

export default Widget
