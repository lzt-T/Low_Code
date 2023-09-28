import styled from 'styled-components'

export const WrapperSty = styled.div`
  display: flex;
  gap: 3px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  height: 72px;
  user-select: none;
  &:hover {
    background: #F0F0F0;
    cursor: grab;
    opacity: 0.8;
  }
`