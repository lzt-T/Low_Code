import React from 'react'
import BaseWidget from '@/widgets/components/BaseWidegt'
import Button from './component'
import { WidgetProps } from '@/interface/widget'

export interface ButtonWidgetProps extends WidgetProps  {
  [propsName:string]:any
}

export interface ButtonWidgetState  {
  isLoading: boolean;
}

export default class ButtonWidget extends BaseWidget<ButtonWidgetProps,ButtonWidgetState> {
  constructor(props: ButtonWidgetProps) {
    super(props)
    this.state = {
      isLoading: false
    }
  }


  /** 获取widget组件Dom*/
  getPageView() {
    const {
      text, isDisabled, isVisible, buttonColor,
      buttonVariant, placement, iconAlign, iconName,
      borderRadius, boxShadow
    } = this.props

    /** 传递给组件的参数,props是configMap*/
    const btnProps = {
      text,
      isDisabled,
      isVisible,
      buttonColor,
      buttonVariant,
      placement,
      iconAlign,
      iconName,
      borderRadius,
      boxShadow
    }
    return <Button {...btnProps} />
  }

  /** 获取widget类型*/
  static getWidgetType() {
    return "BUTTON_WIDGET"
  }
}
