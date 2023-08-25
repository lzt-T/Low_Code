import { nanoid } from '@reduxjs/toolkit'

export const generateReactKey = ({
  prefix = "",
}: { prefix?: string } = {}): string => {
  // return prefix + generate(ALPHANUMERIC, 10);
  return prefix + '_' + nanoid(10)
}