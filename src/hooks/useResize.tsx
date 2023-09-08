import { isResizingSelector, selectWidget, setWidgetResizing } from "@/store/slices/dragResize"
import { useCallback, useContext, useEffect, useMemo, useState, useRef } from "react"
import { useDispatch } from "react-redux"
import { useAppSelector } from "./redux"
import { ReSizeDirection, ReflowDirection } from "@/enum/move";
import { getReflowByIdSelector, setReflowingWidgets, stopReflow, widgetsSpaceGraphSelector } from "@/store/slices/widgetReflowSlice";
import { MIN_HEIGHT_ROW, MIN_WIDTH_COLUMN, WIDGET_PADDING } from "@/constant/widget";
import _ from 'lodash'
import { getWidgetChildrenDetailSelector, getWidgetChildrenSelector, getWidgetsSelector, updateWidgetAccordingWidgetId, updateWidgets } from "@/store/slices/canvasWidgets";
import { WidgetRowCols } from "@/interface/widget";
import { MAIN_CONTAINER_WIDGET_ID } from "@/constant/canvas";

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
  direction: ReSizeDirection,
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

  const widgetsSpaceGraphCopy = useRef<any>();
  widgetsSpaceGraphCopy.current = widgetsSpaceGraph

  const widgetsResizeInfo = useRef<Map<string, WidgetReSizeInfo>>(new Map());
  const reflowData = useRef<ReflowData>({})
  const updateWidgetRowCol = useRef<any>();

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
      topRow: parent?.topRow,
      bottomRow: parentId === MAIN_CONTAINER_WIDGET_ID ? parent?.bottomRow / parentRowSpace : parent?.bottomRow,
      leftColumn: parent?.leftColumn,
      rightColumn: parentId === MAIN_CONTAINER_WIDGET_ID ? parent.snapColumns : parent?.rightColumn,
    }
  }, [canvasWidgets, parentId, parentRowSpace, parentColumnSpace])

  /** 大小变化方向*/
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

  /**
  * @description 获取某个widget一个方向上的reflow的数据
  * @param widgetId {string}
  * @param moveRowOrColumn 移动的row或者column带正负号 {string}
  * @param direction {ReSizeDirection}
  * @param reflowDataItem 当有值时会自动复制给key为widgetId的对象 {undefined | {X: number, Y: number}}
  * @returns {ReflowData}
  */
  const getReflowData = useCallback((widgetId: string,
    moveRowOrColumn: number,
    direction: ReSizeDirection,
    reflowDataItem?: undefined | {
      X: number,
      Y: number,
    }
  ) => {

    //防止使用上一次的widgetsSpaceGraph!!
    let affectWidgetList = widgetsSpaceGraphCopy.current[widgetId].relations[dragDirection[direction]];
    let temporaryReflowDataItem: { X: number, Y: number } = {} as any;
    let resultData: ReflowData = {}
    let item;
    let _Y;
    let _X;

    if (!!reflowDataItem) {
      resultData[widgetId] = {
        X: reflowDataItem.X,
        Y: reflowDataItem.Y
      };
    }

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
      }

      /** 下边框*/
      if (direction === ReSizeDirection.BOTTOM) {
        _Y = moveRowOrColumn < 0 ? 0 : (moveRowOrColumn - item.distance) * parentRowSpace
        /** 取最大的那一个*/
        if (temporaryReflowDataItem) {
          _Y = Math.max(_Y, temporaryReflowDataItem.Y);
        }
      }

      /** 左边框*/
      if (direction === ReSizeDirection.LEFT) {
        _X = moveRowOrColumn > 0 ? 0 : (item.distance + moveRowOrColumn) * parentColumnSpace;
        /** 取最小的那一个*/
        if (temporaryReflowDataItem) {
          _X = Math.min(_X, temporaryReflowDataItem.X);
        }
      }

      /** 右边框*/
      if (direction === ReSizeDirection.RIGHT) {
        _X = moveRowOrColumn < 0 ? 0 : (moveRowOrColumn - item.distance) * parentColumnSpace;
        /** 取最大的那一个*/
        if (temporaryReflowDataItem) {
          _X = Math.max(_X, temporaryReflowDataItem.X);
        }
      }

      resultData[item.id] = {
        X: _X,
        Y: _Y,
      };

      if (direction === ReSizeDirection.TOP
        || direction === ReSizeDirection.LEFT) {
        resultData = { ...resultData, ...getReflowData(item.id, moveRowOrColumn + item.distance, direction) }
      }

      if (direction === ReSizeDirection.BOTTOM
        || direction === ReSizeDirection.RIGHT) {
        resultData = { ...resultData, ...getReflowData(item.id, moveRowOrColumn - item.distance, direction) }
      }
    }
    return resultData
  }, [parentColumnSpace, parentColumnSpace])

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


  /**
  * @description 得到规定范围内的数值
  * @param num {number} 当前数值 
  * @param minNum {number} 最小数值
  * @param maxNum {number} 最大数值
  * @returns {number}
  */
  const getAppropriateNum = useCallback((num: number, minNum: number, maxNum: number) => {
    let resultNum = num;
    if (num > maxNum) {
      resultNum = maxNum
    }
    if (num < minNum) {
      resultNum = minNum
    }
    return resultNum
  }, [])

  /**
  * @description 获取当前resize的widget的信息，不包括与其他widget的关系
  * @param x {number} x的移动距离
  * @param y {number} y的移动距离
  */
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
      // 上边框向上最小可以移动的距离
      minBoundaryY = (parentBlackInfo.topRow - topRow) * parentRowSpace;
      // 上边框向下最大可以移动的距离
      maxBoundaryY = (bottomRow - topRow - MIN_HEIGHT_ROW) * parentRowSpace;
      _y = getAppropriateNum(_y, minBoundaryY, maxBoundaryY)

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
      _y = getAppropriateNum(_y, minBoundaryY, maxBoundaryY)

      _bottomRow += (_y / parentRowSpace);
      height = componentHeight + _y;
    }

    if (direction === ReflowDirection.LEFT
      || direction === ReflowDirection.TOPLEFT
      || direction === ReflowDirection.BOTTOMLEFT
    ) {
      minBoundaryX = (parentBlackInfo.leftColumn - leftColumn) * parentColumnSpace
      maxBoundaryX = (rightColumn - leftColumn - MIN_WIDTH_COLUMN) * parentColumnSpace
      _x = getAppropriateNum(_x, minBoundaryX, maxBoundaryX)

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
      _x = getAppropriateNum(_x, minBoundaryX, maxBoundaryX)

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
    componentWidth, parentBlackInfo, getAppropriateNum]
  )

  //获取当前widget某个方向上的widget长度和
  const getDistanceSum = useCallback((widgetId: string, direction: ReSizeDirection): number => {
    let distanceSum = 0;
    if (direction === ReSizeDirection.TOP || direction === ReSizeDirection.BOTTOM) {
      distanceSum = widgetsSpaceGraphCopy.current[widgetId].position.bottom - widgetsSpaceGraphCopy.current[widgetId].position.top;
    }
    if (direction === ReSizeDirection.LEFT || direction === ReSizeDirection.RIGHT) {
      distanceSum = widgetsSpaceGraphCopy.current[widgetId].position.right - widgetsSpaceGraphCopy.current[widgetId].position.left;
    }

    let affectWidgetList = widgetsSpaceGraphCopy.current[widgetId].relations[dragDirection[direction]];

    let maxDistance = distanceSum ;
    for (let i = 0; i < affectWidgetList.length; i++) {
      let item = affectWidgetList[i];
      maxDistance = Math.max(maxDistance, distanceSum + getDistanceSum(item.id, direction))
    }
    return maxDistance
  }, [])

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


  /** 得到widgets更新后的数据*/
  const getUpdateWidgets = useCallback((reflowData: ReflowData) => {
    let resultData: {
      [propName: string]: WidgetRowCols
    } = {};
    let item;
    let topRow;
    let bottomRow;
    let leftColumn;
    let rightColumn;
    Object.keys(reflowData).forEach((key) => {
      item = canvasWidgets[key];
      topRow = item.topRow + reflowData[key].Y / parentRowSpace;
      bottomRow = item.bottomRow + reflowData[key].Y / parentRowSpace;
      leftColumn = item.leftColumn + reflowData[key].X / parentColumnSpace;
      rightColumn = item.rightColumn + reflowData[key].X / parentColumnSpace;

      resultData[key] = {
        topRow,
        bottomRow,
        leftColumn,
        rightColumn,
      }
    })

    return resultData
  }, [canvasWidgets, parentRowSpace, parentColumnSpace])


  // 进行resize
  const onResizeDrag = useCallback((
    data: {
      x: number,
      y: number,
      direction: ReflowDirection
    }
  ) => {
    const { x, y, direction } = data
    reflowData.current = {};

    /** 上方widgets的长度和*/
    let topWidgetHeightSum = 0;
    /** 下方widgets的长度和*/
    let bottomWidgetHeightSum = 0;
    /** 左边widgets的长度和*/
    let leftWidgetWidthSum = 0;
    /** 右边widgets的长度和*/
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
          && (widgetsResizeInfo.current.get(item.widgetId)?.direction === ReSizeDirection.TOP ||
            widgetsResizeInfo.current.get(item.widgetId)?.direction === ReSizeDirection.BOTTOM
          )) {
          widgetsResizeInfo.current.delete(item.widgetId)
        }
      }

      if (item.bottomRow <= currentResizeInfo.topRow || item.topRow >= currentResizeInfo.bottomRow) {
        if (widgetsResizeInfo.current.has(item.widgetId)
          && (widgetsResizeInfo.current.get(item.widgetId)?.direction === ReSizeDirection.LEFT
            || widgetsResizeInfo.current.get(item.widgetId)?.direction === ReSizeDirection.RIGHT
          )
        ) {
          widgetsResizeInfo.current.delete(item.widgetId)
        }
      }
    }

    /** 高度不够去除*/
    widgetsResizeInfo.current.forEach((value, key) => {
      if (value.direction === ReSizeDirection.TOP && y > value.minY) {
        widgetsResizeInfo.current.delete(key);
      }

      if (value.direction === ReSizeDirection.BOTTOM && y < value.minY) {
        widgetsResizeInfo.current.delete(key);
      }

      if (value.direction === ReSizeDirection.LEFT && x > value.minX) {
        widgetsResizeInfo.current.delete(key);
      }

      if (value.direction === ReSizeDirection.RIGHT && x < value.minX) {
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
            direction: ReSizeDirection.TOP,
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
          value.direction === ReSizeDirection.TOP
        ) {
          sign.fill(1, value.leftColumn + 1, value.rightColumn - 1);
          topWidgetHeightSum = Math.max(topWidgetHeightSum, getDistanceSum(key, ReSizeDirection.TOP))
        }
      })


      sign.fill(0);
      widgetsResizeInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.leftColumn + 1, value.rightColumn - 1) &&
          value.direction === ReSizeDirection.TOP
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
            let orientationReflowData = getReflowData(key, (_y - value.minY) / parentRowSpace, ReSizeDirection.TOP, {
              X: 0,
              Y: _y - value.minY
            })
            reflowData.current = {
              ...reflowData.current,
              ...orientationReflowData
            }
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
            direction: ReSizeDirection.BOTTOM,
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
          value.direction === ReSizeDirection.BOTTOM
        ) {
          sign.fill(1, value.leftColumn + 1, value.rightColumn - 1);
          bottomWidgetHeightSum = Math.max(bottomWidgetHeightSum, getDistanceSum(key, ReSizeDirection.BOTTOM))
        }
      })

      sign.fill(0);
      widgetsResizeInfo.current.forEach((value, key) => {
        if (getContactState(sign, value.leftColumn + 1, value.rightColumn - 1)
          && value.direction === ReSizeDirection.BOTTOM
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
            let orientationReflowData = getReflowData(key, (_y - value.minY) / parentRowSpace, ReSizeDirection.BOTTOM, {
              X: 0,
              Y: _y - value.minY
            })
            reflowData.current = {
              ...reflowData.current,
              ...orientationReflowData
            }
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
            direction: ReSizeDirection.LEFT,
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
          value.direction === ReSizeDirection.LEFT
        ) {
          sign.fill(1, value.topRow + 1, value.bottomRow - 1);
          leftWidgetWidthSum = Math.max(leftWidgetWidthSum, getDistanceSum(key, ReSizeDirection.LEFT))
        }
      })

      sign.fill(0);
      widgetsResizeInfo.current.forEach((value, key) => {
        if (
          getContactState(sign, value.topRow + 1, value.bottomRow - 1)
          && value.direction === ReSizeDirection.LEFT
          && !reflowData.current[key]
        ) {
          sign.fill(1, value.topRow + 1, value.bottomRow - 1);
          let _x = x;

          if ((leftColumn + (x / parentColumnSpace)) - parentBlackInfo.leftColumn - leftWidgetWidthSum < 0) {
            _x = -(leftColumn - leftWidgetWidthSum - parentBlackInfo.leftColumn) * parentColumnSpace;
            currentResizeInfo.leftColumn = leftColumn + (_x / parentColumnSpace);
            currentResizeInfo.width = componentWidth - _x;
            currentResizeInfo.transformX = _x;
          }

          if (_x < value.minX) {

            let orientationReflowData = getReflowData(key, (_x - value.minX) / parentColumnSpace, ReSizeDirection.LEFT, {
              X: _x - value.minX,
              Y: 0
            })
            reflowData.current = {
              ...reflowData.current,
              ...orientationReflowData
            }
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
            direction: ReSizeDirection.RIGHT,
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
          value.direction === ReSizeDirection.RIGHT
        ) {
          sign.fill(1, value.topRow + 1, value.bottomRow - 1);
          rightWidgetWidthSum = Math.max(rightWidgetWidthSum, getDistanceSum(key, ReSizeDirection.RIGHT))
        }
      })

      sign.fill(0);
      widgetsResizeInfo.current.forEach((value, key) => {
        if (getContactState(sign, value.topRow + 1, value.bottomRow - 1)
          && value.direction === ReSizeDirection.RIGHT
          && !reflowData.current[key]
        ) {
          sign.fill(1, value.topRow + 1, value.bottomRow - 1);
          let _x = x;

          if (parentBlackInfo.rightColumn - (rightColumn + (x / parentColumnSpace)) - rightWidgetWidthSum < 0) {
            _x = (parentBlackInfo.rightColumn - rightColumn - rightWidgetWidthSum) * parentColumnSpace;

            currentResizeInfo.rightColumn = rightColumn + (_x / parentColumnSpace);
            currentResizeInfo.width = componentWidth + _x;
          }

          if (_x > value.minX) {

            let orientationReflowData = getReflowData(key, (_x - value.minX) / parentColumnSpace, ReSizeDirection.RIGHT, {
              X: _x - value.minX,
              Y: 0
            })
            reflowData.current = {
              ...reflowData.current,
              ...orientationReflowData
            }
          }
        }
      })
    }

    updateWidgetRowCol.current = {
      topRow: currentResizeInfo.topRow,
      bottomRow: currentResizeInfo.bottomRow,
      leftColumn: currentResizeInfo.leftColumn,
      rightColumn: currentResizeInfo.rightColumn
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

    setNewDimensions((prevState) => ({
      ...prevState,
      x: 0,
      y: 0,
      reset: true,
    }))

    /** 更新大小*/
    dispatch(updateWidgetAccordingWidgetId(
      {
        widgetId,
        widgetRowCol: updateWidgetRowCol.current
      }
    ))

    dispatch(stopReflow())
    /** 更新受到影响的widget位置*/
    dispatch(updateWidgets({ widgetsRowCol: getUpdateWidgets(reflowData.current) }))
  }, [widgetId, getUpdateWidgets])

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
