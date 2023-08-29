import { useAppSelector } from '@/hooks/redux'
import { getCanvasWidgetDsl } from '@/store/slices/canvasWidgetsStructureSlice'
import Canvas from './components/Canvas'
import { useState, useEffect } from 'react'
import { getCanvasWidth } from '@/selectors/editorSelectors';
import WidgetFactory from '@/widgets/WidgetFactory';

export default function Editor() {
  const widgetsStructure = useAppSelector(getCanvasWidgetDsl);
  const canvasWidth = useAppSelector(getCanvasWidth)

  /** 组件是否注册完成*/
  const [isLoad, setIsLoad] = useState(false);

  useEffect(() => {
    if (WidgetFactory.widgetBuilderMap.size === WidgetFactory.widgetNum && isLoad === false) {
      setIsLoad(true)
    }
  }, [WidgetFactory.widgetBuilderMap.size, isLoad])

  return (
    <>
      <div style={{
        height: "100vh",
        position: 'relative'
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