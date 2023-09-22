import { curFocusedWidgetIdSelector, isResizingSelector, selectWidget, setWidgetResizing } from "@/store/slices/dragResize"
import { useCallback, useContext, useEffect, useMemo, useState, useRef } from "react"
import { useDispatch } from "react-redux"
import { useAppSelector } from "./redux"
import { ReSizeDirection, ReflowDirection } from "@/enum/move";
import { getReflowByIdSelector, setReflowingWidgets, stopReflow, widgetsSpaceGraphSelector } from "@/store/slices/widgetReflowSlice";
import { MIN_HEIGHT_ROW, MIN_WIDTH_COLUMN, WIDGET_PADDING } from "@/constant/widget";
import _ from 'lodash'
import { getWidgetChildrenDetailSelector, getWidgetChildrenSelector, getWidgetsSelector, updateWidgetAccordingWidgetId, updateWidgets } from "@/store/slices/canvasWidgets";
import { WidgetRowCols, WidgetsRowCols } from "@/interface/widget";
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
  /** transformX的值*/
  x: number;
  /** transformY的值*/
  y: number;
  reset?: boolean;
  /** 方向*/
  direction: ReflowDirection;
}

type WidgetReSizeInfo = {
  direction: ReSizeDirection,
  leftColumn: number
  rightColumn: number,
  topRow: number,
  bottomRow: number,
  //开始碰撞临界状态值，鼠标x或y的值
  moveCriticalValue: number
}

type ReflowData = {
  [propName: string]: {
    X: number,
    Y: number,
    height?: number,
    width?: number,
  }
}

type WidgetsMaxInfo = {
  /** widget在一个方向上的序号*/
  serialNumber: number,
  /** 一个方向上的widgets最大长度和包括自己 */
  maxDistance: number,
  /** 最小可以到达的边界值，超过这个边界就是挤压*/
  minBoundary: number,
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
    x: 0, /** transformX的值*/
    y: 0, /** transformY的值*/
    reset: false,
    direction: ReflowDirection.UNSET
  })

  const dispatch = useDispatch()
  /** 是否正在调整*/
  const isResizing = useAppSelector(isResizingSelector)
  /** 当前聚焦的widgetId*/
  const curFocusedWidgetId = useAppSelector(curFocusedWidgetIdSelector)
  /** 在reflow中的样式*/
  const reflowedPosition: any = useAppSelector(getReflowByIdSelector(widgetId), equal);
  const canvasWidgetsIds = useAppSelector(getWidgetChildrenSelector(parentId));
  const canvasWidgets = useAppSelector(getWidgetsSelector);
  /** 画布中的widgets*/
  const canvasWidgetsChildrenDetail = useAppSelector(getWidgetChildrenDetailSelector(parentId));
  /** 位置关系图*/
  const widgetsSpaceGraph = useAppSelector(widgetsSpaceGraphSelector);
  /** 位置关系图*/
  const widgetsSpaceGraphCopy = useRef<any>();
  widgetsSpaceGraphCopy.current = widgetsSpaceGraph
  /** widget距离关系信息*/
  const widgetsDistanceInfo = useRef<{
    [propName: string]: WidgetsMaxInfo
  }>({});

  /** 没挤压时上方的最大长度和*/
  const topWidgetLengthSum = useRef(0);
  /** 没挤压时下方的最大长度和*/
  const bottomWidgetLengthSum = useRef(0);
  /** 没挤压时左边的最大长度和*/
  const leftWidgetLengthSum = useRef(0);
  /** 没挤压时右边的最大长度和*/
  const rightWidgetLengthSum = useRef(0);

  /** 当前上方widgets的最大长度和，当挤压时会改变，不然等于topWidgetLengthSum*/
  const currentTopLengthSum = useRef(0)
  /** 当前下方widgets的最大长度和，当挤压时会改变*/
  const currentBottomLengthSum = useRef(0)
  /** 当前左边widgets的最大长度和，当挤压时会改变*/
  const currentLeftLengthSum = useRef(0)
  /** 当前右边widgets的最大长度和，当挤压时会改变*/
  const currentRightLengthSum = useRef(0)

  /** 记录在大小变化过程中，widget的信息，如位置、移动方向、碰撞时鼠标临界值*/
  const widgetsResizeInfo = useRef<Map<string, WidgetReSizeInfo>>(new Map());
  /** reflow的数据*/
  const reflowData = useRef<ReflowData>({})
  /** 当前元素更新的位置信息*/
  const updateWidgetRowCol = useRef<WidgetRowCols>();

  /** 上一次移动的数据*/
  const lastMoveDistance = useRef<{
    x: number,
    y: number,
  }>({
    x: 0,
    y: 0,
  })


  /** 起始状态widgets的位置信息*/
  const originalPosition = useRef<WidgetsRowCols>({})
  /** 在调整过程中，widget的位置是不断变化的，所以要用currentPosition.current，记录widget当前的位置*/
  const currentPosition = useRef<WidgetsRowCols>({});
  /** 受到碰撞挤压影响需要更新的widget位置信息*/
  const updateWidgetsPosition = useRef<WidgetsRowCols>({})


  /** 父亲边框位置信息*/
  const parentBlackInfo: WidgetRowCols = useMemo(() => {
    let parent = canvasWidgets[parentId];

    return {
      topRow: 0,
      bottomRow: parentId === MAIN_CONTAINER_WIDGET_ID ? parent?.bottomRow / parentRowSpace : parent?.bottomRow - parent?.topRow,
      leftColumn: 0,
      rightColumn: parentId === MAIN_CONTAINER_WIDGET_ID ? parent.snapColumns : parent?.rightColumn - parent?.leftColumn,
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

  /**
  * @description 设置最后一次鼠标移动的距离
  * @param x x轴鼠标移动距离 {number}
  * @param y y轴鼠标移动距离 {number}
  * @param direction 移动方向 {ReflowDirection}
  * @returns
  */
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
  * @description 获取实际边界大小
  * @param originalStartBoundary  未计算时开始边界
  * @param originalEndBoundary  未计算时结束边界
  * @returns {Object} 返回包含边界信息对象 
  * @property {number} startBoundary  实际开始边界 
  * @property {number} endBoundary  实际结束边界 
  */
  const getActualBoundary = useCallback((originalStartBoundary: number, originalEndBoundary: number, direction: 'x' | 'y') => {
    let startBoundary = 0;
    let endBoundary = 0;

    if (direction === 'y') {
      if (originalStartBoundary <= parentBlackInfo.leftColumn + currentLeftLengthSum.current) {
        startBoundary = parentBlackInfo.leftColumn + currentLeftLengthSum.current;
      } else {
        startBoundary = originalStartBoundary;
      }

      if (originalEndBoundary >= parentBlackInfo.rightColumn - currentRightLengthSum.current) {
        endBoundary = parentBlackInfo.rightColumn - currentRightLengthSum.current
      } else {
        endBoundary = originalEndBoundary;
      }
    } else {
      if (originalStartBoundary <= parentBlackInfo.topRow + currentTopLengthSum.current) {
        startBoundary = parentBlackInfo.topRow + currentTopLengthSum.current;
      } else {
        startBoundary = originalStartBoundary
      }

      if (originalEndBoundary >= parentBlackInfo.bottomRow - currentBottomLengthSum.current) {
        endBoundary = parentBlackInfo.bottomRow - currentBottomLengthSum.current
      } else {
        endBoundary = originalEndBoundary
      }
    }

    return {
      startBoundary,
      endBoundary
    }

  }, [parentBlackInfo])

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
    let widgetItem = canvasWidgets[widgetId];
    let reflowDataItem = { ...reflowData.current[widgetId] };
    /** 剩余单位长度个数*/
    let residueUnitLen;
    /** 当前widget边框位置和挤压边界差值*/
    let residueExtrusionDifference;
    /** 当前widget所在边框位置*/
    let currentBorderPosition;
    if (direction === ReSizeDirection.TOP || direction === ReSizeDirection.BOTTOM) {
      currentBorderPosition = widgetItem[startDirection] + reflowDataItem.Y / parentRowSpace;
    }
    if (direction === ReSizeDirection.LEFT || direction === ReSizeDirection.RIGHT) {
      currentBorderPosition = widgetItem[startDirection] + reflowDataItem.X / parentColumnSpace;
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
          Y: reflowDataItem.Y + residueExtrusionDifference * parentRowSpace,
          height: heightNum * parentRowSpace
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
          y = Math.abs(residueUnitLen - MIN_HEIGHT_ROW * serialNumDifference) * parentRowSpace
        }

        resultData[widgetId] = {
          ...reflowData.current[widgetId],
          Y: reflowDataItem.Y - y,
          height: heightNum * parentRowSpace
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
          X: reflowDataItem.X + residueExtrusionDifference * parentColumnSpace,
          width: widthNum * parentColumnSpace
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
          x = Math.abs(residueUnitLen - MIN_WIDTH_COLUMN * serialNumDifference) * parentColumnSpace
        }
        resultData[widgetId] = {
          ...reflowData.current[widgetId],
          X: reflowDataItem.X - x,
          width: widthNum * parentColumnSpace
        }
      }
    }

    return resultData
  }, [canvasWidgets, parentRowSpace, parentColumnSpace, parentBlackInfo])

  /** 获得接触状态*/

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


  /** 开始resize*/
  const onResizeStart = useCallback(() => {
    lastMoveDistance.current = {
      x: 0,
      y: 0,
    }

    canvasWidgetsChildrenDetail.forEach((item) => {
      originalPosition.current[item.widgetId] = _.pick(item, ['topRow', 'bottomRow', 'leftColumn', 'rightColumn'])
    })
    currentPosition.current = originalPosition.current;

    !isResizing && dispatch(setWidgetResizing({ isResizing: true }))
    selectWidget(widgetId)

    widgetsResizeInfo.current.clear()
  }, [isResizing, widgetId, canvasWidgetsIds, canvasWidgetsChildrenDetail])

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
      item = canvasWidgets[key];

      topRow = item.topRow + reflowData[key].Y / parentRowSpace;
      bottomRow = height ? (item.topRow + reflowData[key].Y / parentRowSpace) + height / parentRowSpace : item.bottomRow + reflowData[key].Y / parentRowSpace;
      leftColumn = item.leftColumn + reflowData[key].X / parentColumnSpace;
      rightColumn = width ? (item.leftColumn + reflowData[key].X / parentColumnSpace) + width / parentColumnSpace : item.rightColumn + reflowData[key].X / parentColumnSpace;

      resultData[key] = {
        topRow,
        bottomRow,
        leftColumn,
        rightColumn,
      }
    }

    return resultData
  }, [canvasWidgets, parentRowSpace, parentColumnSpace])

  /**
  * @description 设置widgets移动方向
  * @param currentResizeWidgetInfo 当前resize的widget的信息
  * @param x 鼠标x的移动距离
  * @param y 鼠标y的移动距离
  * @param sortCanvasWidgets 排序后的widgets
  * @param direction 移动方向
  * @returns
  */
  const setWidgetResizeDirection = useCallback((
    currentResizeWidgetInfo: any,
    x: number,
    y: number,
    sortCanvasWidgets: any[],
    direction: ReSizeDirection
  ) => {
    let widgetMoveInfoCondition: Record<ReSizeDirection, {
      /** 起始单位长度*/
      startUnitLen: number,
      /** 结尾单位长度*/
      endUnitLen: number,
      /** 单位长度*/
      unit: number,
      /** 移动的单位长度*/
      moveDistance: number,
      /** 移动的轴*/
      moveAxis: 'x' | 'y',
      /** 开始边界方位*/
      startBoundary: 'topRow' | 'bottomRow' | 'leftColumn' | 'rightColumn',
      /** 结束边界方位*/
      endBoundary: 'topRow' | 'bottomRow' | 'leftColumn' | 'rightColumn',
      /** 正方向*/
      positiveDirection: 'topRow' | 'bottomRow' | 'leftColumn' | 'rightColumn',
      /** 反方向*/
      oppositeDirection: 'topRow' | 'bottomRow' | 'leftColumn' | 'rightColumn'
    }> = {
      [ReSizeDirection.TOP]: {
        startUnitLen: topRow,
        endUnitLen: bottomRow,
        unit: parentRowSpace,
        moveDistance: y,
        moveAxis: 'y',
        startBoundary: 'leftColumn',
        endBoundary: 'rightColumn',
        positiveDirection: 'topRow',
        oppositeDirection: 'bottomRow'
      },
      [ReSizeDirection.BOTTOM]: {
        startUnitLen: bottomRow,
        endUnitLen: topRow,
        unit: parentRowSpace,
        moveDistance: y,
        moveAxis: 'y',
        startBoundary: 'leftColumn',
        endBoundary: 'rightColumn',
        positiveDirection: 'bottomRow',
        oppositeDirection: 'topRow',
      },
      [ReSizeDirection.LEFT]: {
        startUnitLen: leftColumn,
        endUnitLen: rightColumn,
        unit: parentColumnSpace,
        moveDistance: x,
        moveAxis: 'x',
        startBoundary: 'topRow',
        endBoundary: 'bottomRow',
        positiveDirection: 'leftColumn',
        oppositeDirection: "rightColumn",
      },
      [ReSizeDirection.RIGHT]: {
        startUnitLen: rightColumn,
        endUnitLen: leftColumn,
        unit: parentColumnSpace,
        moveDistance: x,
        moveAxis: 'x',
        startBoundary: 'topRow',
        endBoundary: 'bottomRow',
        positiveDirection: 'rightColumn',
        oppositeDirection: 'leftColumn',
      }
    }

    const { startUnitLen, unit, endUnitLen, moveDistance, moveAxis,
      startBoundary, endBoundary, oppositeDirection
    } = widgetMoveInfoCondition[direction];
    let mouseStartBoundary: any;
    let mouseEndBoundary: any;
    let boundary: any;
    let curWidgetPosition;
    let moveCriticalValue = 0;
    const mouseStartBoundaryCondition: Record<ReSizeDirection, number> = {
      [ReSizeDirection.TOP]: Math.min(startUnitLen + (lastMoveDistance.current[moveAxis] / unit), endUnitLen - MIN_HEIGHT_ROW),
      [ReSizeDirection.BOTTOM]: Math.max(startUnitLen + (lastMoveDistance.current[moveAxis] / unit), endUnitLen + MIN_HEIGHT_ROW),
      [ReSizeDirection.LEFT]: Math.min(startUnitLen + (lastMoveDistance.current[moveAxis] / unit), endUnitLen - MIN_HEIGHT_ROW),
      [ReSizeDirection.RIGHT]: Math.max(startUnitLen + (lastMoveDistance.current[moveAxis] / unit), endUnitLen + MIN_HEIGHT_ROW)
    }
    /** 鼠标开始移动的边界*/
    mouseStartBoundary = mouseStartBoundaryCondition[direction]
    /** 鼠标结束移动的边界*/
    mouseEndBoundary = startUnitLen + (moveDistance / unit);
    /** 边界*/
    boundary = getActualBoundary(currentResizeWidgetInfo[startBoundary], currentResizeWidgetInfo[endBoundary], moveAxis)

    /** 是否受到碰撞*/
    const mouseBoundaryCondition: Record<ReSizeDirection, (widget: any) => boolean> = {
      [ReSizeDirection.TOP]: (widget: any) => {
        return (mouseStartBoundary > mouseEndBoundary
          && widget[oppositeDirection] <= mouseStartBoundary
          && widget[oppositeDirection] >= mouseEndBoundary
        )
      },
      [ReSizeDirection.BOTTOM]: (widget: any) => {
        return (mouseStartBoundary < mouseEndBoundary
          && widget[oppositeDirection] >= mouseStartBoundary
          && widget[oppositeDirection] <= mouseEndBoundary
        )
      },
      [ReSizeDirection.LEFT]: (widget: any) => {
        return (mouseStartBoundary > mouseEndBoundary
          && widget[oppositeDirection] <= mouseStartBoundary
          && widget[oppositeDirection] >= mouseEndBoundary
        )
      },
      [ReSizeDirection.RIGHT]: (widget: any) => {
        return (mouseStartBoundary < mouseEndBoundary
          && widget[oppositeDirection] >= mouseStartBoundary
          && widget[oppositeDirection] <= mouseEndBoundary
        )
      }
    }


    //获取刚好碰撞的widget的移动临界值
    const getMoveCriticalValue: Record<ReSizeDirection, (widget: any) => number> = {
      [ReSizeDirection.TOP]: (widget) => {
        return moveDistance + (widget.bottomRow - currentResizeWidgetInfo.topRow) * unit
      },
      [ReSizeDirection.BOTTOM]: (widget) => {
        return moveDistance - (currentResizeWidgetInfo.bottomRow - widget.topRow) * unit;
      },
      [ReSizeDirection.LEFT]: (widget) => {
        return moveDistance + (widget.rightColumn - currentResizeWidgetInfo.leftColumn) * unit
      },
      [ReSizeDirection.RIGHT]: (widget) => {
        return x - (currentResizeWidgetInfo.rightColumn - widget.leftColumn) * unit
      }
    }

    sortCanvasWidgets.forEach((item) => {
      if (item.widgetId === widgetId) {
        return
      }
      //当前widget的位置
      curWidgetPosition = currentPosition.current[item.widgetId]

      //当前widget在边界内并且widget受到碰撞
      if (
        !(curWidgetPosition[startBoundary] >= boundary.endBoundary || curWidgetPosition[endBoundary] <= boundary.startBoundary)
        && mouseBoundaryCondition[direction](item)
      ) {
        moveCriticalValue = getMoveCriticalValue[direction](item)
        widgetsResizeInfo.current.set(item.widgetId, {
          direction: direction,
          leftColumn: item.leftColumn,
          rightColumn: item.rightColumn,
          topRow: item.topRow,
          bottomRow: item.bottomRow,
          moveCriticalValue,
        })
      }
    })
  }, [widgetId, topRow, bottomRow, leftColumn, rightColumn, getActualBoundary])


  /**
  * @description 设置一个方向上的reflow数据
  * @param mouseMoveDistance {number} 鼠标移动的距离
  * @param direction {ReSizeDirection}  
  * @returns
  */
  /** */
  const setDirectionWidgetsReflowData = useCallback((
    mouseMoveDistance: number,
    direction: ReSizeDirection
  ) => {
    const boundaryCondition: Record<ReSizeDirection, {
      startBoundary: 'topRow' | 'bottomRow' | 'leftColumn' | 'rightColumn',
      endBoundary: 'topRow' | 'bottomRow' | 'leftColumn' | 'rightColumn',
      unit: number,
    }> = {
      [ReSizeDirection.TOP]: {
        startBoundary: 'leftColumn',
        endBoundary: 'rightColumn',
        unit: parentRowSpace,
      },
      [ReSizeDirection.BOTTOM]: {
        startBoundary: 'leftColumn',
        endBoundary: 'rightColumn',
        unit: parentRowSpace,
      },
      [ReSizeDirection.LEFT]: {
        startBoundary: 'topRow',
        endBoundary: 'bottomRow',
        unit: parentColumnSpace,
      },
      [ReSizeDirection.RIGHT]: {
        startBoundary: 'topRow',
        endBoundary: 'bottomRow',
        unit: parentColumnSpace,
      },
    }
    let { startBoundary, endBoundary, unit } = boundaryCondition[direction];
    //是否开始移动
    const isMoveCondition: Record<ReSizeDirection, (widgetsResizeInfoItem: any) => boolean> = {
      [ReSizeDirection.TOP]: (widgetsResizeInfoItem) => mouseMoveDistance < widgetsResizeInfoItem.moveCriticalValue,
      [ReSizeDirection.BOTTOM]: (widgetsResizeInfoItem) => mouseMoveDistance > widgetsResizeInfoItem.moveCriticalValue,
      [ReSizeDirection.LEFT]: (widgetsResizeInfoItem) => mouseMoveDistance < widgetsResizeInfoItem.moveCriticalValue,
      [ReSizeDirection.RIGHT]: (widgetsResizeInfoItem) => mouseMoveDistance > widgetsResizeInfoItem.moveCriticalValue,
    }

    //是否开始挤压
    const isExtrusionCondition: Record<ReSizeDirection, (widgetId: string) => boolean> = {
      [ReSizeDirection.TOP]: (widgetId: string) => {
        return widgetsDistanceInfo.current[widgetId].maxDistance > (topRow + mouseMoveDistance / parentRowSpace) - parentBlackInfo.topRow
      },
      [ReSizeDirection.BOTTOM]: (widgetId: string) => {
        return widgetsDistanceInfo.current[widgetId].maxDistance > parentBlackInfo.bottomRow - (bottomRow + mouseMoveDistance / parentRowSpace)
      },
      [ReSizeDirection.LEFT]: (widgetId: string) => {
        return widgetsDistanceInfo.current[widgetId].maxDistance > (leftColumn + mouseMoveDistance / parentColumnSpace) - parentBlackInfo.leftColumn
      },
      [ReSizeDirection.RIGHT]: (widgetId: string) => {
        return widgetsDistanceInfo.current[widgetId].maxDistance > parentBlackInfo.rightColumn - (rightColumn + mouseMoveDistance / parentColumnSpace)
      }
    }

    let sign = new Array(10000).fill(0);
    let isArriveBoundary = false
    let X;
    let Y;
    let collisionReflowData: any = {};
    let temporaryMoveReflowData: any = {};
    /** 直接接触的widgetIds*/
    let contactArrId: string[] = []
    //处理碰撞的reflow数据
    widgetsResizeInfo.current.forEach((value: any, key) => {
      X = 0;
      Y = 0;
      if (getContactState(sign, value[startBoundary] + 1, value[endBoundary] - 1)
        && value.direction === direction
        //直接接触移动，而不是间接接触移动
        && !reflowData.current[key]
      ) {
        sign.fill(1, value[startBoundary] + 1, value[endBoundary] - 1);
        contactArrId.push(key);
        if (direction === ReSizeDirection.TOP || direction === ReSizeDirection.BOTTOM) {
          Y = mouseMoveDistance - value.moveCriticalValue
        }
        if (direction === ReSizeDirection.LEFT || direction === ReSizeDirection.RIGHT) {
          X = mouseMoveDistance - value.moveCriticalValue
        }
        if (isMoveCondition[direction](value)) {
          temporaryMoveReflowData = getCollisionReflowData(key,
            (mouseMoveDistance - value.moveCriticalValue) / unit,
            direction,
            widgetsSpaceGraphCopy.current,
            parentRowSpace,
            parentColumnSpace,
            collisionReflowData,
            {
              X,
              Y,
            }
          )

          reflowData.current = {
            ...reflowData.current,
            ...temporaryMoveReflowData
          }
        }
      }
    })

    /** 挤压的reflow数据*/
    let extrusionReflowData: any = {};
    let temporaryExtrusionReflowData: any = {};
    contactArrId.forEach((widgetId) => {
      isArriveBoundary = false
      if (isExtrusionCondition[direction](widgetId)) {
        isArriveBoundary = true
      }
      if (isArriveBoundary) {
        temporaryExtrusionReflowData = getExtrusionReflowData(widgetId, direction)

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

  }, [topRow, parentBlackInfo, bottomRow, leftColumn, rightColumn,
    getExtrusionReflowData, parentRowSpace, parentColumnSpace,]
  )

  // 进行resize
  const onResizeDrag = useCallback((
    data: {
      x: number,
      y: number,
      direction: ReflowDirection
    }
  ) => {
    // console.time('aa')
    const { x, y, direction } = data
    reflowData.current = {};
    widgetsDistanceInfo.current = {};

    let topMaxWidgetNum = 0;
    let bottomMaxWidgetNum = 0;
    let leftMaxWidgetNum = 0;
    let rightMaxWidgetNum = 0;

    /** 排序的列表*/
    let sortCanvasWidgetList = canvasWidgetsChildrenDetail
    let currentResizeInfo = getCurrentResizeWidgetInfo(x, y, direction);

    /** 一个方向上的最大个数和最大长度和*/
    let maxInfo: {
      maxLength: number,
      maxNumber: number
    } = {
      maxLength: 0,
      maxNumber: 0
    }

    /** 一个方向上的剩余空间和一个方向上widget长度和最大值的差值*/
    let residualValue = 0;

    /** 范围外去除!!!*/
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
      if (value.direction === ReSizeDirection.TOP && y > value.moveCriticalValue) {
        widgetsResizeInfo.current.delete(key);
      }

      if (value.direction === ReSizeDirection.BOTTOM && y < value.moveCriticalValue) {
        widgetsResizeInfo.current.delete(key);
      }

      if (value.direction === ReSizeDirection.LEFT && x > value.moveCriticalValue) {
        widgetsResizeInfo.current.delete(key);
      }

      if (value.direction === ReSizeDirection.RIGHT && x < value.moveCriticalValue) {
        widgetsResizeInfo.current.delete(key);
      }
    })

    //上边框
    if (direction === ReflowDirection.TOP
      || direction === ReflowDirection.TOPLEFT
      || direction === ReflowDirection.TOPRIGHT
    ) {
      sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetail, ['bottomRow']).reverse();

      setWidgetResizeDirection(
        currentResizeInfo,
        x, y,
        sortCanvasWidgetList,
        ReSizeDirection.TOP
      )

      topMaxWidgetNum = 0;
      maxInfo = getMaxLengthAndNumber(ReSizeDirection.TOP)

      topWidgetLengthSum.current = maxInfo.maxLength
      currentTopLengthSum.current = maxInfo.maxLength
      topMaxWidgetNum = maxInfo.maxNumber

      let _y = y;
      //到达可碰撞和挤压的移动最大值
      if (topRow + y / parentRowSpace - parentBlackInfo.topRow - topMaxWidgetNum * MIN_HEIGHT_ROW < 0) {
        _y = -(topRow - parentBlackInfo.topRow - topMaxWidgetNum * MIN_HEIGHT_ROW) * parentRowSpace

        currentResizeInfo.transformY = _y;
        currentResizeInfo.height = componentHeight - _y
        currentResizeInfo.topRow = topRow + (_y / parentRowSpace);
        currentTopLengthSum.current = topWidgetLengthSum.current - Math.abs(topRow + _y / parentRowSpace - parentBlackInfo.topRow - topWidgetLengthSum.current);
      }
      residualValue = (topRow + _y / parentRowSpace) - parentBlackInfo.topRow - topWidgetLengthSum.current;
      //当受到挤压时
      if (residualValue <= 0) {
        currentTopLengthSum.current = topWidgetLengthSum.current - Math.abs(residualValue);
      }

      setDirectionWidgetsReflowData(_y, ReSizeDirection.TOP)
    }

    //下边框
    if (
      direction === ReflowDirection.BOTTOM
      || direction === ReflowDirection.BOTTOMLEFT
      || direction === ReflowDirection.BOTTOMRIGHT
    ) {
      sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetail, ['topRow']);

      setWidgetResizeDirection(
        currentResizeInfo,
        x, y,
        sortCanvasWidgetList,
        ReSizeDirection.BOTTOM
      )

      maxInfo = getMaxLengthAndNumber(ReSizeDirection.BOTTOM);
      bottomWidgetLengthSum.current = maxInfo.maxLength
      currentBottomLengthSum.current = maxInfo.maxLength
      bottomMaxWidgetNum = maxInfo.maxNumber

      let _y = y;
      //到达可碰撞和挤压的移动最大值
      if (parentBlackInfo.bottomRow - (bottomRow + y / parentRowSpace) - bottomMaxWidgetNum * MIN_HEIGHT_ROW < 0) {
        _y = (parentBlackInfo.bottomRow - bottomRow - bottomMaxWidgetNum * MIN_HEIGHT_ROW) * parentRowSpace

        currentResizeInfo.height = componentHeight + _y
        currentResizeInfo.bottomRow = bottomRow + (_y / parentRowSpace);
      }
      residualValue = parentBlackInfo.bottomRow - (bottomRow + _y / parentRowSpace) - bottomWidgetLengthSum.current;
      //当受到挤压时
      if (residualValue <= 0) {
        currentBottomLengthSum.current = bottomWidgetLengthSum.current - Math.abs(residualValue);
      }

      setDirectionWidgetsReflowData(_y, ReSizeDirection.BOTTOM)
    }

    //左边框
    if (direction === ReflowDirection.LEFT
      || direction === ReflowDirection.TOPLEFT
      || direction === ReflowDirection.BOTTOMLEFT
    ) {

      sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetail, ['rightColumn']).reverse();

      setWidgetResizeDirection(
        currentResizeInfo,
        x, y,
        sortCanvasWidgetList,
        ReSizeDirection.LEFT
      )

      maxInfo = getMaxLengthAndNumber(ReSizeDirection.LEFT);
      leftWidgetLengthSum.current = maxInfo.maxLength
      currentLeftLengthSum.current = maxInfo.maxLength
      leftMaxWidgetNum = maxInfo.maxNumber

      let _x = x;
      //到达可碰撞和挤压的移动最大值
      if (leftColumn + x / parentColumnSpace - parentBlackInfo.leftColumn - leftMaxWidgetNum * MIN_WIDTH_COLUMN < 0) {
        _x = -(leftColumn - parentBlackInfo.leftColumn - leftMaxWidgetNum * MIN_WIDTH_COLUMN) * parentColumnSpace

        currentResizeInfo.leftColumn = leftColumn + (_x / parentColumnSpace);
        currentResizeInfo.width = componentWidth - _x;
        currentResizeInfo.transformX = _x;
      }
      residualValue = (leftColumn + _x / parentColumnSpace) - parentBlackInfo.leftColumn - leftWidgetLengthSum.current;
      //当受到挤压时
      if (residualValue <= 0) {
        currentLeftLengthSum.current = leftWidgetLengthSum.current - Math.abs(residualValue);
      }

      setDirectionWidgetsReflowData(_x, ReSizeDirection.LEFT)
    }

    if (direction === ReflowDirection.RIGHT
      || direction === ReflowDirection.TOPRIGHT
      || direction === ReflowDirection.BOTTOMRIGHT
    ) {
      //右边
      sortCanvasWidgetList = _.sortBy(canvasWidgetsChildrenDetail, ['leftColumn']);
      setWidgetResizeDirection(
        currentResizeInfo,
        x, y,
        sortCanvasWidgetList,
        ReSizeDirection.RIGHT
      )

      maxInfo = getMaxLengthAndNumber(ReSizeDirection.RIGHT);
      rightWidgetLengthSum.current = maxInfo.maxLength
      currentRightLengthSum.current = maxInfo.maxLength
      rightMaxWidgetNum = maxInfo.maxNumber

      let _x = x;
      //到达可碰撞和挤压的移动最大值
      if (parentBlackInfo.rightColumn - (rightColumn + x / parentColumnSpace) - rightMaxWidgetNum * MIN_WIDTH_COLUMN < 0) {
        _x = (parentBlackInfo.rightColumn - rightColumn - rightMaxWidgetNum * MIN_WIDTH_COLUMN) * parentColumnSpace
        currentResizeInfo.rightColumn = rightColumn + (_x / parentColumnSpace);
        currentResizeInfo.width = componentWidth + _x;
      }
      residualValue = parentBlackInfo.rightColumn - (rightColumn + _x / parentColumnSpace) - rightWidgetLengthSum.current;
      //当受到挤压时
      if (residualValue <= 0) {
        currentRightLengthSum.current = rightWidgetLengthSum.current - Math.abs(residualValue);
      }

      setDirectionWidgetsReflowData(_x, ReSizeDirection.RIGHT)
    }

    updateWidgetRowCol.current = {
      topRow: currentResizeInfo.topRow,
      bottomRow: currentResizeInfo.bottomRow,
      leftColumn: currentResizeInfo.leftColumn,
      rightColumn: currentResizeInfo.rightColumn
    }
    // console.timeEnd('aa')

    dispatch(setReflowingWidgets({ ...reflowData.current }))
    setNewDimensions({
      x: currentResizeInfo.transformX,
      y: currentResizeInfo.transformY,
      width: currentResizeInfo.width,
      height: currentResizeInfo.height,
      direction
    })
    setLastMoveDistance(x, y, direction)
    updateWidgetsPosition.current = getUpdateWidgets(reflowData.current)
    currentPosition.current = _.merge({}, originalPosition.current, updateWidgetsPosition.current);
  }, [
    topRow,
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
    getCurrentResizeWidgetInfo,
    parentBlackInfo,
    setLastMoveDistance,
    setWidgetResizeDirection,
    setDirectionWidgetsReflowData
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
    dispatch(updateWidgets({ widgetsRowCol: updateWidgetsPosition.current }))
  }, [widgetId, getUpdateWidgets])

  /** 拖拽时widget宽度*/
  const widgetWidth = useMemo(() => {
    if (reflowedPosition?.width) {
      return reflowedPosition.width - 2 * WIDGET_PADDING
    }
    if (curFocusedWidgetId === widgetId) {
      return newDimensions.width
    }
    return componentWidth
  }, [reflowedPosition, newDimensions])

  /** 拖拽时widget高度*/
  const widgetHeight = useMemo(() => {
    if (reflowedPosition?.height) {
      return reflowedPosition.height - 2 * WIDGET_PADDING
    }
    if (curFocusedWidgetId === widgetId) {
      return newDimensions.height
    }
    return componentHeight
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
