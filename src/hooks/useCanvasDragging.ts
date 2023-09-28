import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import { endDragging, isDraggingSelector, isResizingSelector, setIsDragging } from "@/store/slices/dragResize";
import { getAbsolutePixels, getNearestParentCanvas } from "@/utils/helpers";
import { useDragging } from "./useDragging";

export default function useCanvasDragging(
  slidingArenaRef: RefObject<HTMLDivElement>,
  stickyCanvasRef: RefObject<HTMLCanvasElement>,
  otherPropsObj: {
    widgetId: string,
    /** 画布单位宽度*/
    snapColumnSpace: number,
    /** 画布单位高度*/
    snapRowSpace: number,
  }
) {

  const { snapColumnSpace, snapRowSpace, widgetId } = otherPropsObj
  //拖拽中
  let { setLastMousePosition, isCanPlaced } = useDragging(widgetId, snapColumnSpace, snapRowSpace)
  const dispatch = useAppDispatch()
  const isResizing = useAppSelector(isResizingSelector)
  const isDragging = useAppSelector(isDraggingSelector)
  const newWidgetDraggingInfo = useAppSelector((state) => state.ui.dragResize.dragDetails.newWidget)
  /** 可滚动的父元素*/
  const scrollParent: Element | null = getNearestParentCanvas(slidingArenaRef.current)

  /** 最后一次鼠标移动事件*/
  const lastMouseMoveEvent = useRef<any>({
    offsetX: 0,
    offsetY: 0,
    scrollY: 0,
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


  useEffect(() => {
    /** 鼠标移动*/
    const onMouseMove = (e: MouseEvent) => {

    }

    const onMouseenter = () => {

    }
    const onMouseleave = () => {

    }

    /**
    * @description  绘制移动轮廓
    * @param originX 左上角x坐标
    * @param originY 左上角y坐标
    * @returns
    */
    const drawMovingContours = (originX: number, originY: number) => {
      if (!stickyCanvasRef.current) {
        return
      }
      const ctx: any = stickyCanvasRef.current?.getContext('2d')
      ctx.clearRect(0, 0, stickyCanvasRef.current.width, stickyCanvasRef.current.height)
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
      let originActualInfo = getActualLocation(originX, originY, snapColumnSpace, snapRowSpace)
      ctx.strokeRect(
        originActualInfo.X,
        originActualInfo.Y,
        newWidgetDraggingInfo.columns * snapColumnSpace,
        newWidgetDraggingInfo.rows * snapRowSpace
      )
      setLastMousePosition(originActualInfo.X, originActualInfo.Y)
      return {
        X: originActualInfo.X,
        Y: originActualInfo.Y,
      }
    }

    /** 鼠标拖拽移动*/
    const onWindowMouseMove = (e: MouseEvent) => {

      if (!stickyCanvasRef.current || !newWidgetDraggingInfo.columns || !newWidgetDraggingInfo.rows) {
        return
      }
      let boundingClientRect = (stickyCanvasRef.current as any).getBoundingClientRect();

      let originActualInfo = drawMovingContours(e.pageX - boundingClientRect.left - newWidgetDraggingInfo.columns * snapColumnSpace / 2,
        e.pageY + Math.abs(boundingClientRect.top) - newWidgetDraggingInfo.rows * snapRowSpace / 2,
      )
      lastMouseMoveEvent.current = {
        offsetX: originActualInfo?.X,
        offsetY: originActualInfo?.Y,
        scrollY: boundingClientRect.top,
      }
    }

    const onScroll = (e: Event) => {
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
    }

    /**
    * @description 鼠标松开
    * @param 
    * @returns
    */
    const onMouseup = (e: MouseEvent) => {
      dispatch(setIsDragging(false))
    }

    slidingArenaRef.current?.addEventListener('mousemove', onMouseMove)
    scrollParent?.addEventListener('scroll', onScroll)
    slidingArenaRef.current?.addEventListener('mouseenter', onMouseenter)
    slidingArenaRef.current?.addEventListener('mouseleave', onMouseleave)
    slidingArenaRef.current?.addEventListener('mouseup', onMouseup)
    window.addEventListener('mouseup', onMouseup)
    document.body.addEventListener('mousemove', onWindowMouseMove)

    return () => {
      slidingArenaRef.current?.removeEventListener('mousemove', onMouseMove)
      slidingArenaRef.current?.removeEventListener('mouseup', onMouseup)
    }
  }, [isDragging, isResizing, newWidgetDraggingInfo, setLastMousePosition
    , scrollParent, snapColumnSpace, snapRowSpace
  ])

}