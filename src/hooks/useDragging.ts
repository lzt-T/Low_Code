import { setReflowingWidgets, stopReflow, widgetsSpaceGraphSelector } from "@/store/slices/widgetReflowSlice";
import { useAppDispatch, useAppSelector } from "./redux";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReSizeDirection, ReflowDirection } from "@/enum/move";
import { endDragging, isDraggingSelector } from "@/store/slices/dragResize";
import { addNewWidgetChunk, getWidgetChildrenDetailSelector, getWidgetChildrenSelector, getWidgetsSelector, updateWidgetAccordingWidgetId, updateWidgets } from "@/store/slices/canvasWidgets";
import { ReflowData, WidgetReSizeInfo } from "./useResize";
import _ from "lodash";
import { COLUM_NUM, MIN_HEIGHT_ROW, MIN_WIDTH_COLUMN } from "@/constant/widget";
import { WidgetRowCols } from "@/interface/widget";
import { MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas";


type WidgetsMaxInfo = {
  /** widget在一个方向上的序号*/
  serialNumber: number,
  /** 一个方向上的widgets最大长度和包括自己 */
  maxDistance: number,
  /** 最小可以到达的边界值，超过这个边界就是挤压*/
  minBoundary: number,
}
//拖拽
export const useDragging = (
  /** 画布id*/
  canvasId: string,
  /** 画布宽单位大小*/
  snapColumnSpace: number,
  /** 画布高单位大小*/
  snapRowSpace: number,
) => {
  const canvasWidgets = useAppSelector(getWidgetsSelector);
  const canvasWidgetsCopy = useRef<any>({});
  canvasWidgetsCopy.current = canvasWidgets

  const dispatch = useAppDispatch()
  /** 画布中的widgets*/
  const canvasWidgetsChildrenDetail = useAppSelector(getWidgetChildrenDetailSelector(canvasId));
  const canvasWidgetsChildrenDetailCopy = useRef<any>([]);
  canvasWidgetsChildrenDetailCopy.current = canvasWidgetsChildrenDetail

  /** 新生成widget的信息*/
  const newWidgetDraggingInfo = useAppSelector((state) => state.ui.dragResize.dragDetails.newWidget)

  const isDragging = useAppSelector(isDraggingSelector)
  const isHasDragging = useRef(false);
  /** reflow的数据*/
  const reflowData = useRef<ReflowData>({})
  /** 位置关系图*/
  const widgetsSpaceGraph = useAppSelector(widgetsSpaceGraphSelector)[canvasId];

  const widgetsSpaceGraphCopy = useRef<any>();
  widgetsSpaceGraphCopy.current = widgetsSpaceGraph
  /** widget距离关系信息*/
  const widgetsDistanceInfo = useRef<{ [propName: string]: WidgetsMaxInfo }>({});

  /** 拖拽widget四个方向上的widget个数*/
  let directionWidgetNum = useRef({
    [ReSizeDirection.TOP]: 0,
    [ReSizeDirection.BOTTOM]: 0,
    [ReSizeDirection.LEFT]: 0,
    [ReSizeDirection.RIGHT]: 0,
  })

  let newWidgetPosition = useRef<any>({});

  /** 是否可以放置*/
  const isCanPlaced = useRef<boolean>(true)

  /** 记录在大小变化过程中，widget的信息，如位置、移动方向、碰撞时鼠标临界值*/
  const widgetsResizeInfo = useRef<Map<string, WidgetReSizeInfo>>(new Map());

  /** 动画*/
  let draggingAnimation = useRef<any>();

  /** 高度*/
  const rows = useRef<number>(0)
  rows.current = newWidgetDraggingInfo.rows

  /** 宽度*/
  const columns = useRef<number>(0)
  columns.current = newWidgetDraggingInfo.columns

  /** 父亲边框位置信息*/
  const parentBlackInfo: WidgetRowCols = useMemo(() => {
    let parent = canvasWidgetsCopy.current[canvasId];

    return {
      topRow: 0,
      bottomRow: canvasId === MAIN_CONTAINER_WIDGET_ID ? parent?.bottomRow / snapRowSpace : parent?.bottomRow - parent?.topRow,
      leftColumn: 0,
      rightColumn: canvasId === MAIN_CONTAINER_WIDGET_ID ? parent.snapColumns : parent?.rightColumn - parent?.leftColumn,
    }
  }, [])

  /** 拖拽左上方顶点位置*/
  const mousePosition = useRef<{
    x: number,
    y: number,
  }>({
    x: 0,
    y: 0,
  })
  const lastMousePosition = useRef<{
    x: number,
    y: number,
  }>({
    x: 0,
    y: 0,
  })

  const getDirection = useCallback((x: number, y: number): ReflowDirection => {
    if (x === lastMousePosition.current.x && y < lastMousePosition.current.y) {
      return ReflowDirection.TOP
    }
    if (x === lastMousePosition.current.x && y > lastMousePosition.current.y) {
      return ReflowDirection.BOTTOM
    }
    if (y === lastMousePosition.current.y && x < lastMousePosition.current.x) {
      return ReflowDirection.LEFT
    }
    if (y === lastMousePosition.current.y && x > lastMousePosition.current.x) {
      return ReflowDirection.RIGHT
    }
    if (x > lastMousePosition.current.x && y > lastMousePosition.current.y) {
      return ReflowDirection.BOTTOMRIGHT
    }
    if (x > lastMousePosition.current.x && y < lastMousePosition.current.y) {
      return ReflowDirection.TOPRIGHT
    }
    if (x < lastMousePosition.current.x && y > lastMousePosition.current.y) {
      return ReflowDirection.BOTTOMLEFT
    }
    if (x < lastMousePosition.current.x && y < lastMousePosition.current.y) {
      return ReflowDirection.TOPLEFT
    }
    return ReflowDirection.UNSET
  }, [])

  const onDragStart = useCallback(() => {
    lastMousePosition.current = { x: 0, y: 0 }
    widgetsResizeInfo.current.clear()
  }, [])

  /** 获取当前拖拽widget位置信息*/
  const getCurrentDraggingPosition = useCallback((x: number, y: number) => {
    const startRow = y / snapRowSpace
    const startColumn = x / snapColumnSpace
    return {
      topRow: startRow,
      bottomRow: startRow + rows.current,
      leftColumn: startColumn,
      rightColumn: startColumn + columns.current,
    }
  }, [])

  /**
  * @description 是否满足条件
  * @param arr 进行判断的标记数组 {Array}
  * @param startInd 开始下标 {number}
  * @param endInd 结束下标 {number}
  * @returns 返回是否满足条件 {boolean}
  */
  const getContactState = useCallback((arr: number[], startInd: number, endInd: number): boolean => {
    let isTrue: boolean = true
    for (let i = startInd; i <= endInd; i++) {
      if (arr[i] === 1) {
        isTrue = false
      }
    }
    return isTrue
  }, [])


  /**
* @description 获取一个widget的最大值信息，包括
* @param widgetId  id {string}
* @param direction 方向 {ReSizeDirection}
* @returns {WidgetsMaxInfo} 返回一个对象
* @property {number} serialNumber widget在一个方向上的序号 
* @property {number} maxDistance  一个方向上的widgets最大长度和包括自己 
* @property {number} minBoundary  最小可以到达的边界值，超过这个边界就是挤压
*/
  const getMaxInfo = useCallback((widgetId: string, direction: ReSizeDirection) => {
    const condition: Record<ReSizeDirection, [string, string]> = {
      [ReSizeDirection.TOP]: ['bottom', 'top'],
      [ReSizeDirection.BOTTOM]: ['bottom', 'top'],
      [ReSizeDirection.LEFT]: ['right', 'left'],
      [ReSizeDirection.RIGHT]: ['right', 'left'],
    }
    let startBoundaryNum = widgetsSpaceGraphCopy.current[widgetId].position[condition[direction][0]]
    let endBoundaryNum = widgetsSpaceGraphCopy.current[widgetId].position[condition[direction][1]]
    let distanceSum = startBoundaryNum - endBoundaryNum;
    let maxInfo: WidgetsMaxInfo = {} as WidgetsMaxInfo

    let affectWidgetList = widgetsSpaceGraphCopy.current[widgetId].relations[dragDirection[direction]];
    if (affectWidgetList.length === 0) {
      maxInfo = {
        serialNumber: 0,
        maxDistance: distanceSum,
        minBoundary: 0
      }
      widgetsDistanceInfo.current[widgetId] = { ...maxInfo }
      return { ...maxInfo }
    }

    let maxDistance = distanceSum;
    let maxSerialNumber = 0;

    affectWidgetList.forEach((item: any) => {
      let childrenInfo = getMaxInfo(item.id, direction);
      maxSerialNumber = Math.max(maxSerialNumber, childrenInfo.serialNumber)
      maxDistance = Math.max(maxDistance, childrenInfo.maxDistance + distanceSum)
    })

    maxInfo = {
      serialNumber: maxSerialNumber + 1,
      maxDistance: maxDistance,
      minBoundary: (maxSerialNumber + 1) * MIN_HEIGHT_ROW,
    }
    widgetsDistanceInfo.current[widgetId] = { ...maxInfo }
    return { ...maxInfo }
  }, [])

  /**
  * @description 获取某个一个方向上的最大长度和最大widget个数
  * @param direction 方向 {ReSizeDirection}
  * @returns {Object} 返回一个对象
  * @property {number} maxLength 最大长度和
  * @property {number} maxNumber 最大数量和
  */
  const getMaxLengthAndNumber = useCallback((direction: ReSizeDirection) => {
    const directionTwain: Record<ReSizeDirection, [string, string]> = {
      [ReSizeDirection.TOP]: ['leftColumn', 'rightColumn'],
      [ReSizeDirection.BOTTOM]: ['leftColumn', 'rightColumn'],
      [ReSizeDirection.LEFT]: ['topRow', 'bottomRow'],
      [ReSizeDirection.RIGHT]: ['topRow', 'bottomRow'],
    }
    let sign = new Array(10000).fill(0);
    let maxLength = 0;
    let maxNumber = 0;
    let startDirection = directionTwain[direction][0];
    let endDirection = directionTwain[direction][1];
    let item;

    widgetsResizeInfo.current.forEach((value: any, key: string) => {
      if (
        getContactState(sign, value[startDirection] + 1, value[endDirection] - 1) &&
        value.direction === direction
      ) {
        sign.fill(1, value[startDirection] + 1, value[endDirection] - 1);
        item = getMaxInfo(key, value.direction)
        maxNumber = Math.max(maxNumber, item.serialNumber + 1)
        maxLength = Math.max(maxLength, item.maxDistance)
      }
    })

    return {
      maxLength,
      maxNumber
    }
  }, [])

  /**
 * @description 获取某个widget一个方向上碰撞的reflow数据
 * @param widgetId {string}
 * @param moveRowOrColumn 移动的row或者column带正负号 {string}
 * @param direction {ReSizeDirection}
 * @param widgetsSpaceGraph 位置关系图 
 * @param parentRowSpace 父亲的rowSpace
 * @param parentColumnSpace 父亲的columnSpace
 * @param collisionReflowData 碰撞的reflow数据
 * @param reflowDataItem 当有值时会自动复制给key为widgetId的对象 {undefined | {X: number, Y: number}}
 * @returns {ReflowData}
 */
  const getCollisionReflowData = useCallback((
    widgetId: string,
    moveRowOrColumn: number,
    direction: ReSizeDirection,
    widgetsSpaceGraph: any,
    parentRowSpace: number,
    parentColumnSpace: number,
    collisionReflowData: any = {},
    reflowDataItem?: undefined | {
      X: number,
      Y: number,
    }
  ) => {

    let affectWidgetList = widgetsSpaceGraph[widgetId].relations[dragDirection[direction]];
    let moveReflowDataItem: { X: number, Y: number } = {} as any;
    let resultData: ReflowData = {}
    let _Y;
    let _X;

    if (!!reflowDataItem) {
      resultData[widgetId] = {
        X: reflowDataItem.X,
        Y: reflowDataItem.Y
      };
    }

    affectWidgetList.forEach((item: any) => {
      _Y = 0;
      _X = 0;
      moveReflowDataItem = collisionReflowData[item.id]

      if (Math.abs(moveRowOrColumn) <= item.distance) {
        return
      }

      if (direction === ReSizeDirection.TOP) {
        _Y = moveRowOrColumn > 0 ? 0 : (item.distance + moveRowOrColumn) * parentRowSpace;
        //可能多个widgets上面是同一个widget,那么widget就应该取位置最上面的那个
        if (moveReflowDataItem) {
          _Y = Math.min(_Y, moveReflowDataItem.Y);
        }
      }

      if (direction === ReSizeDirection.BOTTOM) {
        _Y = moveRowOrColumn < 0 ? 0 : (moveRowOrColumn - item.distance) * parentRowSpace
        if (moveReflowDataItem) {
          _Y = Math.max(_Y, moveReflowDataItem.Y);
        }
      }

      if (direction === ReSizeDirection.LEFT) {
        _X = moveRowOrColumn > 0 ? 0 : (item.distance + moveRowOrColumn) * parentColumnSpace;
        if (moveReflowDataItem) {
          _X = Math.min(_X, moveReflowDataItem.X);
        }
      }

      if (direction === ReSizeDirection.RIGHT) {
        _X = moveRowOrColumn < 0 ? 0 : (moveRowOrColumn - item.distance) * parentColumnSpace;
        if (moveReflowDataItem) {
          _X = Math.max(_X, moveReflowDataItem.X);
        }
      }

      resultData[item.id] = {
        X: _X,
        Y: _Y,
      };
      collisionReflowData[item.id] = {
        X: _X,
        Y: _Y,
      }

      if (direction === ReSizeDirection.TOP || direction === ReSizeDirection.LEFT) {
        resultData = {
          ...resultData,
          ...getCollisionReflowData(item.id,
            moveRowOrColumn + item.distance,
            direction,
            widgetsSpaceGraph,
            parentRowSpace,
            parentColumnSpace,
            collisionReflowData
          )
        }
      }

      if (direction === ReSizeDirection.BOTTOM || direction === ReSizeDirection.RIGHT) {
        resultData = {
          ...resultData,
          ...getCollisionReflowData(item.id,
            moveRowOrColumn - item.distance,
            direction,
            widgetsSpaceGraph,
            parentRowSpace,
            parentColumnSpace,
            collisionReflowData
          )
        }
      }
    })
    return resultData
  }, [])

  /** 过滤掉不符合的数据*/
  const filtrationBoundaryData = useCallback((currentPosition: any) => {
    /** 去除不在边界内的*/
    widgetsResizeInfo.current.forEach((item, key) => {
      if (
        (item.direction === ReSizeDirection.TOP || item.direction === ReSizeDirection.BOTTOM)
        && (item.leftColumn >= currentPosition.rightColumn || item.rightColumn <= currentPosition.leftColumn)
      ) {
        widgetsResizeInfo.current.delete(key);
      }

      if (
        (item.direction === ReSizeDirection.LEFT || item.direction === ReSizeDirection.RIGHT)
        && (item.topRow >= currentPosition.bottomRow || item.bottomRow <= currentPosition.topRow)
      ) {
        widgetsResizeInfo.current.delete(key);
      }
    })

    /** 去除不在高度内的widget*/
    widgetsResizeInfo.current.forEach((item, key) => {
      if (
        (item.direction === ReSizeDirection.TOP || item.direction === ReSizeDirection.BOTTOM)
        && (item.topRow >= currentPosition.bottomRow || item.bottomRow <= currentPosition.topRow)) {
        widgetsResizeInfo.current.delete(key);
      }
      if (
        (item.direction === ReSizeDirection.LEFT || item.direction === ReSizeDirection.RIGHT)
        && (item.leftColumn >= currentPosition.rightColumn || item.rightColumn <= currentPosition.leftColumn)) {
        widgetsResizeInfo.current.delete(key);
      }
    })
  }, [])

  /**
  * @description 获取widget某个方向上受到挤压widgets的reflow数据
  * @param widgetId  {string} 
  * @param direction 移动方向 {ReSizeDirection} 
  * @param parentSerial 父亲的序号 undefined就是起始点，没有父亲  {number | undefined} 
  * @returns {ReflowData}
  */
  const getExtrusionReflowData = useCallback((widgetId: string, direction: ReSizeDirection, parentSerial: number | undefined = undefined) => {
    let resultData: any = {};
    const directionTwain: Record<ReSizeDirection, [string, string]> = {
      [ReSizeDirection.TOP]: ['topRow', 'bottomRow'],
      [ReSizeDirection.BOTTOM]: ['bottomRow', 'topRow'],
      [ReSizeDirection.LEFT]: ['leftColumn', 'rightColumn'],
      [ReSizeDirection.RIGHT]: ['rightColumn', 'leftColumn'],
    }
    if (!reflowData.current[widgetId]) {
      return {}
    }

    /** 跟父亲序号差值*/
    let serialNumDifference = parentSerial === undefined ? 1 : parentSerial - widgetsDistanceInfo.current[widgetId].serialNumber;
    /** 开始方向*/
    let startDirection = directionTwain[direction][0]
    /** 结束方向*/
    let endDirection = directionTwain[direction][1]
    /** 高度单位长度个数*/
    let heightNum;
    /** 宽度单位长度个数*/
    let widthNum;
    let widgetItem = canvasWidgetsCopy.current[widgetId];
    let reflowDataItem = { ...reflowData.current[widgetId] };
    /** 剩余单位长度个数*/
    let residueUnitLen;
    /** 当前widget边框位置和挤压边界差值*/
    let residueExtrusionDifference;
    /** 当前widget所在边框位置*/
    let currentBorderPosition;
    if (direction === ReSizeDirection.TOP || direction === ReSizeDirection.BOTTOM) {
      currentBorderPosition = widgetItem[startDirection] + reflowDataItem.Y / snapRowSpace;
    }
    if (direction === ReSizeDirection.LEFT || direction === ReSizeDirection.RIGHT) {
      currentBorderPosition = widgetItem[startDirection] + reflowDataItem.X / snapColumnSpace;
    }

    let affectWidgetList = widgetsSpaceGraphCopy.current[widgetId].relations[dragDirection[direction]]
    for (let i = 0; i < affectWidgetList.length; i++) {
      let itemResult = getExtrusionReflowData(affectWidgetList[i].id, direction, widgetsDistanceInfo.current[widgetId].serialNumber)
      resultData = {
        ...resultData,
        ...itemResult
      }
    }

    if (direction === ReSizeDirection.TOP) {
      residueExtrusionDifference = widgetsDistanceInfo.current[widgetId].minBoundary - currentBorderPosition;
      if (residueExtrusionDifference >= 0) {
        residueUnitLen = (widgetItem[endDirection] - widgetItem[startDirection]) - residueExtrusionDifference;
        heightNum = residueUnitLen >= MIN_HEIGHT_ROW * serialNumDifference ? residueUnitLen : MIN_HEIGHT_ROW * serialNumDifference
        resultData[widgetId] = {
          ...reflowData.current[widgetId],
          Y: reflowDataItem.Y + residueExtrusionDifference * snapRowSpace,
          height: heightNum * snapRowSpace
        }
      }
    }

    if (direction === ReSizeDirection.BOTTOM && parentBlackInfo.bottomRow - currentBorderPosition <= widgetsDistanceInfo.current[widgetId].minBoundary) {
      residueExtrusionDifference = widgetsDistanceInfo.current[widgetId].minBoundary - (parentBlackInfo.bottomRow - currentBorderPosition)
      if (residueExtrusionDifference >= 0) {
        residueUnitLen = widgetItem[startDirection] - widgetItem[endDirection] - residueExtrusionDifference
        let y = 0;
        heightNum = residueUnitLen >= MIN_HEIGHT_ROW * serialNumDifference ? residueUnitLen : MIN_HEIGHT_ROW * serialNumDifference
        //在下移动时，widget本身就会下移动，当到达最小值的时候才需要进行调整transform
        if (residueUnitLen <= MIN_HEIGHT_ROW * serialNumDifference) {
          y = Math.abs(residueUnitLen - MIN_HEIGHT_ROW * serialNumDifference) * snapRowSpace
        }

        resultData[widgetId] = {
          ...reflowData.current[widgetId],
          Y: reflowDataItem.Y - y,
          height: heightNum * snapRowSpace
        }
      }
    }

    if (direction === ReSizeDirection.LEFT) {
      residueExtrusionDifference = widgetsDistanceInfo.current[widgetId].minBoundary - currentBorderPosition
      if (residueExtrusionDifference >= 0) {
        residueUnitLen = (widgetItem[endDirection] - widgetItem[startDirection]) - residueExtrusionDifference;
        widthNum = residueUnitLen >= MIN_WIDTH_COLUMN * serialNumDifference ? residueUnitLen : MIN_WIDTH_COLUMN * serialNumDifference
        resultData[widgetId] = {
          ...reflowData.current[widgetId],
          X: reflowDataItem.X + residueExtrusionDifference * snapColumnSpace,
          width: widthNum * snapColumnSpace
        }
      }
    }

    if (direction === ReSizeDirection.RIGHT) {
      residueExtrusionDifference = widgetsDistanceInfo.current[widgetId].minBoundary - (parentBlackInfo.rightColumn - currentBorderPosition)
      if (residueExtrusionDifference >= 0) {
        residueUnitLen = (widgetItem[startDirection] - widgetItem[endDirection]) - residueExtrusionDifference
        let x = 0;

        widthNum = residueUnitLen >= MIN_WIDTH_COLUMN * serialNumDifference ? residueUnitLen : MIN_WIDTH_COLUMN * serialNumDifference
        //在向右移动的时候，widget本身就会右移动，当到达最小值的时候才需要进行调整transform
        if (residueUnitLen <= MIN_WIDTH_COLUMN * serialNumDifference) {
          x = Math.abs(residueUnitLen - MIN_WIDTH_COLUMN * serialNumDifference) * snapColumnSpace
        }
        resultData[widgetId] = {
          ...reflowData.current[widgetId],
          X: reflowDataItem.X - x,
          width: widthNum * snapColumnSpace
        }
      }
    }

    return resultData
  }, [])


  /** 确定碰撞方向数据*/
  const setCollisionDirectionData = useCallback((sortCanvasWidgets: any, currentDraggingPosition: any, direction: ReSizeDirection) => {

    let widgetCollisionInfoCondition: Record<ReSizeDirection, {
      /** 开始边界*/
      startBoundary: number,
      /** 结束边界*/
      endBoundary: number,
      /** 正方向*/
      positiveDirection: string,
      /** 反方向*/
      oppositeDirection: string,
    }> = {
      [ReSizeDirection.TOP]: {
        startBoundary: lastMousePosition.current.y / snapRowSpace,
        endBoundary: currentDraggingPosition.topRow,
        positiveDirection: 'topRow',
        oppositeDirection: 'bottomRow',
      },
      [ReSizeDirection.BOTTOM]: {
        startBoundary: lastMousePosition.current.y / snapRowSpace + rows.current,
        endBoundary: currentDraggingPosition.bottomRow,
        positiveDirection: 'bottomRow',
        oppositeDirection: 'topRow'
      },
      [ReSizeDirection.LEFT]: {
        startBoundary: lastMousePosition.current.x / snapColumnSpace,
        endBoundary: currentDraggingPosition.leftColumn,
        positiveDirection: 'leftColumn',
        oppositeDirection: 'rightColumn'
      },
      [ReSizeDirection.RIGHT]: {
        startBoundary: lastMousePosition.current.x / snapColumnSpace + columns.current,
        endBoundary: currentDraggingPosition.rightColumn,
        positiveDirection: 'rightColumn',
        oppositeDirection: 'leftColumn'
      },
    }

    let { startBoundary, endBoundary, positiveDirection, oppositeDirection } = widgetCollisionInfoCondition[direction];

    /** 范围边界*/
    const scopeCondition: Record<ReSizeDirection, (widget: any) => boolean> = {
      [ReSizeDirection.TOP]: (widget: any) => {
        return !(widget.leftColumn >= currentDraggingPosition.rightColumn || widget.rightColumn <= currentDraggingPosition.leftColumn)
      },
      [ReSizeDirection.BOTTOM]: (widget: any) => {
        return !(widget.leftColumn >= currentDraggingPosition.rightColumn || widget.rightColumn <= currentDraggingPosition.leftColumn)
      },
      [ReSizeDirection.LEFT]: (widget: any) => {
        return !(widget.topRow >= currentDraggingPosition.bottomRow || widget.bottomRow <= currentDraggingPosition.topRow)
      },
      [ReSizeDirection.RIGHT]: (widget: any) => {
        return !(widget.topRow >= currentDraggingPosition.bottomRow || widget.bottomRow <= currentDraggingPosition.topRow)
      },
    }

    /** 是否受到碰撞*/
    const collisionBoundaryCondition: Record<ReSizeDirection, (widget: any) => boolean> = {
      [ReSizeDirection.TOP]: (widget: any) => {
        return (startBoundary > endBoundary
          && widget[oppositeDirection] <= startBoundary
          && widget[oppositeDirection] >= endBoundary
        )
      },
      [ReSizeDirection.BOTTOM]: (widget: any) => {
        return (startBoundary < endBoundary
          && widget[oppositeDirection] >= startBoundary
          && widget[oppositeDirection] <= endBoundary
        )
      },
      [ReSizeDirection.LEFT]: (widget: any) => {
        return (startBoundary > endBoundary
          && widget[oppositeDirection] <= startBoundary
          && widget[oppositeDirection] >= endBoundary
        )
      },
      [ReSizeDirection.RIGHT]: (widget: any) => {
        return (startBoundary < endBoundary
          && widget[oppositeDirection] >= startBoundary
          && widget[oppositeDirection] <= endBoundary
        )
      }
    }


    sortCanvasWidgets.forEach((item: any,) => {
      if (
        scopeCondition[direction](item) && collisionBoundaryCondition[direction](item)
      ) {
        widgetsResizeInfo.current.set(item.widgetId, {
          direction,
          leftColumn: item.leftColumn,
          rightColumn: item.rightColumn,
          topRow: item.topRow,
          bottomRow: item.bottomRow,
          moveCriticalValue: item[oppositeDirection],
        })
      }
    })

  }, [])


  /**
  * @description 将reflow数据转化为位置信息
  * @param reflowData reflow数据
  * @returns 
  */
  const getUpdateWidgets = useCallback((reflowData: ReflowData) => {
    let resultData: {
      [propName: string]: WidgetRowCols
    } = {};
    let item;
    let topRow;
    let bottomRow;
    let leftColumn;
    let rightColumn;

    for (let key in reflowData) {
      let height = reflowData[key].height;
      let width = reflowData[key].width;

      item = canvasWidgetsCopy.current[key];

      topRow = item.topRow + reflowData[key].Y / snapRowSpace;
      bottomRow = height ? (item.topRow + reflowData[key].Y / snapRowSpace) + height / snapRowSpace : item.bottomRow + reflowData[key].Y / snapRowSpace;
      leftColumn = item.leftColumn + reflowData[key].X / snapColumnSpace;
      rightColumn = width ? (item.leftColumn + reflowData[key].X / snapColumnSpace) + width / snapColumnSpace : item.rightColumn + reflowData[key].X / snapColumnSpace;

      //更新画布儿子的ColumnSpace
      if (item.type === 'CONTAINER_WIDGET') {
        let childrenList = canvasWidgetsCopy.current[item.widgetId].children
        let resultParentColumnSpace = canvasWidgetsCopy.current[item.widgetId].parentColumnSpace
        resultParentColumnSpace = (rightColumn - leftColumn - 1) * resultParentColumnSpace / COLUM_NUM

        for (let childId of childrenList) {
          resultData = {
            ...resultData,
            [childId]: {
              ...resultData[childId],
              parentColumnSpace: resultParentColumnSpace
            }
          }
        }
      }

      resultData[key] = {
        topRow,
        bottomRow,
        leftColumn,
        rightColumn,
      }
    }

    return resultData
  }, [])


  /**
  * @description 检查是否可以放置,不需要遍历所有的widget，而是直接判断边界，快死了
  * @param 
  * @returns {boolean} 返回是否可以放置
  */
  const checkIsCanPlaced = useCallback((draggingPosition: any) => {
    let isTrue = true;
    for (let key in draggingPosition) {
      if (key === 'topRow'
        && (draggingPosition[key] < 0
          || draggingPosition[key] < directionWidgetNum.current[ReSizeDirection.TOP] * MIN_HEIGHT_ROW
        )
      ) {
        isTrue = false
      }

      if (key === 'bottomRow'
        && (draggingPosition[key] > parentBlackInfo.bottomRow
          || draggingPosition[key] > parentBlackInfo.bottomRow - directionWidgetNum.current[ReSizeDirection.BOTTOM] * MIN_HEIGHT_ROW
        )
      ) {
        isTrue = false
      }
      if (key === 'leftColumn'
        && (draggingPosition[key] < 0
          || draggingPosition[key] < directionWidgetNum.current[ReSizeDirection.LEFT] * MIN_WIDTH_COLUMN
        )
      ) {
        isTrue = false
      }

      if (key === 'rightColumn'
        && (draggingPosition[key] > parentBlackInfo.rightColumn
          || draggingPosition[key] > parentBlackInfo.rightColumn - directionWidgetNum.current[ReSizeDirection.RIGHT] * MIN_WIDTH_COLUMN
        )
      ) {
        isTrue = false
      }
    }

    isCanPlaced.current = isTrue
    return isTrue
  }, [])

  /** 设置一个方向上的reflow数据，包括碰撞和挤压*/
  const setDirectionWidgetsReflowData = useCallback((
    currentDraggingPosition: any,
    direction: ReSizeDirection,
  ) => {
    const condition: Record<ReSizeDirection, {
      /** 开始边界*/
      startBoundary: string,
      /** 结束边界*/
      endBoundary: string,
      moveUnitLength: (widget: any) => number
      firstWidgetTransform: (transformDistance: number) => { X: number, Y: number }
      isExtrusion: (widget: any) => boolean
    }> = {
      [ReSizeDirection.TOP]: {
        startBoundary: 'leftColumn',
        endBoundary: 'rightColumn',
        moveUnitLength: (widget: any) => {
          return -Math.abs(widget.moveCriticalValue - currentDraggingPosition.topRow)
        },
        firstWidgetTransform: (transformDistance: number) => {
          return {
            X: 0,
            Y: transformDistance * snapRowSpace,
          }
        },
        isExtrusion: (widgetId: any) => {
          return widgetsDistanceInfo.current[widgetId].maxDistance > currentDraggingPosition.topRow
        }
      },
      [ReSizeDirection.BOTTOM]: {
        startBoundary: 'leftColumn',
        endBoundary: 'rightColumn',
        moveUnitLength: (widget: any) => {
          return Math.abs(widget.moveCriticalValue - currentDraggingPosition.bottomRow)
        },
        firstWidgetTransform: (transformDistance: number) => {
          return {
            X: 0,
            Y: transformDistance * snapRowSpace,
          }
        },
        isExtrusion: (widgetId: any) => {
          return widgetsDistanceInfo.current[widgetId].maxDistance > parentBlackInfo.bottomRow - currentDraggingPosition.bottomRow
        }
      },
      [ReSizeDirection.LEFT]: {
        startBoundary: 'topRow',
        endBoundary: 'bottomRow',
        moveUnitLength: (widget: any) => {
          return -Math.abs(widget.moveCriticalValue - currentDraggingPosition.leftColumn)
        },
        firstWidgetTransform: (transformDistance: number) => {
          return {
            X: transformDistance * snapColumnSpace,
            Y: 0,
          }
        },
        isExtrusion: (widgetId: any) => {
          return widgetsDistanceInfo.current[widgetId].maxDistance > currentDraggingPosition.leftColumn
        }
      },
      [ReSizeDirection.RIGHT]: {
        startBoundary: 'topRow',
        endBoundary: 'bottomRow',
        moveUnitLength: (widget: any) => {
          return Math.abs(widget.moveCriticalValue - currentDraggingPosition.rightColumn)
        },
        firstWidgetTransform: (transformDistance: number) => {
          return {
            X: transformDistance * snapColumnSpace,
            Y: 0,
          }
        },
        isExtrusion: (widgetId: any) => {
          return widgetsDistanceInfo.current[widgetId].maxDistance > parentBlackInfo.rightColumn - currentDraggingPosition.rightColumn
        }
      },
    }

    //设置碰撞
    const { startBoundary, endBoundary, moveUnitLength, firstWidgetTransform, isExtrusion } = condition[direction]

    let contactArrId: string[] = []
    let collisionReflowData = {};
    let isArriveBoundary = false
    let extrusionReflowData: any = {};
    let temporaryExtrusionReflowData: any = {};
    let temporaryMoveReflowData: any = {};
    let sign = new Array(10000).fill(0);
    let unitLength;
    let firstTransform;
    widgetsResizeInfo.current.forEach((value: any, key) => {
      if (getContactState(sign, value[startBoundary] + 1, value[endBoundary] - 1)
        && value.direction === direction
        //直接接触移动，而不是间接接触移动
        && !reflowData.current[key]
      ) {
        contactArrId.push(key);
        sign.fill(1, value[startBoundary] + 1, value[endBoundary] - 1);
        unitLength = moveUnitLength(value);
        firstTransform = firstWidgetTransform(unitLength);
        temporaryMoveReflowData = getCollisionReflowData(key,
          unitLength,
          value.direction,
          widgetsSpaceGraphCopy.current,
          snapRowSpace,
          snapColumnSpace,
          collisionReflowData,
          firstTransform,
        )
        reflowData.current = {
          ...reflowData.current,
          ...temporaryMoveReflowData
        }
      }
    })


    //设置挤压
    let maxInfo = getMaxLengthAndNumber(direction)
    directionWidgetNum.current[direction] = maxInfo.maxNumber

    contactArrId.forEach((widgetId) => {
      isArriveBoundary = false
      if (isExtrusion(widgetId)) {
        isArriveBoundary = true
      }
      if (isArriveBoundary) {

        temporaryExtrusionReflowData = getExtrusionReflowData(widgetId, direction, maxInfo.maxNumber)

        for (let key in temporaryExtrusionReflowData) {
          if (extrusionReflowData[key]) {
            if (extrusionReflowData[key].height && temporaryExtrusionReflowData[key].height) {
              //会有几个widget同时挤压一个widget的情况，取最小值
              extrusionReflowData[key] = {
                ...extrusionReflowData[key],
                height: Math.min(extrusionReflowData[key].height, temporaryExtrusionReflowData[key].height)
              }
            }
            if (extrusionReflowData[key].width && temporaryExtrusionReflowData[key].width) {
              extrusionReflowData[key] = {
                ...extrusionReflowData[key],
                width: Math.min(extrusionReflowData[key].width, temporaryExtrusionReflowData[key].width)
              }
            }
          } else {
            extrusionReflowData[key] = temporaryExtrusionReflowData[key]
          }
        }
      }
    })

    reflowData.current = { ...reflowData.current, ...extrusionReflowData };

  }, [])


  const onDragging = useCallback(() => {
    /** 排序的列表*/
    let sortCanvasWidgetList = canvasWidgetsChildrenDetailCopy.current
    let direction: any = getDirection(mousePosition.current.x, mousePosition.current.y)
    let draggingPosition = getCurrentDraggingPosition(mousePosition.current.x, mousePosition.current.y)
    newWidgetPosition.current = draggingPosition;
    filtrationBoundaryData(draggingPosition)

    if (direction != ReflowDirection.UNSET) {
      reflowData.current = {};
      widgetsDistanceInfo.current = {};
      /** 上方向*/
      if (direction === ReflowDirection.TOP || direction === ReflowDirection.TOPLEFT || direction === ReflowDirection.TOPRIGHT) {
        sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetailCopy.current, ['bottomRow']).reverse();
        setCollisionDirectionData(sortCanvasWidgetList, draggingPosition, ReSizeDirection.TOP)
      }
      /** 下边框*/
      if (direction === ReflowDirection.BOTTOM || direction === ReflowDirection.BOTTOMLEFT || direction === ReflowDirection.BOTTOMRIGHT) {
        sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetailCopy.current, ['topRow'])
        setCollisionDirectionData(sortCanvasWidgetList, draggingPosition, ReSizeDirection.BOTTOM)
      }
      /** 左边框*/
      if (direction === ReflowDirection.LEFT || direction === ReflowDirection.TOPLEFT || direction === ReflowDirection.BOTTOMLEFT) {
        sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetailCopy.current, ['rightColumn']).reverse();
        setCollisionDirectionData(sortCanvasWidgetList, draggingPosition, ReSizeDirection.LEFT)
      }

      /** 右边框*/
      if (direction === ReflowDirection.RIGHT || direction === ReflowDirection.TOPRIGHT || direction === ReflowDirection.BOTTOMRIGHT) {
        sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetailCopy.current, ['leftColumn'])
        setCollisionDirectionData(sortCanvasWidgetList, draggingPosition, ReSizeDirection.RIGHT)
      }

      setDirectionWidgetsReflowData(draggingPosition, ReSizeDirection.RIGHT)
      setDirectionWidgetsReflowData(draggingPosition, ReSizeDirection.TOP)
      setDirectionWidgetsReflowData(draggingPosition, ReSizeDirection.BOTTOM)
      setDirectionWidgetsReflowData(draggingPosition, ReSizeDirection.LEFT)
      /** 检验是否可以放置*/
      checkIsCanPlaced(draggingPosition)
    }


    lastMousePosition.current = mousePosition.current
    draggingAnimation.current = requestAnimationFrame(onDragging)
    dispatch(setReflowingWidgets({ ...reflowData.current }))
  }, [])

  const onDragEnd = useCallback(() => {
    mousePosition.current = { x: 0, y: 0 }
    //可以放置新增widget
    if (isCanPlaced.current) {
      dispatch(updateWidgets({ widgetsRowCol: getUpdateWidgets(reflowData.current) }))

      dispatch(addNewWidgetChunk(newWidgetPosition.current, {
        rowSpace: snapRowSpace,
        columnSpace: snapColumnSpace
      }))

    } else {
      console.warn('请放置正确位置');
    }
    dispatch(stopReflow())
  }, [])

  const setLastMousePosition = useCallback((x: number, y: number) => {
    mousePosition.current = { x, y }
  }, [])


  /** 大小变化方向*/
  const dragDirection = useMemo((): Record<ReSizeDirection, string> => {
    return {
      [ReSizeDirection.TOP]: 'top',
      [ReSizeDirection.BOTTOM]: 'bottom',
      [ReSizeDirection.LEFT]: 'left',
      [ReSizeDirection.RIGHT]: 'right',
    }
  }, [])


  useEffect(() => {
    if (isDragging) {
      isHasDragging.current = true
      onDragStart()
      onDragging()
    } else {
      if (isHasDragging.current) {
        onDragEnd()
        cancelAnimationFrame(draggingAnimation.current);
        isHasDragging.current = false
      }
    }
  }, [isDragging])

  return {
    isCanPlaced,
    setLastMousePosition
  }
}