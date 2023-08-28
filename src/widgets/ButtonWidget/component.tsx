import React, { useEffect } from "react"
import { useMemo } from 'react'


interface MdButtonProps {
  [propName: string]: any
}
export default function MdButton(props: MdButtonProps) {
  const {
    text
  } = props

  useEffect(() => {
    console.log(props);

  }, [])

  return (
    <>
      <div style={{
        background: 'red'
      }}>{text}</div>
    </>
  )
}
