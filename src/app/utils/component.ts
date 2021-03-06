export interface PartialBoxProps {
  margin?: string | number
  marginBottom?: string | number
  marginLeft?: string | number
  marginRight?: string | number
  marginTop?: string | number
  marginX?: string | number
  marginY?: string | number

  padding?: string | number
  paddingBottom?: string | number
  paddingLeft?: string | number
  paddingRight?: string | number
  paddingTop?: string | number
  paddingX?: string | number
  paddingY?: string | number

  flex?: string | number
  flexBasis?: string
  flexDirection?: "row" | "column"
  flexGrow?: string | number
  flexShrink?: string | number
  flexWrap?: string

  alignItems?: "stretch" | "center" | "flex-start" | "flex-end" | "baseline" | "initial" | "inherit"
  alignContents?: "stretch" | "center" | "flex-start" | "flex-end" | "baseline" | "initial" | "inherit"
  justifyItems?: "stretch" | "center" | "flex-start" | "flex-end" | "baseline" | "initial" | "inherit"
  justifyContents?: "stretch" | "center" | "flex-start" | "flex-end" | "baseline" | "initial" | "inherit"

  position?: "relative" | "absolute" | "fixed" | "initial" | "unset"
}

export const extractBoxProps = (props: any) => {
  const {
    margin,
    marginBottom,
    marginLeft,
    marginRight,
    marginTop,
    marginX,
    marginY,
    padding,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingX,
    paddingY,
    flex,
    flexBasis,
    flexDirection,
    flexGrow,
    flexShrink,
    flexWrap,
    alignItems,
    alignContents,
    justifyItems,
    justifyContents,
    position,
    ...restProps
  } = props

  const boxProps: {
    [index: string]: any,
  } = {
    margin,
    marginBottom,
    marginLeft,
    marginRight,
    marginTop,
    marginX,
    marginY,
    padding,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingX,
    paddingY,
    flex,
    flexBasis,
    flexDirection,
    flexGrow,
    flexShrink,
    flexWrap,
    alignItems,
    alignContents,
    justifyItems,
    justifyContents,
    position,
  }

  for (const key of Object.keys(boxProps)) {
    if (boxProps[key] === undefined) {
      delete boxProps[key]
    }
  }

  return {
    boxProps: boxProps as PartialBoxProps,
    restProps,
  }
}
