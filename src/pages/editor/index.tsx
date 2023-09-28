import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getCanvasWidgetDsl } from '@/store/slices/canvasWidgetsStructureSlice'
import Canvas from './components/Canvas'
import { useState, useEffect } from 'react'
import { getCanvasWidth } from '@/selectors/editorSelectors';
import WidgetFactory from '@/widgets/WidgetFactory';
import { getWidgetChildrenDetailSelector, getWidgetsSelector } from '@/store/slices/canvasWidgets';
import { buildGraph } from '@/ngReflow/ngReflow';
import { MAIN_CONTAINER_WIDGET_ID } from '@/constant/canvas';
import { setWidgetsSpaceGraph, setWidgetsSpaceGraphAccording } from '@/store/slices/widgetReflowSlice';

export default function Editor() {
  const widgetsStructure = useAppSelector(getCanvasWidgetDsl);
  const canvasWidth = useAppSelector(getCanvasWidth)

  /** 组件是否注册完成*/
  const [isLoad, setIsLoad] = useState(false);
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (WidgetFactory.widgetBuilderMap.size === WidgetFactory.widgetNum && isLoad === false) {
      setIsLoad(true)
    }
  }, [WidgetFactory.widgetBuilderMap.size, isLoad])

  const canvasWidgetsChildrenDetail = useAppSelector(getWidgetChildrenDetailSelector(MAIN_CONTAINER_WIDGET_ID));
  /** */
  useEffect(() => {
    let widgetList = []
    for (let key in canvasWidgetsChildrenDetail) {
      let item = canvasWidgetsChildrenDetail[key];
      widgetList.push({
        ...item,
        id: item.widgetId
      })
    }
  
    /** 建立状态图*/
    let spaceGraph = buildGraph(widgetList as any);
    dispatch(setWidgetsSpaceGraphAccording({...spaceGraph}));
    dispatch(setWidgetsSpaceGraph(spaceGraph));
    
  }, [canvasWidgetsChildrenDetail])


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