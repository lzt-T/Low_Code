import { IAccessor } from "@/interface/space"

export enum SpaceAttributes {
  top = "topRow",
  bottom = "bottomRow",
  left = "leftColumn",
  right = "rightColumn",
}
export enum DirectionAttributes {
  top = 'top',
  bottom = 'bottom',
  left = 'left',
  right = 'right'
}

/**
 * 水平排序（如果值相同，竖直排序）
 * @param spaces
 * @returns 
 */
export function sortXAxis(spaces: any[]): any[] {
  return spaces.sort((a, b) => {
    if (a.leftColumn === b.leftColumn) {
      return a.topRow - b.topRow
    }
    return a.leftColumn - b.leftColumn
  })
}


/**
 * 竖直排序（如果值相同，水平排序）
 * @param spaces 
 * @returns 
 */
export function sortYAxis(spaces: any[]): any[] {
  return spaces.sort((a, b) => {
    if (a.topRow === b.topRow) {
      return a.leftColumn - b.leftColumn
    }
    return a.topRow - b.topRow
  })
}

export function getAccessor(isHorizontal: boolean): IAccessor {
  if (isHorizontal) {
    return {
      min: DirectionAttributes.left,
      max: DirectionAttributes.right,
      minAttr: SpaceAttributes.left,
      maxAttr: SpaceAttributes.right,
      perpendicularMin: DirectionAttributes.top,
      perpendicularMax: DirectionAttributes.bottom,
      perpendicularMinAttr: SpaceAttributes.top,
      perpendicularMaxAttr: SpaceAttributes.bottom,
    }
  }

  return {
    min: DirectionAttributes.top,
    max: DirectionAttributes.bottom,
    minAttr: SpaceAttributes.top,
    maxAttr: SpaceAttributes.bottom,
    perpendicularMin: DirectionAttributes.left,
    perpendicularMax: DirectionAttributes.right,
    perpendicularMinAttr: SpaceAttributes.left,
    perpendicularMaxAttr: SpaceAttributes.right,
  }
}