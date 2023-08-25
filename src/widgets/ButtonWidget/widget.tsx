import React from 'react'
import BaseWidget from '@/class/BaseWidegt'
import Button from './component'

export interface ButtonWidgetProps  {
  text: string;
  isDisabled: boolean;
  isVisible: boolean;
  buttonColor: string,
  buttonVariant: string,
  placement: string,
  iconAlign: string,
  iconName: string,
  borderRadius: string,
  boxShadow: string,
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


  /** 获取widget组件*/
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
