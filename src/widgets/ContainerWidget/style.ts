import styled from "styled-components";


type MainContainerProps = {
  height: number
  /** 是否展示网格*/
  $isShowDragLayer: boolean
}


export const MainContainerSty = styled.div<MainContainerProps>`
  position: relative;
  height: ${props => props.height}px;
  background:${props => props.$isShowDragLayer ? 'transparent' : '#F8FAFC'};
`


export const ContainerScrollSty = styled.div`
  boxShow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  position: relative;
`

type ContainerStyProps = MainContainerProps
export const ContainerSty = styled.div<ContainerStyProps>`
  position: relative;
  height: ${props => props.height}px;
  min-height: 100%;
  background-color: ${props => props.$isShowDragLayer ? 'transparent' : '#fff'};
`

