import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getCanvasWidgetDsl } from '@/store/slices/canvasWidgetsStructureSlice'
import Canvas from './components/Canvas'
import { useState, useEffect } from 'react'
import { getCanvasWidth } from '@/selectors/editorSelectors';
import WidgetFactory from '@/widgets/WidgetFactory';
import { getWidgetChildrenDetailSelector, getWidgetsSelector } from '@/store/slices/canvasWidgets';
import { buildGraph } from '@/ngReflow/ngReflow';
import { MAIN_CONTAINER_WIDGET_ID } from '@/constant/canvas';
import { setWidgetsSpaceGraph } from '@/store/slices/widgetReflowSlice';

export default function Editor() {
  const widgetsStructure = useAppSelector(getCanvasWidgetDsl);
  const canvasWidth = useAppSelector(getCanvasWidth)
  const canvasWidgets = useAppSelector(getWidgetsSelector);

  /** 组件是否注册完成*/
  const [isLoad, setIsLoad] = useState(false);
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (WidgetFactory.widgetBuilderMap.size === WidgetFactory.widgetNum && isLoad === false) {
      setIsLoad(true)
    }
  }, [WidgetFactory.widgetBuilderMap.size, isLoad])


  useEffect(() => {
    let resultData: {
      [propName: string]: any[]
    } = {};
    let data: {
      [propName: string]: {}
    } = {};
    for (let key in canvasWidgets) {
      let item = canvasWidgets[key];
      if (item.type === 'CONTAINER_WIDGET' || item.type === 'CANVAS_WIDGET') {
        let childrenDetail: any[] = [];
        let childrenIdList = canvasWidgets[item.widgetId].children;
        for (let i = 0; i < childrenIdList.length; i++) {
          childrenDetail.push(canvasWidgets[childrenIdList[i]])
        }
        resultData[item.widgetId] = childrenDetail;
      }
    }

    for (let key in resultData) {
      let widgetList = []
      for (let keyOne in resultData[key]) {
        let item = resultData[key][keyOne];
        widgetList.push({
          ...item,
          id: item.widgetId
        })
      }

      let spaceGraph = buildGraph(widgetList as any);
      data[key] = spaceGraph;
    }

    dispatch(setWidgetsSpaceGraph(data));
  }, [canvasWidgets])


  return (
    <>
      <div
        className='canvas'
        style={{
          height: "100%",
          position: 'relative',
        }}>
        {isLoad && <Canvas
          canvasWidth={canvasWidth}
          widgetsStructure={widgetsStructure}
        />
        }
      </div>
    </>
  )
}