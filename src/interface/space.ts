
export interface IDirectionalRelation {
  id: string;
  distance: number;
}

export type GraphNode = {
  id: string;
  // 行列位置
  position: {
    [direction: string]: number
  };
  relations: {
    top: IDirectionalRelation[];
    bottom: IDirectionalRelation[];
    left: IDirectionalRelation[];
    right: IDirectionalRelation[],
  }

  [key: string]: any;
}

export type SpaceGraph = {
  [id: string]: GraphNode
}

export interface OccupiedSpace{
  id: string;
  parentId?: string;
  topRow: number;
  bottomRow: number;
  leftColumn: number;
  rightColumn: number;
}


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

export interface IAccessor {
  min: DirectionAttributes,
  max: DirectionAttributes,
  minAttr: SpaceAttributes,
  maxAttr: SpaceAttributes,
  perpendicularMin: DirectionAttributes,
  perpendicularMinAttr: SpaceAttributes,
  perpendicularMax: DirectionAttributes,
  perpendicularMaxAttr: SpaceAttributes,
}