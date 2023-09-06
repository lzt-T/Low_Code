import { isResizingSelector, selectWidget, setWidgetResizing } from "@/store/slices/dragResize"
import { useCallback, useContext, useEffect, useMemo, useState, useRef } from "react"
import { useDispatch } from "react-redux"
import { useAppSelector } from "./redux"
import { ReflowDirection } from "@/enum/move";
import { getReflowByIdSelector, setReflowingWidgets, widgetsSpaceGraphSelector } from "@/store/slices/widgetReflowSlice";
import { MIN_HEIGHT_ROW, MIN_WIDTH_COLUMN, WIDGET_PADDING } from "@/constant/widget";
import _ from 'lodash'
import { getWidgetChildrenDetailSelector, getWidgetChildrenSelector, getWidgetsSelector } from "@/store/slices/canvasWidgets";

interface UseResizeProps {
  parentId?: string;
  widgetId: string;
  componentWidth: number;
  componentHeight: number;
  leftColumn: number;
  rightColumn: number;
  topRow: number;
  bottomRow: number;
  parentColumnSpace: number;
  parentRowSpace: number
  [propsName: string]: any
}

const equal = (
  reflowA: any,
  reflowB: any,
) => {
  return !(reflowA?.width !== reflowB?.width ||
    reflowA?.height !== reflowB?.height)
}

export interface DimensionProps {
  /** 宽度*/
  width: number;
  /** 高度*/
  height: number;
  /** x的移动距离*/
  x: number;
  /** Y的移动距离*/
  y: number;
  reset?: boolean;
  direction: ReflowDirection;
  [propName: string]: any
}

export const DragDirection: Record<ReflowDirection, string> = {
  [ReflowDirection.TOP]: 'top',
  [ReflowDirection.BOTTOM]: 'bottom',
  [ReflowDirection.LEFT]: 'left',
  [ReflowDirection.RIGHT]: 'right',
  [ReflowDirection.TOPLEFT]: 'bottom',
  [ReflowDirection.TOPRIGHT]: 'bottom',
  [ReflowDirection.BOTTOMLEFT]: 'bottom',
  [ReflowDirection.BOTTOMRIGHT]: 'bottom',
  [ReflowDirection.UNSET]: 'UNSET',
}


type Su = {
  direction: ReflowDirection,
  leftColumn: number
  rightColumn: number,
  topRow: number,
  bottomRow: number,
  minY: number,
  minX: number,
}


/**
* @description resize操作
* @param 
* @returns
*/
export const useResize = (props: UseResizeProps) => {
  const { widgetId, componentWidth, componentHeight, parentId = "",
    leftColumn, rightColumn, topRow, bottomRow, parentColumnSpace,
    parentRowSpace
  } = props
  const [newDimensions, setNewDimensions] = useState<DimensionProps>({
    width: componentWidth, // 组件宽度
    height: componentHeight, // 组件高度
    x: 0, // 坐标点变化
    y: 0, // 坐标点变化
    reset: false,
    direction: ReflowDirection.UNSET
  })

  const dispatch = useDispatch()
  const isResizing = useAppSelector(isResizingSelector)
  /** 在reflow中的样式*/
  const reflowedPosition: any = useAppSelector(getReflowByIdSelector(widgetId), equal);
  const canvasWidgetsIds = useAppSelector(getWidgetChildrenSelector(parentId));
  const canvasWidgets = useAppSelector(getWidgetsSelector);
  const canvasWidgetsChildrenDetail = useAppSelector(getWidgetChildrenDetailSelector(parentId));
  const widgetsSpaceGraph = useAppSelector(widgetsSpaceGraphSelector);
  const widgetsMoveInfo = useRef<Map<string, Su>>(new Map());
  const reflowData = useRef<{
    [propName: string]: any
  }>({})

  /** 父亲的边框限制*/
  const parentBlackInfo = useMemo(() => {
    let parent = canvasWidgets[parentId];
    return {
      topRow: parent?.topRow * parent?.parentRowSpace / parentRowSpace,
      bottomRow: parent?.bottomRow * parent?.parentRowSpace / parentRowSpace,
      leftColumn: parent?.leftColumn * parent?.parentColumnSpace / parentColumnSpace,
      rightColumn: parent?.rightColumn * parent?.parentColumnSpace / parentColumnSpace,
    }
  }, [canvasWidgets, parentId, parentRowSpace, parentColumnSpace])

  /** 获取reflow的数据*/
  const getReflowData = useCallback((widgetId: string, moveRowOrColumn: number, direction: ReflowDirection) => {
    let affectList = widgetsSpaceGraph[widgetId].relations[DragDirection[direction]];
    let resultData: { [propName: string]: any } = {}

    for (let i = 0; i < affectList.length; i++) {
      let item = affectList[i];
      /** 上边框*/
      if (direction === ReflowDirection.TOP) {
        if (Math.abs(moveRowOrColumn) > item.distance) {

          /** 取最小的那一个*/
          let temporaryReflowDataItem = reflowData.current[item.id];
          let _Y = moveRowOrColumn > 0 ? 0 : (item.distance + moveRowOrColumn) * parentRowSpace;
          if (temporaryReflowDataItem) {
            _Y = Math.min(_Y, temporaryReflowDataItem.Y);
          }
          resultData[item.id] = {
            X: 0,
            Y: _Y,
          };
        }
        resultData = { ...resultData, ...getReflowData(item.id, (item.distance + moveRowOrColumn), direction) }
      }

      /** 下边框*/
      if (direction === ReflowDirection.BOTTOM) {
        if (Math.abs(moveRowOrColumn) > item.distance) {

          /** 取最大的那一个*/
          let temporaryReflowDataItem = reflowData.current[item.id];
          let _Y = moveRowOrColumn < 0 ? 0 : (moveRowOrColumn - item.distance) * parentRowSpace
          if (temporaryReflowDataItem) {
            _Y = Math.max(_Y, temporaryReflowDataItem.Y);
          }

          resultData[item.id] = {
            X: 0,
            Y: _Y,
          };
        }
        resultData = { ...resultData, ...getReflowData(item.id, moveRowOrColumn - item.distance, direction) }
      }

      /** 左边框*/
      if (direction === ReflowDirection.LEFT) {
        if (Math.abs(moveRowOrColumn) > item.distance) {

          /** 取最小的那一个*/
          let temporaryReflowDataItem = reflowData.current[item.id];
          let _X = moveRowOrColumn > 0 ? 0 : (item.distance + moveRowOrColumn) * parentColumnSpace;
          if (temporaryReflowDataItem) {
            _X = Math.min(_X, temporaryReflowDataItem.X);
          }

          resultData[item.id] = {
            X: _X,
            Y: 0
          };
        }
        resultData = { ...resultData, ...getReflowData(item.id, item.distance + moveRowOrColumn, direction) }
      }

      /** 右边框*/
      if (direction === ReflowDirection.RIGHT) {
        if (Math.abs(moveRowOrColumn) > item.distance) {

          /** 取最大的那一个*/
          let temporaryReflowDataItem = reflowData.current[item.id];
          let _X = moveRowOrColumn < 0 ? 0 : (moveRowOrColumn - item.distance) * parentColumnSpace;
          if (temporaryReflowDataItem) {
            _X = Math.max(_X, temporaryReflowDataItem.X);
          }

          resultData[item.id] = {
            X: _X,
            Y: 0
          };
        }
        resultData = { ...resultData, ...getReflowData(item.id, moveRowOrColumn - item.distance, direction) }
      }
    }
    return resultData
  }, [widgetsSpaceGraph, parentColumnSpace, parentRowSpace])

  /** 开始resize*/
  const onResizeStart = useCallback(() => {
    !isResizing && dispatch(setWidgetResizing({ isResizing: true }))
    selectWidget(widgetId)

    widgetsMoveInfo.current.clear()
  }, [isResizing, widgetId, canvasWidgetsIds])


  /** 根据父亲边界计算移动值*/
  const getCurrentResizeWidgetInfo = useCallback((x: number, y: number, direction: ReflowDirection) => {
    let _topRow = topRow
    let _bottomRow = bottomRow
    let _leftColumn = leftColumn
    let _rightColumn = rightColumn

    let height = componentHeight;
    let width = componentWidth;
    let transformX = 0;
    let transformY = 0;

    if (direction === ReflowDirection.TOP
      || direction === ReflowDirection.TOPLEFT
      || direction === ReflowDirection.TOPRIGHT
    ) {
      /** 最小边界y*/
      let minBoundaryY = (parentBlackInfo.topRow - topRow) * parentRowSpace;
      /** 最大边界y*/
      let maxBoundaryY = (bottomRow - topRow - MIN_HEIGHT_ROW) * parentRowSpace;
      let _y = y

      if (y > maxBoundaryY) {
        _y = maxBoundaryY
      }
      if (y < minBoundaryY) {
        _y = minBoundaryY
      }

      _topRow += (_y / parentRowSpace);

      transformY = _y;
      height = componentHeight - _y;
    }
    if (direction === ReflowDirection.BOTTOM
      || direction === ReflowDirection.BOTTOMLEFT
      || direction === ReflowDirection.BOTTOMRIGHT
    ) {
      /** 最小边界y*/
      let minBoundaryY = -(bottomRow - topRow - MIN_HEIGHT_ROW) * parentRowSpace;
      /** 最大边界y*/
      let maxBoundaryY = (parentBlackInfo.bottomRow - bottomRow) * parentRowSpace;

      let _y = y
      if (y > maxBoundaryY) {
        _y = maxBoundaryY
      }
      if (y < minBoundaryY) {
        _y = minBoundaryY
      }
      _bottomRow += (_y / parentRowSpace);

      height = componentHeight + _y;
    }

    if (direction === ReflowDirection.LEFT
      || direction === ReflowDirection.TOPLEFT
      || direction === ReflowDirection.BOTTOMLEFT
    ) {

      let _x = x;
      let minBoundaryX = (parentBlackInfo.leftColumn - leftColumn) * parentColumnSpace
      let maxBoundaryX = (rightColumn - leftColumn - MIN_WIDTH_COLUMN) * parentColumnSpace

      if (_x < minBoundaryX) {
        _x = minBoundaryX;
      }
      if (_x > maxBoundaryX) {
        _x = maxBoundaryX
      }
      _leftColumn += (_x / parentColumnSpace);

      width = componentWidth - _x;
      transformX = _x;
    }
    if (direction === ReflowDirection.RIGHT
      || direction === ReflowDirection.TOPRIGHT
      || direction === ReflowDirection.BOTTOMRIGHT
    ) {
      let _x = x
      let minBoundaryX = -((rightColumn - leftColumn - MIN_WIDTH_COLUMN) * parentColumnSpace);
      let maxBoundaryX = (parentBlackInfo.rightColumn - rightColumn) * parentColumnSpace

      if (_x < minBoundaryX) {
        _x = minBoundaryX;
      }
      if (_x > maxBoundaryX) {
        _x = maxBoundaryX
      }

      _rightColumn += (_x / parentColumnSpace);

      width = componentWidth + _x;
    }

    return {
      height,
      width,
      transformX,
      transformY,
      topRow: _topRow,
      bottomRow: _bottomRow,
      leftColumn: _leftColumn,
      rightColumn: _rightColumn,
    }
  }, [topRow, bottomRow, leftColumn, rightColumn,
    parentRowSpace, parentColumnSpace, componentHeight,
    componentWidth, parentBlackInfo]
  )

  /** 获取widget元素四周widgets的 高度和|宽度和*/
  const getDistanceSum = useCallback((widgetId: string, y: number, direction: ReflowDirection): number => {
    let distanceSum = 0
    if (direction === ReflowDirection.TOP || direction === ReflowDirection.BOTTOM) {
      distanceSum = widgetsSpaceGraph[widgetId].position.bottom - widgetsSpaceGraph[widgetId].position.top;
    }
    if (direction === ReflowDirection.LEFT || direction === ReflowDirection.RIGHT) {
      distanceSum = widgetsSpaceGraph[widgetId].position.right - widgetsSpaceGraph[widgetId].position.left;
    }

    let affectList = widgetsSpaceGraph[widgetId].relations[DragDirection[direction]];

    let maxHeight = distanceSum || 0;
    for (let i = 0; i < affectList.length; i++) {
      let item = affectList[i];
      maxHeight = Math.max(maxHeight, distanceSum + getDistanceSum(item.id, y, direction))
    }
    return maxHeight
  }, [])

  /** 获得接触状态*/
  const getContactState = useCallback((arr: any[], startInd: number, endInd: number): boolean => {
    let isTrue: boolean = true
    for (let i = startInd; i <= endInd; i++) {
      if (arr[i] === 1) {
        isTrue = false
      }
    }
    return isTrue
  }, [])

  // resize过程
  const onResizeDrag = useCallback((
    data: {
      x: number,
      y: number,
      direction: ReflowDirection
    }
  ) => {
    const { x, y, direction } = data
    reflowData.current = {};

    /** 上方widgets的高度和*/
    let topWidgetHeightSum = 0;
    let bottomWidgetHeightSum = 0;
    let leftWidgetWidthSum = 0;
    let rightWidgetWidthSum = 0;


    /** 排序的列表*/
    let sortCanvasWidgetList = canvasWidgetsChildrenDetail

    let currentResizeInfo = getCurrentResizeWidgetInfo(x, y, direction);

    let sign = new Array(currentResizeInfo.rightColumn + 1).fill(0);

    /** 范围外去除*/
    for (let item of sortCanvasWidgetList) {
      if (item.widgetId != widgetId) {
        if (item.leftColumn >= currentResizeInfo.rightColumn || item.rightColumn <= currentResizeInfo.leftColumn) {
          if (widgetsMoveInfo.current.has(item.widgetId)
            && (widgetsMoveInfo.current.get(item.widgetId)?.direction === ReflowDirection.TOP ||
              widgetsMoveInfo.current.get(item.widgetId)?.direction === ReflowDirection.BOTTOM
            )) {
            widgetsMoveInfo.current.delete(item.widgetId)
          }
        }
      }

      if (item.bottomRow <= currentResizeInfo.topRow || item.topRow >= currentResizeInfo.bottomRow) {
        if (widgetsMoveInfo.current.has(item.widgetId)
          && (widgetsMoveInfo.current.get(item.widgetId)?.direction === ReflowDirection.LEFT
            || widgetsMoveInfo.current.get(item.widgetId)?.direction === ReflowDirection.RIGHT
          )
        ) {
          widgetsMoveInfo.current.delete(item.widgetId)
        }
      }
    }

    /** 高度不够去除*/
    widgetsMoveInfo.current.forEach((value, key) => {
      if (value.direction === ReflowDirection.TOP && y > value.minY) {
        widgetsMoveInfo.current.delete(key);
      }

      if (value.direction === ReflowDirection.BOTTOM && y < value.minY) {
        widgetsMoveInfo.current.delete(key);
      }

      if (value.direction === ReflowDirection.LEFT && x > value.minX) {
        widgetsMoveInfo.current.delete(key);
      }

      if (value.direction === ReflowDirection.RIGHT && x < value.minX) {
        widgetsMoveInfo.current.delete(key);
      }
    })

    //上边框
    if (direction === ReflowDirection.TOP
      || direction === ReflowDirection.TOPLEFT
      || direction === ReflowDirection.TOPRIGHT
    ) {

      sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetail, ['bottomRow']).reverse();

      /** 确定方向*/
      for (let item of sortCanvasWidgetList) {
        if (item.widgetId != widgetId) {
          if (!(item.leftColumn >= currentResizeInfo.rightColumn || item.rightColumn <= currentResizeInfo.leftColumn)
            && currentResizeInfo.topRow <= item.bottomRow
            && currentResizeInfo.bottomRow > item.bottomRow
          ) {
            let temporaryItem = widgetsMoveInfo.current.get(item.widgetId)
            if (currentResizeInfo.topRow === item.bottomRow) {
              widgetsMoveInfo.current.set(item.widgetId, {
                direction: ReflowDirection.TOP,
                leftColumn: item.leftColumn,
                rightColumn: item.rightColumn,
                topRow: item.topRow,
                bottomRow: item.bottomRow,
                minY: y,
                minX: 0,
              })
            }

            /** 避免鼠标太快没有监听到*/
            if (currentResizeInfo.topRow < item.bottomRow
              && !temporaryItem) {
              widgetsMoveInfo.current.set(item.widgetId, {
                direction: ReflowDirection.TOP,
                leftColumn: item.leftColumn,
                rightColumn: item.rightColumn,
                topRow: item.topRow,
                bottomRow: item.bottomRow,
                minY: y + (item.bottomRow - currentResizeInfo.topRow) * parentRowSpace,
                minX: 0,
              })
            }
          }
        }
      }

      topWidgetHeightSum = 0;
      sign.fill(0);

      /** 获取widget高度和*/
      widgetsMoveInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.leftColumn + 1, value.rightColumn - 1) &&
          value.direction === ReflowDirection.TOP
        ) {
          sign.fill(1, value.leftColumn + 1, value.rightColumn - 1);
          topWidgetHeightSum = Math.max(topWidgetHeightSum, getDistanceSum(key, y, ReflowDirection.TOP))
        }
      })


      sign.fill(0);
      widgetsMoveInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.leftColumn + 1, value.rightColumn - 1) &&
          value.direction === ReflowDirection.TOP
          && !reflowData.current[key]
        ) {

          sign.fill(1, value.leftColumn + 1, value.rightColumn - 1);
          let _y = y;

          /** 边界*/
          if ((topRow + (y / parentRowSpace) - parentBlackInfo.topRow) - topWidgetHeightSum < 0) {
          
            _y = -(topRow - topWidgetHeightSum - parentBlackInfo.topRow) * parentRowSpace

            currentResizeInfo.transformY = _y;
            currentResizeInfo.height = componentHeight - _y
            currentResizeInfo.topRow = topRow + (_y / parentRowSpace);
          }

          if (_y < value.minY) {
            reflowData.current[key] = {
              X: 0,
              Y: _y - value.minY
            };
            reflowData.current = { ...reflowData.current, ...getReflowData(key, (_y - value.minY) / parentRowSpace, ReflowDirection.TOP) }
          }
        }
      })
    }

    //下边框
    if (
      direction === ReflowDirection.BOTTOM
      || direction === ReflowDirection.BOTTOMLEFT
      || direction === ReflowDirection.BOTTOMRIGHT
    ) {
      sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetail, ['topRow']);

      for (let item of sortCanvasWidgetList) {
        if (item.widgetId != widgetId) {
          if (!(item.leftColumn >= currentResizeInfo.rightColumn || item.rightColumn <= currentResizeInfo.leftColumn)
            && currentResizeInfo.bottomRow >= item.topRow
            && currentResizeInfo.topRow < item.topRow
          ) {
            let temporaryItem = widgetsMoveInfo.current.get(item.widgetId)
            if (currentResizeInfo.bottomRow === item.topRow) {
              widgetsMoveInfo.current.set(item.widgetId, {
                direction: ReflowDirection.BOTTOM,
                leftColumn: item.leftColumn,
                rightColumn: item.rightColumn,
                topRow: item.topRow,
                bottomRow: item.bottomRow,
                minY: y,
                minX: 0,
              })
            }

            if (currentResizeInfo.bottomRow > item.topRow
              && !temporaryItem) {
              widgetsMoveInfo.current.set(item.widgetId, {
                direction: ReflowDirection.BOTTOM,
                leftColumn: item.leftColumn,
                rightColumn: item.rightColumn,
                topRow: item.topRow,
                bottomRow: item.bottomRow,
                minY: y - (currentResizeInfo.bottomRow - item.topRow) * parentRowSpace,
                minX: 0,
              })
            }
          }
        }
      }

      sign.fill(0);
      bottomWidgetHeightSum = 0;
      /** 获取下方widget高度和*/
      widgetsMoveInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.leftColumn + 1, value.rightColumn - 1) &&
          value.direction === ReflowDirection.BOTTOM
        ) {
          sign.fill(1, value.leftColumn + 1, value.rightColumn - 1);
          bottomWidgetHeightSum = Math.max(bottomWidgetHeightSum, getDistanceSum(key, y, ReflowDirection.BOTTOM))
        }
      })

      sign.fill(0);
      widgetsMoveInfo.current.forEach((value, key) => {
        if (getContactState(sign, value.leftColumn + 1, value.rightColumn - 1)
          && value.direction === ReflowDirection.BOTTOM
          && !reflowData.current[key]
        ) {
          sign.fill(1, value.leftColumn + 1, value.rightColumn - 1);
          let _y = y;

          /** 边界*/
          if ((parentBlackInfo.bottomRow - (bottomRow + (y / parentRowSpace))) - bottomWidgetHeightSum < 0) {
            _y = (parentBlackInfo.bottomRow - bottomWidgetHeightSum - bottomRow) * parentRowSpace

            currentResizeInfo.height = componentHeight + _y
            currentResizeInfo.bottomRow = bottomRow + (_y / parentRowSpace);
          }

          if (_y > value.minY) {
            reflowData.current[key] = {
              X: 0,
              Y: _y - value.minY
            };
            reflowData.current = { ...reflowData.current, ...getReflowData(key, (_y - value.minY) / parentRowSpace, ReflowDirection.BOTTOM) }
          }
        }
      })

    }

    //左边框
    if (direction === ReflowDirection.LEFT
      || direction === ReflowDirection.TOPLEFT
      || direction === ReflowDirection.BOTTOMLEFT
    ) {

      sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetail, ['rightColumn']).reverse();

      /** 确定方向*/
      for (let item of sortCanvasWidgetList) {
        if (item.widgetId != widgetId) {
          if (!(item.bottomRow <= currentResizeInfo.topRow || item.topRow >= currentResizeInfo.bottomRow)
            && currentResizeInfo.leftColumn <= item.rightColumn
            && currentResizeInfo.rightColumn > item.rightColumn
          ) {
            let temporaryItem = widgetsMoveInfo.current.get(item.widgetId)

            if (currentResizeInfo.leftColumn === item.rightColumn) {
              widgetsMoveInfo.current.set(item.widgetId, {
                direction: ReflowDirection.LEFT,
                leftColumn: item.leftColumn,
                rightColumn: item.rightColumn,
                topRow: item.topRow,
                bottomRow: item.bottomRow,
                minY: 0,
                minX: x,
              })
            }

            if (currentResizeInfo.leftColumn < item.rightColumn && !temporaryItem) {
              widgetsMoveInfo.current.set(item.widgetId, {
                direction: ReflowDirection.LEFT,
                leftColumn: item.leftColumn,
                rightColumn: item.rightColumn,
                topRow: item.topRow,
                bottomRow: item.bottomRow,
                minY: 0,
                minX: x + (item.rightColumn - currentResizeInfo.leftColumn) * parentColumnSpace,
              })
            }
          }
        }
      }

      sign.fill(0);
      leftWidgetWidthSum = 0;
      /** 获取左边widget宽度和*/
      widgetsMoveInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.topRow + 1, value.bottomRow - 1) &&
          value.direction === ReflowDirection.LEFT
        ) {
          sign.fill(1, value.topRow + 1, value.bottomRow - 1);
          leftWidgetWidthSum = Math.max(leftWidgetWidthSum, getDistanceSum(key, y, ReflowDirection.LEFT))
        }
      })

      sign.fill(0);
      widgetsMoveInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.topRow + 1, value.bottomRow - 1)
          && value.direction === ReflowDirection.LEFT
          && !reflowData.current[key]
        ) {
          sign.fill(1, value.topRow + 1, value.bottomRow - 1);
          let _x = x;

          if ((leftColumn + (x / parentColumnSpace)) - parentBlackInfo.leftColumn - leftWidgetWidthSum < 0) {
            _x = -(leftColumn - leftWidgetWidthSum - parentBlackInfo.leftColumn) * parentColumnSpace;
            currentResizeInfo.leftColumn += (_x / parentColumnSpace);
            currentResizeInfo.width = componentWidth - _x;
            currentResizeInfo.transformX = _x;
          }

          if (_x < value.minX) {
            reflowData.current[key] = {
              X: _x - value.minX,
              Y: 0
            };
            reflowData.current = { ...reflowData.current, ...getReflowData(key, (_x - value.minX) / parentColumnSpace, ReflowDirection.LEFT) }
          }
        }
      })
    }

    if (direction === ReflowDirection.RIGHT
      || direction === ReflowDirection.TOPRIGHT
      || direction === ReflowDirection.BOTTOMRIGHT
    ) {
      //右边
      sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetail, ['leftColumn']);

      for (let item of sortCanvasWidgetList) {
        if (item.widgetId != widgetId) {
          if (!(item.bottomRow <= currentResizeInfo.topRow || item.topRow >= currentResizeInfo.bottomRow)
            && currentResizeInfo.rightColumn >= item.leftColumn
            && currentResizeInfo.leftColumn < item.leftColumn
          ) {

            let temporaryItem = widgetsMoveInfo.current.get(item.widgetId)

            if (currentResizeInfo.rightColumn === item.leftColumn) {
              widgetsMoveInfo.current.set(item.widgetId, {
                direction: ReflowDirection.RIGHT,
                leftColumn: item.leftColumn,
                rightColumn: item.rightColumn,
                topRow: item.topRow,
                bottomRow: item.bottomRow,
                minY: 0,
                minX: x,
              })
            }

            if (currentResizeInfo.rightColumn > item.leftColumn && !temporaryItem) {
              widgetsMoveInfo.current.set(item.widgetId, {
                direction: ReflowDirection.RIGHT,
                leftColumn: item.leftColumn,
                rightColumn: item.rightColumn,
                topRow: item.topRow,
                bottomRow: item.bottomRow,
                minY: 0,
                minX: x - (currentResizeInfo.rightColumn - item.leftColumn) * parentColumnSpace,
              })
            }
          }
        }
      }

      sign.fill(0);
      rightWidgetWidthSum = 0;
      widgetsMoveInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.topRow + 1, value.bottomRow - 1) &&
          value.direction === ReflowDirection.RIGHT
        ) {
          sign.fill(1, value.topRow + 1, value.bottomRow - 1);
          rightWidgetWidthSum = Math.max(rightWidgetWidthSum, getDistanceSum(key, y, ReflowDirection.RIGHT))
        }
      })

      sign.fill(0);
      widgetsMoveInfo.current.forEach((value, key) => {
        if (getContactState(sign, value.topRow + 1, value.bottomRow - 1)
          && value.direction === ReflowDirection.RIGHT
          && !reflowData.current[key]
        ) {
          sign.fill(1, value.topRow + 1, value.bottomRow - 1);
          let _x = x;

          if (parentBlackInfo.rightColumn - (rightColumn + (x / parentColumnSpace)) - rightWidgetWidthSum < 0) {
            _x = (parentBlackInfo.rightColumn - rightColumn - rightWidgetWidthSum) * parentColumnSpace;

            currentResizeInfo.rightColumn += (_x / parentColumnSpace);
            currentResizeInfo.width = componentWidth + _x;
          }

          if (_x > value.minX) {
            reflowData.current[key] = {
              X: _x - value.minX,
              Y: 0
            };
            reflowData.current = { ...reflowData.current, ...getReflowData(key, (_x - value.minX) / parentColumnSpace, ReflowDirection.RIGHT) }
          }
        }
      })
    }

    dispatch(setReflowingWidgets({ ...reflowData.current }))
    setNewDimensions({
      x: currentResizeInfo.transformX,
      y: currentResizeInfo.transformY,
      width: currentResizeInfo.width,
      height: currentResizeInfo.height,
      direction
    })
  }, [topRow,
    parentRowSpace,
    parentColumnSpace,
    canvasWidgetsIds,
    canvasWidgetsChildrenDetail,
    rightColumn,
    bottomRow,
    leftColumn,
    componentWidth,
    componentHeight,
    widgetsSpaceGraph,
    widgetId,
    getReflowData,
    getCurrentResizeWidgetInfo,
    parentBlackInfo,
    getDistanceSum
  ])


  /** 停止resize*/
  const onResizeStop = useCallback(() => {
    dispatch(setWidgetResizing({ isResizing: false }))
  }, [])

  /** 拖拽时widget宽度*/
  const widgetWidth = useMemo(() => {
    if (reflowedPosition?.width) {
      return reflowedPosition.width - 2 * WIDGET_PADDING
    }
    return newDimensions.width
  }, [reflowedPosition, newDimensions])

  /** 拖拽时widget高度*/
  const widgetHeight = useMemo(() => {
    if (reflowedPosition?.height) {
      return reflowedPosition.height - 2 * WIDGET_PADDING
    }
    return newDimensions.height
  }, [reflowedPosition, newDimensions])


  return {
    widgetDimension: newDimensions,
    widgetWidth,
    widgetHeight,
    onResizeStart,
    onResizeStop,
    onResizeDrag
  }
}
