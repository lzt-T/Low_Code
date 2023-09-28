
import { GraphNode, OccupiedSpace, SpaceGraph } from "@/interface/space"
import { getAccessor, sortXAxis, sortYAxis } from "./ngReflowUtils"

/**
 * 根据 Widgets 初始化 Graph
 * @param spaces Widgets 占用空间列表
 * @returns 
 */
function initSpaceGraph(spaces: OccupiedSpace[]): any {

  const graph: SpaceGraph = {}
  if (!spaces) return graph

  for (const space of spaces) {
    const graphNode = createGraphNode(space)
    graph[space.id] = graphNode
  }

  return graph
}

function createGraphNode(space: any): any {
  return {
    id: space.id,
    position: {
      top: space.topRow,
      right: space.rightColumn,
      bottom: space.bottomRow,
      left: space.leftColumn,
    },
    relations: { top: [], right: [], bottom: [], left: [] }
  }
}

/**
 * 构建当前节点，和与其在水平（或竖直）方向上重叠的其他节点的相对位置关系。
 * 将其他节点分成左右（或上下）并按离当前节点的距离从小到大排序。
 * @param currentSpace 
 * @param overlappedSpaces 
 * @param graph 
 * @param ishorizontal 
 */
function createRelations(currentSpace: OccupiedSpace, overlappedSpaces: OccupiedSpace[], graph: SpaceGraph, processedIds: string[], isHorizontal = true) {
  if (overlappedSpaces.length === 0) {
    return
  }

  const accessor = getAccessor(isHorizontal)
  const sorter: (spaces: any[]) => any[] = isHorizontal ? sortXAxis : sortYAxis

  // 标志位，用于检查 Space 是否和已经处理过的 Space 有重叠。已经处理过的 Space 将对应位置的 flag 进行相应设置。
  // 长度由最右（下）边的坐标决定。0 代表该列未被占用，1 代表该列已被占用。
  
  let flagLength = overlappedSpaces.reduce((max, space) => Math.max(max, space[accessor.perpendicularMaxAttr]), 0) + 1
  const flags = new Array(flagLength).fill(0)

  // 左（上）边的 Spaces
  const lessThanSpaces = sorter(overlappedSpaces.filter(item => item[accessor.minAttr] < currentSpace[accessor.minAttr])).reverse()
  // 右（下）边的 Spaces
  const largerThanSpaces = sorter(overlappedSpaces.filter(item => item[accessor.minAttr] > currentSpace[accessor.minAttr]))

  // 处理左（上）方向
  for (const space of lessThanSpaces) {
    // 从 Space 左（上）边坐标开始
    let idx = space[accessor.perpendicularMinAttr]
    // 检查是否和已经处理过的 Space 有重叠
    while (flags[idx] === 0 && idx < space[accessor.perpendicularMaxAttr]) idx++
    // 如果没有重叠并且 Space 未被处理，建立关系
    if (idx === space[accessor.perpendicularMaxAttr] && !processedIds.includes(space.id)) {
      const distance = Math.abs(space[accessor.maxAttr] - currentSpace[accessor.minAttr])
      graph[currentSpace.id].relations[accessor.min]?.push({ id: space.id, distance })
      graph[space.id].relations[accessor.max]?.push({ id: currentSpace.id, distance })
    }
    // 设置 Space 宽度（高度）对应的 flag
    flags.fill(1, space[accessor.perpendicularMinAttr], space[accessor.perpendicularMaxAttr])
  }

  // 重置
  flags.fill(0)

  // 处理右（下）方向
  for (const space of largerThanSpaces) {
    // 从 Space 左（上）边坐标开始
    let idx = space[accessor.perpendicularMinAttr]
    // 检查是否和已经处理过的 Space 有重叠
    while (flags[idx] === 0 && idx < space[accessor.perpendicularMaxAttr]) idx++
    // 如果没有重叠并且 Space 未被处理，建立关系
    if (idx === space[accessor.perpendicularMaxAttr] && !processedIds.includes(space.id)) {
      const distance = Math.abs(space[accessor.minAttr] - currentSpace[accessor.maxAttr])
      graph[currentSpace.id].relations[accessor.max]?.push({ id: space.id, distance })
      graph[space.id].relations[accessor.min]?.push({ id: currentSpace.id, distance })
    }
    // 设置 Space 宽度（高度）对应的 flag
    flags.fill(1, space[accessor.perpendicularMinAttr], space[accessor.perpendicularMaxAttr])
  }
}

export function buildGraph(occupiedSpaces: OccupiedSpace[]): GraphNode {
  const graph = initSpaceGraph(occupiedSpaces)

  if (!occupiedSpaces || occupiedSpaces.length < 2) {
    return graph
  }

  const maxLength = occupiedSpaces.length

  const horizontallySorted = sortXAxis(occupiedSpaces)
  let currentIdx = 0
  let processed: string[] = []

  while (currentIdx < maxLength) {
    const currentSpace = horizontallySorted[currentIdx]

    // 找出竖直方向上和当前 Space 重叠的 Spaces
    const overlapped = occupiedSpaces.filter(item =>
      !(item.rightColumn <= currentSpace.leftColumn || item.leftColumn >= currentSpace.rightColumn) &&
      item.id !== currentSpace.id
    )

    createRelations(currentSpace, overlapped, graph, processed, false)
    processed.push(currentSpace.id)
    currentIdx++
  }

  const verticallySorted = sortYAxis(occupiedSpaces)
  currentIdx = 0
  processed = []

  while (currentIdx < maxLength) {
    const currentSpace = verticallySorted[currentIdx]

    const overlapped = occupiedSpaces.filter(item =>
      !(item.bottomRow <= currentSpace.topRow || item.topRow >= currentSpace.bottomRow) &&
      item.id !== currentSpace.id
    )

    createRelations(currentSpace, overlapped, graph, processed, true)
    processed.push(currentSpace.id)
    currentIdx++
  }

  // console.log('**ngReflow** graph', graph)

  return graph
}
