import { useAppSelector } from './redux'

export default function useWidgetConfigs() {
  const widgetConfigs = useAppSelector((state) => state.widgetConfigs.configs)
  
  const cards = Object.values(widgetConfigs).filter((config:any) => !config.hideCard)
  
  const _cards: any = cards.map((config:any) => {
    const {
      columns,
      detachFromLayout = false,
      displayName,
      iconSVG,
      key,
      rows,
      searchTags,
      type,
    } = config
    return {
      key,
      type,
      rows,
      columns,
      detachFromLayout,
      displayName,
      icon: iconSVG,
      searchTags,
    }
  })
  const sortedCards = _cards
  return sortedCards
}