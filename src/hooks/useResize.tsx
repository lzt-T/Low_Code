import { isResizingSelector, selectWidget, setWidgetResizing } from "@/store/slices/dragResize"
import { useCallback, useContext, useEffect, useMemo, useState, useRef } from "react"
import { useDispatch } from "react-redux"
import { useAppSelector } from "./redux"
import { ReSizeDirection, ReflowDirection } from "@/enum/move";
import { getReflowByIdSelector, setReflowingWidgets, widgetsSpaceGraphSelector } from "@/store/slices/widgetReflowSlice";
import { MIN_HEIGHT_ROW, MIN_WIDTH_COLUMN, WIDGET_PADDING } from "@/constant/widget";
import _ from 'lodash'
import { getWidgetChildrenDetailSelector, getWidgetChildrenSelector, getWidgetsSelector } from "@/store/slices/canvasWidgets";
import { WidgetRowCols } from "@/interface/widget";

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

type WidgetReSizeInfo = {
  direction: ReflowDirection,
  leftColumn: number
  rightColumn: number,
  topRow: number,
  bottomRow: number,
  minY: number,
  minX: number,
}

type ReflowData = {
  [propName: string]: {
    X: number,
    Y: number,
  }
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
  /** 是否正在变化大小*/
  const isResizing = useAppSelector(isResizingSelector)
  /** 在reflow中的样式*/
  const reflowedPosition: any = useAppSelector(getReflowByIdSelector(widgetId), equal);
  const canvasWidgetsIds = useAppSelector(getWidgetChildrenSelector(parentId));
  const canvasWidgets = useAppSelector(getWidgetsSelector);
  const canvasWidgetsChildrenDetail = useAppSelector(getWidgetChildrenDetailSelector(parentId));
  const widgetsSpaceGraph = useAppSelector(widgetsSpaceGraphSelector);
  const widgetsResizeInfo = useRef<Map<string, WidgetReSizeInfo>>(new Map());
  const reflowData = useRef<ReflowData>({})

  /** 上一次移动的数据*/
  const lastMoveDistance = useRef<{
    x: number,
    y: number,
  }>({
    x: 0,
    y: 0,
  })

  /** 父亲边框位置*/
  const parentBlackInfo: WidgetRowCols = useMemo(() => {
    let parent = canvasWidgets[parentId];
    return {
      topRow: parent?.topRow * parent?.parentRowSpace / parentRowSpace,
      bottomRow: parent?.bottomRow * parent?.parentRowSpace / parentRowSpace,
      leftColumn: parent?.leftColumn * parent?.parentColumnSpace / parentColumnSpace,
      rightColumn: parent?.rightColumn * parent?.parentColumnSpace / parentColumnSpace,
    }
  }, [canvasWidgets, parentId, parentRowSpace, parentColumnSpace])

  const dragDirection = useMemo((): Record<ReSizeDirection, string> => {
    return {
      [ReSizeDirection.TOP]: 'top',
      [ReSizeDirection.BOTTOM]: 'bottom',
      [ReSizeDirection.LEFT]: 'left',
      [ReSizeDirection.RIGHT]: 'right',
    }
  }, [])

  /** 设置最后一次鼠标移动的距离*/
  const setLastMoveDistance = useCallback((x: number, y: number, direction: ReflowDirection) => {
    let _y = 0;
    let _x = 0;
    if (direction === ReflowDirection.TOP
      || direction === ReflowDirection.TOPLEFT
      || direction === ReflowDirection.TOPRIGHT
      || direction === ReflowDirection.BOTTOM
      || direction === ReflowDirection.BOTTOMLEFT
      || direction === ReflowDirection.BOTTOMRIGHT
    ) {
      _y = y;
    }
    if (direction === ReflowDirection.LEFT
      || direction === ReflowDirection.TOPLEFT
      || direction === ReflowDirection.BOTTOMLEFT
      || direction === ReflowDirection.RIGHT
      || direction === ReflowDirection.TOPRIGHT
      || direction === ReflowDirection.BOTTOMRIGHT
    ) {
      _x = x;
    }

    lastMoveDistance.current = {
      x: _x,
      y: _y,
    }
  }, [])


  /** 获取reflow的数据*/
  const getReflowData = useCallback((widgetId: string, moveRowOrColumn: number, direction: ReSizeDirection) => {
    let affectWidgetList = widgetsSpaceGraph[widgetId].relations[dragDirection[direction]];
    let temporaryReflowDataItem: { X: number, Y: number } = {} as any;
    let resultData: ReflowData = {}
    let item;
    let _Y;
    let _X;

    for (let i = 0; i < affectWidgetList.length; i++) {
      item = affectWidgetList[i];
      _Y = 0;
      _X = 0;
      temporaryReflowDataItem = reflowData.current[item.id];

      if (Math.abs(moveRowOrColumn) <= item.distance) {
        continue
      }

      /** 上边框*/
      if (direction === ReSizeDirection.TOP) {
        _Y = moveRowOrColumn > 0 ? 0 : (item.distance + moveRowOrColumn) * parentRowSpace;
        //可能多个widgets上面是同一个widget,那么widget就应该取位置最上面的那个
        if (temporaryReflowDataItem) {
          _Y = Math.min(_Y, temporaryReflowDataItem.Y);
        }

        resultData[item.id] = {
          X: _X,
          Y: _Y,
        };

        resultData = { ...resultData, ...getReflowData(item.id, moveRowOrColumn + item.distance, direction) }
      }

      /** 下边框*/
      if (direction === ReSizeDirection.BOTTOM) {
        _Y = moveRowOrColumn < 0 ? 0 : (moveRowOrColumn - item.distance) * parentRowSpace
        /** 取最大的那一个*/
        if (temporaryReflowDataItem) {
          _Y = Math.max(_Y, temporaryReflowDataItem.Y);
        }

        resultData[item.id] = {
          X: _X,
          Y: _Y,
        };

        resultData = { ...resultData, ...getReflowData(item.id, moveRowOrColumn - item.distance, direction) }
      }

      /** 左边框*/
      if (direction === ReSizeDirection.LEFT) {
        _X = moveRowOrColumn > 0 ? 0 : (item.distance + moveRowOrColumn) * parentColumnSpace;
        /** 取最小的那一个*/
        if (temporaryReflowDataItem) {
          _X = Math.min(_X, temporaryReflowDataItem.X);
        }

        resultData[item.id] = {
          X: _X,
          Y: _Y,
        };
        resultData = { ...resultData, ...getReflowData(item.id, moveRowOrColumn + item.distance, direction) }
      }

      /** 右边框*/
      if (direction === ReSizeDirection.RIGHT) {
        _X = moveRowOrColumn < 0 ? 0 : (moveRowOrColumn - item.distance) * parentColumnSpace;
        /** 取最大的那一个*/
        if (temporaryReflowDataItem) {
          _X = Math.max(_X, temporaryReflowDataItem.X);
        }
        resultData[item.id] = {
          X: _X,
          Y: _Y,
        };
        resultData = { ...resultData, ...getReflowData(item.id, moveRowOrColumn - item.distance, direction) }
      }

    }
    return resultData
  }, [widgetsSpaceGraph, parentColumnSpace, parentRowSpace])

  /** 开始resize*/
  const onResizeStart = useCallback(() => {
    lastMoveDistance.current = {
      x: 0,
      y: 0,
    }
    !isResizing && dispatch(setWidgetResizing({ isResizing: true }))
    selectWidget(widgetId)

    widgetsResizeInfo.current.clear()
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

    let minBoundaryY;
    let maxBoundaryY;
    let minBoundaryX;
    let maxBoundaryX;

    let _y = y;
    let _x = x;

    if (direction === ReflowDirection.TOP
      || direction === ReflowDirection.TOPLEFT
      || direction === ReflowDirection.TOPRIGHT
    ) {
      /** 最小边界y*/
      minBoundaryY = (parentBlackInfo.topRow - topRow) * parentRowSpace;
      /** 最大边界y*/
      maxBoundaryY = (bottomRow - topRow - MIN_HEIGHT_ROW) * parentRowSpace;

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
      minBoundaryY = -(bottomRow - topRow - MIN_HEIGHT_ROW) * parentRowSpace;
      /** 最大边界y*/
      maxBoundaryY = (parentBlackInfo.bottomRow - bottomRow) * parentRowSpace;

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
      minBoundaryX = (parentBlackInfo.leftColumn - leftColumn) * parentColumnSpace
      maxBoundaryX = (rightColumn - leftColumn - MIN_WIDTH_COLUMN) * parentColumnSpace

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

      minBoundaryX = -((rightColumn - leftColumn - MIN_WIDTH_COLUMN) * parentColumnSpace);
      maxBoundaryX = (parentBlackInfo.rightColumn - rightColumn) * parentColumnSpace

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
  const getDistanceSum = useCallback((widgetId: string, direction: ReSizeDirection): number => {
    let distanceSum = 0
    if (direction === ReSizeDirection.TOP || direction === ReSizeDirection.BOTTOM) {
      distanceSum = widgetsSpaceGraph[widgetId].position.bottom - widgetsSpaceGraph[widgetId].position.top;
    }
    if (direction === ReSizeDirection.LEFT || direction === ReSizeDirection.RIGHT) {
      distanceSum = widgetsSpaceGraph[widgetId].position.right - widgetsSpaceGraph[widgetId].position.left;
    }

    let affectWidgetList = widgetsSpaceGraph[widgetId].relations[dragDirection[direction]];

    let maxHeight = distanceSum || 0;
    for (let i = 0; i < affectWidgetList.length; i++) {
      let item = affectWidgetList[i];
      maxHeight = Math.max(maxHeight, distanceSum + getDistanceSum(item.id, direction))
    }
    return maxHeight
  }, [widgetsSpaceGraph])

  /** 获得接触状态*/
  const getContactState = useCallback((arr: number[], startInd: number, endInd: number): boolean => {
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


    let startRow = 0;
    let endRow = 0;


    /** 排序的列表*/
    let sortCanvasWidgetList = canvasWidgetsChildrenDetail
    let currentResizeInfo = getCurrentResizeWidgetInfo(x, y, direction);
    let sign = new Array(currentResizeInfo.rightColumn + 1).fill(0);

    /** 范围外去除*/
    for (let item of sortCanvasWidgetList) {
      if (item.widgetId === widgetId) {
        continue;
      }

      if (item.leftColumn >= currentResizeInfo.rightColumn || item.rightColumn <= currentResizeInfo.leftColumn) {
        if (widgetsResizeInfo.current.has(item.widgetId)
          && (widgetsResizeInfo.current.get(item.widgetId)?.direction === ReflowDirection.TOP ||
            widgetsResizeInfo.current.get(item.widgetId)?.direction === ReflowDirection.BOTTOM
          )) {
          widgetsResizeInfo.current.delete(item.widgetId)
        }
      }

      if (item.bottomRow <= currentResizeInfo.topRow || item.topRow >= currentResizeInfo.bottomRow) {
        if (widgetsResizeInfo.current.has(item.widgetId)
          && (widgetsResizeInfo.current.get(item.widgetId)?.direction === ReflowDirection.LEFT
            || widgetsResizeInfo.current.get(item.widgetId)?.direction === ReflowDirection.RIGHT
          )
        ) {
          widgetsResizeInfo.current.delete(item.widgetId)
        }
      }
    }

    /** 高度不够去除*/
    widgetsResizeInfo.current.forEach((value, key) => {
      if (value.direction === ReflowDirection.TOP && y > value.minY) {
        widgetsResizeInfo.current.delete(key);
      }

      if (value.direction === ReflowDirection.BOTTOM && y < value.minY) {
        widgetsResizeInfo.current.delete(key);
      }

      if (value.direction === ReflowDirection.LEFT && x > value.minX) {
        widgetsResizeInfo.current.delete(key);
      }

      if (value.direction === ReflowDirection.RIGHT && x < value.minX) {
        widgetsResizeInfo.current.delete(key);
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
        if (item.widgetId === widgetId) {
          continue;
        }
        startRow = Math.min(topRow + (lastMoveDistance.current.y) / parentRowSpace, bottomRow - MIN_HEIGHT_ROW);
        endRow = topRow + (y) / parentRowSpace;
        if (!(item.leftColumn >= currentResizeInfo.rightColumn || item.rightColumn <= currentResizeInfo.leftColumn)
          && startRow > endRow
          && item.bottomRow <= startRow
          && item.bottomRow >= endRow
        ) {

          widgetsResizeInfo.current.set(item.widgetId, {
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

      topWidgetHeightSum = 0;
      sign.fill(0);

      /** 获取widget高度和*/
      widgetsResizeInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.leftColumn + 1, value.rightColumn - 1) &&
          value.direction === ReflowDirection.TOP
        ) {
          sign.fill(1, value.leftColumn + 1, value.rightColumn - 1);
          topWidgetHeightSum = Math.max(topWidgetHeightSum, getDistanceSum(key, ReSizeDirection.TOP))
        }
      })


      sign.fill(0);
      widgetsResizeInfo.current.forEach((value, key) => {
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

            reflowData.current = { ...reflowData.current, ...getReflowData(key, (_y - value.minY) / parentRowSpace, ReSizeDirection.TOP) }
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
        if (item.widgetId === widgetId) {
          continue;
        }
        startRow = Math.max(bottomRow + (lastMoveDistance.current.y) / parentRowSpace, topRow + MIN_HEIGHT_ROW);
        endRow = bottomRow + (y) / parentRowSpace;
        if (!(item.leftColumn >= currentResizeInfo.rightColumn || item.rightColumn <= currentResizeInfo.leftColumn)
          && startRow < endRow
          && item.topRow >= startRow
          && item.topRow <= endRow
        ) {
          widgetsResizeInfo.current.set(item.widgetId, {
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

      sign.fill(0);
      bottomWidgetHeightSum = 0;
      /** 获取下方widget高度和*/
      widgetsResizeInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.leftColumn + 1, value.rightColumn - 1) &&
          value.direction === ReflowDirection.BOTTOM
        ) {
          sign.fill(1, value.leftColumn + 1, value.rightColumn - 1);
          bottomWidgetHeightSum = Math.max(bottomWidgetHeightSum, getDistanceSum(key, ReSizeDirection.BOTTOM))
        }
      })

      sign.fill(0);
      widgetsResizeInfo.current.forEach((value, key) => {
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
            reflowData.current = { ...reflowData.current, ...getReflowData(key, (_y - value.minY) / parentRowSpace, ReSizeDirection.BOTTOM) }
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
        if (item.widgetId === widgetId) {
          continue;
        }

        startRow = Math.min(leftColumn + (lastMoveDistance.current.x) / parentColumnSpace, rightColumn - MIN_WIDTH_COLUMN);
        endRow = leftColumn + (x) / parentColumnSpace;
        if (!(item.bottomRow <= currentResizeInfo.topRow || item.topRow >= currentResizeInfo.bottomRow)
          && startRow > endRow
          && item.rightColumn <= startRow
          && item.rightColumn >= endRow
        ) {
          widgetsResizeInfo.current.set(item.widgetId, {
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

      sign.fill(0);
      leftWidgetWidthSum = 0;
      /** 获取左边widget宽度和*/
      widgetsResizeInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.topRow + 1, value.bottomRow - 1) &&
          value.direction === ReflowDirection.LEFT
        ) {
          sign.fill(1, value.topRow + 1, value.bottomRow - 1);
          leftWidgetWidthSum = Math.max(leftWidgetWidthSum, getDistanceSum(key, ReSizeDirection.LEFT))
        }
      })

      sign.fill(0);
      widgetsResizeInfo.current.forEach((value, key) => {
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
            reflowData.current = { ...reflowData.current, ...getReflowData(key, (_x - value.minX) / parentColumnSpace, ReSizeDirection.LEFT) }
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
        if (item.widgetId === widgetId) {
          continue;
        }

        startRow = Math.max(rightColumn + (lastMoveDistance.current.x) / parentColumnSpace, leftColumn + MIN_WIDTH_COLUMN);
        endRow = rightColumn + x / parentColumnSpace;
        if (!(item.bottomRow <= currentResizeInfo.topRow || item.topRow >= currentResizeInfo.bottomRow)
          && startRow < endRow
          && (item.leftColumn >= startRow && item.leftColumn <= endRow)
        ) {
          widgetsResizeInfo.current.set(item.widgetId, {
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

      sign.fill(0);
      rightWidgetWidthSum = 0;
      widgetsResizeInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.topRow + 1, value.bottomRow - 1) &&
          value.direction === ReflowDirection.RIGHT
        ) {
          sign.fill(1, value.topRow + 1, value.bottomRow - 1);
          rightWidgetWidthSum = Math.max(rightWidgetWidthSum, getDistanceSum(key, ReSizeDirection.RIGHT))
        }
      })

      sign.fill(0);
      widgetsResizeInfo.current.forEach((value, key) => {
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
            reflowData.current = { ...reflowData.current, ...getReflowData(key, (_x - value.minX) / parentColumnSpace, ReSizeDirection.RIGHT) }
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
    setLastMoveDistance(x, y, direction)
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
    getDistanceSum,
    setLastMoveDistance
  ])


  /** 停止resize*/
  const onResizeStop = useCallback(() => {
    dispatch(setWidgetResizing({ isResizing: false }))

    /** 触发action*/


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
