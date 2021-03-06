import { Box, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { RootState } from "app/store/types";
import cls from "classnames";
import React from "react";
import { useSelector } from "react-redux";
import { ReactComponent as BrandSVG } from "./brand.svg";
import { ReactComponent as BrandLogoSVG } from "./brand-logo.svg";
import { AppTheme } from "app/theme/types";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    '& svg': {
      height: 36,
      '& .st0': {
        fill: '#169BA3!important',
      }
    },
  },
  darkMode: {
    '& svg .st0': {
      fill: '#29CCC4!important',
    }
  },
}));

const Brand: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, ...rest } = props;
  const classes = useStyles(props);
  const isXs = useMediaQuery((theme: AppTheme) => theme.breakpoints.down("xs"));
  const themeType = useSelector<RootState, string>(state => state.preference.theme);

  const Logo = isXs ? BrandLogoSVG : BrandSVG;

  return (
    <Box className={cls(classes.root, { [classes.darkMode]: themeType === "dark" }, className)} {...rest}>
      <Logo />
    </Box>
  );
};

export default Brand;
