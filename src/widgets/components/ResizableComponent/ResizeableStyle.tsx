import { WIDGET_PADDING } from "@/constant/widget";
import styled, { css } from "styled-components"

const EDGE_RESIZE_HANDLE_WIDTH = 6

let theme = {
  colors: {
    widgetLightBorder: '#6871EF',
    widgetMultiSelectBorder: '#6871EF',
    widgetBorder: '#2cbba6'
  }
}

/** 竖直方向,before是线，after是点*/
const VerticalBorderStyles: any = css<{
  showAsBorder: boolean;
  showLightBorder: boolean;
}>`
  position: absolute;
  top: ${0 - WIDGET_PADDING}px;
  height: calc(100% + ${WIDGET_PADDING * 2}px);
  width:${EDGE_RESIZE_HANDLE_WIDTH}px;
  // background:yellow;
  ${(props) => (!props.showAsBorder ? "cursor: col-resize;" : "")}

  &::before {
    position: absolute;
    content: "";
    bottom: 0;
    top: 0;
    width: 1px;
    background: ${(props) => {
    if (props.showLightBorder) return theme.colors.widgetLightBorder

    if (props.showAsBorder) return theme.colors.widgetMultiSelectBorder
    return theme.colors.widgetBorder
  }};
  }

  &::after {
    position: absolute;
    content: "";
    width: 6px;
    height: 12px;
    box-sizing: border-box;
    border-radius: 2px;
    border: 1px solid #2cbba6;
    background: #FFF;
    top: calc(50% - 6px);
  }
`

/** 水平方向*/
const HorizontalBorderStyles: any = css<{
  showAsBorder: boolean;
  showLightBorder: boolean;
}>`
  position: absolute;
  left:-${WIDGET_PADDING}px;
  height:${EDGE_RESIZE_HANDLE_WIDTH}px;
  width: calc(100% + ${WIDGET_PADDING * 2}px);
  ${(props) => (!props.showAsBorder ? "cursor: row-resize;" : "")}
  // background:blue;
  &:before {
    position: absolute;
    content: "";
    right: 0px;
    left: 0px;
    height: 1px;
    background: ${(props) => {
    if (props.showLightBorder) return theme.colors.widgetLightBorder

    if (props.showAsBorder) return theme.colors.widgetMultiSelectBorder
    return theme.colors.widgetBorder
  }};
  }

  &::after {
    position: absolute;
    content: "";
    width: 12px;
    height: 6px;
    box-sizing: border-box;
    border-radius: 2px;
    border: 1px solid #2cbba6;
    background: #FFF;
    left: calc(50% - 6px);
  }
`

//四个角
const CornerHandleStyles = css`
  position: absolute;
  z-index: 3;
  width: ${EDGE_RESIZE_HANDLE_WIDTH}px;
  height: ${EDGE_RESIZE_HANDLE_WIDTH}px;
  // background:blue;
`

export const LeftBorderStyles = styled.div`
  ${VerticalBorderStyles};
  left: -${EDGE_RESIZE_HANDLE_WIDTH}px;
  &::before {
    left: ${1.5}px;
  }
  &::after {
    left: -${1}px;
  }
`

export const RightBorderStyles = styled.div`
  ${VerticalBorderStyles};
  right: -${EDGE_RESIZE_HANDLE_WIDTH}px;

  &::before {
    right: ${1.5}px;
  }

  &::after {
    right: -${1}px;
  }
`

export const TopBorderStyles = styled.div`
  ${HorizontalBorderStyles};
  top: -${EDGE_RESIZE_HANDLE_WIDTH}px;
  &:before {
    top:${1.5}px;
  }
   &::after {
    top:-${1}px;
  }
`

export const BottomBorderStyles = styled.div`
  ${HorizontalBorderStyles};
  bottom: -${EDGE_RESIZE_HANDLE_WIDTH}px;
  &:before {
    bottom: ${1.5}px;
  }
   &::after {
    top:${1}px;
  }
`

export const BottomRightBorderStyles = styled.div<{
  showAsBorder: boolean;
}>`
  ${CornerHandleStyles};
  bottom: -${EDGE_RESIZE_HANDLE_WIDTH}px;
  right: -${EDGE_RESIZE_HANDLE_WIDTH}px;
  ${(props) => (!props.showAsBorder ? "cursor: se-resize;" : "")}
`

export const BottomLeftBorderStyles = styled.div<{
  showAsBorder: boolean;
}>`
  ${CornerHandleStyles};
  left: -${EDGE_RESIZE_HANDLE_WIDTH }px;
  bottom: -${EDGE_RESIZE_HANDLE_WIDTH }px;
  ${(props) => (!props.showAsBorder ? "cursor: sw-resize;" : "")}
`
export const TopLeftBorderStyles = styled.div<{
  showAsBorder: boolean;
}>`
  ${CornerHandleStyles};
  left: -${EDGE_RESIZE_HANDLE_WIDTH }px;
  top: -${EDGE_RESIZE_HANDLE_WIDTH }px;
  ${(props) => (!props.showAsBorder ? "cursor: nw-resize;" : "")}
`
export const TopRightBorderStyles = styled.div<{
  showAsBorder: boolean;
}>`
  ${CornerHandleStyles};
  right: -${EDGE_RESIZE_HANDLE_WIDTH }px;
  top: -${EDGE_RESIZE_HANDLE_WIDTH }px;
  ${(props) => (!props.showAsBorder ? "cursor: ne-resize;" : "")}
`
