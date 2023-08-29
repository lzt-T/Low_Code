import { WIDGET_PADDING } from "@/constant/widget";
import styled, { css } from "styled-components"

const EDGE_RESIZE_HANDLE_WIDTH = 6

let theme = {
  colors: {
    widgetLightBorder: '#6871EF',
    widgetMultiSelectBorder: '#6871EF',
    widgetBorder: '#768896'
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
    height: 6px;
    border-radius: 50%;
    background: ${(props) => {
    return props.showLightBorder ? theme.colors.widgetLightBorder : theme.colors.widgetBorder
  }};
    top: calc(50% - 3px);
  }
`

/** 水平方向*/
const HorizontalBorderStyles: any = css<{
  showAsBorder: boolean;
  showLightBorder: boolean;
}>`
  position: absolute;
  left:-${EDGE_RESIZE_HANDLE_WIDTH / 2}px;
  height:${EDGE_RESIZE_HANDLE_WIDTH}px;
  width: calc(100% + ${EDGE_RESIZE_HANDLE_WIDTH}px);
  ${(props) => (!props.showAsBorder ? "cursor: row-resize;" : "")}

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
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(props) =>
    props.showLightBorder
      ? theme.colors.widgetLightBorder
      : theme.colors.widgetBorder};
    left: calc(50% - 3px);
  }
`

//四个角
const CornerHandleStyles = css`
  position: absolute;
  z-index: 3;
  width: ${EDGE_RESIZE_HANDLE_WIDTH}px;
  height: ${EDGE_RESIZE_HANDLE_WIDTH}px;
`

export const LeftBorderStyles = styled.div`
  ${VerticalBorderStyles};
  &::before {
    left: -${WIDGET_PADDING}px;
  }
  &::after {
    left: -${EDGE_RESIZE_HANDLE_WIDTH + 1}px;
  }
`

export const RightBorderStyles = styled.div`
  ${VerticalBorderStyles};
  right: 0px;

  &::before {
    right: -${WIDGET_PADDING}px;
  }

  &::after {
    right: -${EDGE_RESIZE_HANDLE_WIDTH + 1}px;
  }
`

export const TopBorderStyles = styled.div`
  ${HorizontalBorderStyles};
  top: 0px;
  &:before {
    top:  -${WIDGET_PADDING}px;
  }
   &::after {
    top:-${EDGE_RESIZE_HANDLE_WIDTH + 1}px;
  }
`

export const BottomBorderStyles = styled.div`
  ${HorizontalBorderStyles};
  bottom: 0px;
  &:before {
    bottom:  -${WIDGET_PADDING}px;
  }
   &::after {
    top:${EDGE_RESIZE_HANDLE_WIDTH + 1}px;
  }
`

export const BottomRightBorderStyles = styled.div<{
  showAsBorder: boolean;
}>`
  ${CornerHandleStyles};
  bottom: -${EDGE_RESIZE_HANDLE_WIDTH / 2}px;
  right: -${EDGE_RESIZE_HANDLE_WIDTH / 2}px;
  ${(props) => (!props.showAsBorder ? "cursor: se-resize;" : "")}
`

export const BottomLeftBorderStyles = styled.div<{
  showAsBorder: boolean;
}>`
  ${CornerHandleStyles};
  left: -${EDGE_RESIZE_HANDLE_WIDTH / 2}px;
  bottom: -${EDGE_RESIZE_HANDLE_WIDTH / 2}px;
  ${(props) => (!props.showAsBorder ? "cursor: sw-resize;" : "")}
`
export const TopLeftBorderStyles = styled.div<{
  showAsBorder: boolean;
}>`
  ${CornerHandleStyles};
  left: -${EDGE_RESIZE_HANDLE_WIDTH / 2}px;
  top: -${EDGE_RESIZE_HANDLE_WIDTH / 2}px;
  ${(props) => (!props.showAsBorder ? "cursor: nw-resize;" : "")}
`
export const TopRightBorderStyles = styled.div<{
  showAsBorder: boolean;
}>`
  ${CornerHandleStyles};
  right: -${EDGE_RESIZE_HANDLE_WIDTH / 2}px;
  top: -${EDGE_RESIZE_HANDLE_WIDTH / 2}px;
  ${(props) => (!props.showAsBorder ? "cursor: ne-resize;" : "")}
`
