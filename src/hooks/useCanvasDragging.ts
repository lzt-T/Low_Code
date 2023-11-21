import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import { dragDetailsSelector, isDraggingSelector, isResizingSelector, setDraggedOn, setIsDragging, setDraggingStatus, draggingStatusSelector, leaveContainerDirectionSelector, draggingTypeSelector, existingWidgetSelector } from "@/store/slices/dragResize";
import { getNearestParentCanvas } from "@/utils/helpers";
import { useDragging } from "./useDragging";
import { MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas";
import { getWidgetsSelector } from "@/store/slices/canvasWidgets";
import { DraggingStatus, DraggingType } from "@/enum/move";
import { DirectionAttributes } from "@/interface/space";
import { getSelectedWidgets } from "@/selectors/widgetSelectors";

export default function useCanvasDragging(
  slidingArenaRef: RefObject<HTMLDivElement>,
  stickyCanvasRef: RefObject<HTMLCanvasElement>,
  otherPropsObj: {
    /** 画布id*/
    widgetId: string,
    /** 画布单位宽度*/
    snapColumnSpace: number,
    /** 画布单位高度*/
    snapRowSpace: number,
    /** 父亲id*/
    parentId: string | undefined
  }
) {
  const draggingType = useAppSelector(draggingTypeSelector);
  const selectedWidgets = useAppSelector(getSelectedWidgets);
  const existingWidget = useAppSelector(existingWidgetSelector)

  const { snapColumnSpace, snapRowSpace, widgetId, parentId } = otherPropsObj
  //拖拽中
  let { setMousePosition, isCanPlaced, isMoveOutContainer, setLastMousePosition } = useDragging(widgetId, snapColumnSpace, snapRowSpace)
  const dispatch = useAppDispatch()
  const isResizing = useAppSelector(isResizingSelector)
  const isDragging = useAppSelector(isDraggingSelector)
  const dragDetails = useAppSelector(dragDetailsSelector)
  const canvasWidgets = useAppSelector(getWidgetsSelector)
  const draggingStatus = useAppSelector(draggingStatusSelector)
  const leaveContainerDirection = useAppSelector(leaveContainerDirectionSelector)
  const newWidgetInfo = useAppSelector((state) => state.ui.dragResize.dragDetails.newWidget)

  const newWidgetDraggingInfo = useMemo(() => {
    if (draggingType === DraggingType.NONE) {
      return {}
    }
    if (draggingType === DraggingType.NEW_WIDGET) {
      return newWidgetInfo
    }
    let widgetInfo = canvasWidgets[selectedWidgets[0]]
    return {
      rows: widgetInfo.bottomRow - widgetInfo.topRow,
      columns: widgetInfo.rightColumn - widgetInfo.leftColumn,
      leftColumn: widgetInfo.leftColumn,
      topRow: widgetInfo.topRow,
    }

  }, [draggingType, selectedWidgets, canvasWidgets, newWidgetInfo])

  /** 可滚动的父元素*/
  const scrollParent: Element | null = getNearestParentCanvas(slidingArenaRef.current)

  /** 是否是当前画布*/
  const isCurrentCanvas = useMemo(() => {
    return widgetId === dragDetails.draggedOn
  }, [dragDetails.draggedOn, widgetId])

  /** 最后一次鼠标移动事件*/
  const lastMouseMoveEvent = useRef<any>({
    offsetX: 0,
    offsetY: 0,
    scrollY: 0,
    pageY: 0,
    pageX: 0,
  });

  /**
  * @description 获取实际位置
  * @param x left距离 
  * @param y top距离
  * @param columnWidth 画布单位宽度
  * @param rowHeight 画布单位高度
  */
  const getActualLocation = useCallback((x: number, y: number, columnWidth: number, rowHeight: number) => {
    const snappedX = Math.round(x / columnWidth)
    const snappedY = Math.round(y / rowHeight)
    return {
      X: snappedX * columnWidth,
      Y: snappedY * rowHeight,
    }
  }, [])


  /**
  * @description 设置上一次鼠标的位置，用于回弹
  * @param 
  * @returns
  */
  const setLastMousePositionFn = useCallback((curMousePosition: { X: number, Y: number }) => {
    const { topRow, bottomRow, rightColumn, leftColumn, parentRowSpace, parentColumnSpace } = canvasWidgets[dragDetails.lastDraggedOn];
    let resultX = curMousePosition.X;
    let resultY = curMousePosition.Y;
    let condition: Record<DirectionAttributes, () => void> = {
      [DirectionAttributes.top]: () => {
        resultY = topRow * parentRowSpace
      },
      [DirectionAttributes.bottom]: () => {
        resultY = bottomRow * parentRowSpace - newWidgetDraggingInfo.rows * snapRowSpace
      },
      [DirectionAttributes.left]: () => {
        resultX = leftColumn * parentColumnSpace - newWidgetDraggingInfo.columns * snapColumnSpace
      },
      [DirectionAttributes.right]: () => {
        resultX = rightColumn * parentColumnSpace
      },
    }

    leaveContainerDirection != "" && condition[leaveContainerDirection]()
    setLastMousePosition(resultX, resultY)
  }, [canvasWidgets, dragDetails, leaveContainerDirection, setLastMousePosition, newWidgetDraggingInfo,
    snapColumnSpace, snapRowSpace
  ])

  /**
    * @description  绘制移动轮廓
    * @param originX 左上角x坐标
    * @param originY 左上角y坐标
    * @returns
    */
  const drawMovingContours = useCallback((originX: number, originY: number) => {
    if (!stickyCanvasRef.current) {
      return
    }
    const ctx: any = stickyCanvasRef.current?.getContext('2d')
    ctx.clearRect(0, 0, stickyCanvasRef.current.width, stickyCanvasRef.current.height)
    let originActualInfo = getActualLocation(originX, originY, snapColumnSpace, snapRowSpace)

    /** 是当前画布才绘画轮廓*/
    if (isCurrentCanvas) {
      //填充
      ctx.fillStyle = isCanPlaced.current ? "rgb(104, 113, 239, 0.6)" : "rgb(255, 0, 0, 0.6)";
      ctx.fillRect(
        originX,
        originY,
        newWidgetDraggingInfo.columns * snapColumnSpace,
        newWidgetDraggingInfo.rows * snapRowSpace
      );

      //轮廓
      ctx.setLineDash([3])
      ctx.strokeStyle = 'rgb(104, 113, 239)';
      ctx.strokeRect(
        originActualInfo.X,
        originActualInfo.Y,
        newWidgetDraggingInfo.columns * snapColumnSpace,
        newWidgetDraggingInfo.rows * snapRowSpace
      )
    }

    /** 在当前画布并且移出时，设置画布为父亲画布*/
    if (isCurrentCanvas && isMoveOutContainer.current && parentId) {
      dispatch(setDraggedOn(parentId))
      dispatch(setDraggingStatus(DraggingStatus.GO_OUT))
    }

    /** 离开容器时的回弹效果*/
    if (isCurrentCanvas && draggingStatus === DraggingStatus.GO_OUT) {
      setLastMousePositionFn(originActualInfo)
    }

    /** 将状态变为拖拽的状态*/
    if (draggingStatus != DraggingStatus.MOVE) {
      requestAnimationFrame(() => {
        dispatch(setDraggingStatus(DraggingStatus.MOVE))
      })
    }

    setMousePosition(originActualInfo.X, originActualInfo.Y)
    return {
      X: originActualInfo.X,
      Y: originActualInfo.Y,
    }
  }, [snapColumnSpace, snapRowSpace, newWidgetDraggingInfo, isCurrentCanvas, draggingStatus,
    getActualLocation, setMousePosition, setLastMousePositionFn, parentId, stickyCanvasRef.current,
    isCanPlaced.current, isMoveOutContainer.current
  ])

  /** 鼠标拖拽移动*/
  const onWindowMouseMove = useCallback((e: MouseEvent) => {
    if (!stickyCanvasRef.current || !newWidgetDraggingInfo.columns || !newWidgetDraggingInfo.rows) {
      return
    }

    let boundingClientRect = (stickyCanvasRef.current as any).getBoundingClientRect();

    /** 容器中的鼠标Y轴位置(包含滚动条的距离)*/
    let containerMouseY;

    if (widgetId != MAIN_CONTAINER_WIDGET_ID) {
      containerMouseY = e.pageY - boundingClientRect.y
    } else {
      containerMouseY = e.pageY + Math.abs(boundingClientRect.top)
    }

    let originActualInfo;
    if (draggingType === DraggingType.NEW_WIDGET) {
      originActualInfo = drawMovingContours(
        e.pageX - boundingClientRect.left - newWidgetDraggingInfo.columns * snapColumnSpace / 2,
        containerMouseY - newWidgetDraggingInfo.rows * snapRowSpace / 2,
      )
    }
    if (draggingType === DraggingType.EXISTING_WIDGET) {
      //鼠标X在元素中的10%的位置
      originActualInfo = drawMovingContours(
        e.pageX - boundingClientRect.left - newWidgetDraggingInfo.columns * snapColumnSpace / 2 + newWidgetDraggingInfo.columns * snapColumnSpace * (0.5 - existingWidget.mouseXInEleProportion),
        containerMouseY - newWidgetDraggingInfo.rows * snapRowSpace / 2 + newWidgetDraggingInfo.rows * snapRowSpace * (0.5 - existingWidget.mouseYInEleProportion),
      )
    }

    lastMouseMoveEvent.current = {
      offsetX: originActualInfo?.X,
      offsetY: originActualInfo?.Y,
      scrollY: boundingClientRect.top,
      pageY: e.pageY,
      pageX: e.pageX,
    }
  }, [
    snapColumnSpace, snapRowSpace, newWidgetDraggingInfo,
    drawMovingContours, widgetId, stickyCanvasRef.current,
    draggingType, existingWidget
  ])

  const onScroll = useCallback(() => {
    if (!stickyCanvasRef.current) {
      return
    }
    let boundingClientRect = (stickyCanvasRef.current as any).getBoundingClientRect();
    let distance;
    /** 向下*/
    if (lastMouseMoveEvent.current.scrollY > boundingClientRect.top) {
      distance = lastMouseMoveEvent.current.scrollY - boundingClientRect.top
    } else {
      distance = lastMouseMoveEvent.current.scrollY - boundingClientRect.top
    }

    drawMovingContours(lastMouseMoveEvent.current.offsetX,
      lastMouseMoveEvent.current.offsetY + distance,
    )
  }, [
    drawMovingContours, lastMouseMoveEvent.current, stickyCanvasRef.current
  ])

  useEffect(() => {
    if (draggingType != DraggingType.EXISTING_WIDGET) {
      return
    }

    let widgetInfo = canvasWidgets[selectedWidgets[0]];
    let { topRow, leftColumn, parentRowSpace, parentColumnSpace } = widgetInfo;
    let originX = leftColumn * parentColumnSpace;
    let originY = topRow * parentRowSpace;
    setLastMousePosition(originX, originY)
    setMousePosition(originX, originY)
  }, [draggingType])

  useEffect(() => {
    // 防止离开的一瞬间没有蓝色框
    if (draggingStatus === DraggingStatus.GO_OUT) {
      onWindowMouseMove(lastMouseMoveEvent.current)
    }
  }, [draggingStatus])

  /**
  * @description 鼠标松开
  * @param 
  * @returns
  */
  const onMouseup = useCallback((e: MouseEvent) => {
    dispatch(setIsDragging(false))
  }, [])

  useEffect(() => {
    scrollParent?.addEventListener('scroll', onScroll)
    slidingArenaRef.current?.addEventListener('mouseup', onMouseup)
    window.addEventListener('mouseup', onMouseup)
    document.body.addEventListener('mousemove', onWindowMouseMove)

    return () => {
      scrollParent?.removeEventListener('scroll', onScroll)
      slidingArenaRef.current?.removeEventListener('mouseup', onMouseup)
      window.removeEventListener('mouseup', onMouseup)
      document.body.removeEventListener('mousemove', onWindowMouseMove)
    }
  },
    [
      onScroll, onWindowMouseMove, onMouseup, scrollParent, slidingArenaRef.current
    ]
  )
}