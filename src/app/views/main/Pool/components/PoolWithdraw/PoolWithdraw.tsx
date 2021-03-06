
import { Box, Button, Divider, InputLabel, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ArrowBack } from "@material-ui/icons";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { ContrastBox, CurrencyInput, ExpiryField, FancyButton, KeyValueDisplay, ProportionSelect, SlippageField, Text } from "app/components";
import { actions } from "app/store";
import { LayoutState, PoolFormState, RootState, SwapFormState, TokenInfo, WalletObservedTx, WalletState } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { hexToRGBA, useAsyncTask, useMoneyFormatter } from "app/utils";
import { BIG_ZERO, DefaultFallbackNetwork } from "app/utils/constants";
import { MoneyFormatterOptions } from "app/utils/useMoneyFormatter";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { toBasisPoints, ZilswapConnector } from "core/zilswap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PoolDetail from "../PoolDetail";
import PoolIcon from "../PoolIcon";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    padding: theme.spacing(0, 8, 0),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0, 2, 0),
    },
  },
  proportionSelect: {
    marginTop: 12,
  },
  input: {
    marginTop: 12,
    marginBottom: 20
  },
  svg: {
    alignSelf: "center",
    marginBottom: 12
  },
  actionButton: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    height: 46
  },
  backButton: {
    borderRadius: theme.spacing(.5),
    marginLeft: theme.spacing(-2),
  },
  readOnly: {
    backgroundColor: theme.palette.background.readOnly,
    textAlign: "right",
    color: theme.palette.text?.primary,
    padding: theme.spacing(2, 3),
  },
  previewAmount: {
    fontSize: 20,
    lineHeight: "24px",
  },
  keyValueLabel: {
    marginTop: theme.spacing(1),
  },
  poolDetails: {
    marginTop: theme.spacing(2),
  },
  advanceDetails: {
    marginBottom: theme.spacing(2),
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    color: theme.palette.text!.secondary,
    cursor: "pointer"
  },
  primaryColor: {
    color: theme.palette.primary.main
  },
  showAdvanced: {
    padding: theme.spacing(2.5, 8, 6.5),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2.5, 2, 6.5),
    },
  },
  text: {
    fontWeight: 400,
    letterSpacing: 0
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: `rgba${hexToRGBA(theme.palette.primary.main, 0.3)}`
  },
  errorMessage: {
    marginTop: theme.spacing(1),
  }
}));

const initialFormState = {
  tokenAmount: "0",
  removeContribution: BIG_ZERO,
};

const PoolWithdraw: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);
  const [currencyDialogOverride, setCurrencyDialogOverride] = useState<boolean>(false);
  const [runRemoveLiquidity, loading, error] = useAsyncTask("poolRemoveLiquidity");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const poolFormState = useSelector<RootState, PoolFormState>(state => state.pool);
  const layoutState = useSelector<RootState, LayoutState>(state => state.layout);
  const swapFormState = useSelector<RootState, SwapFormState>(state => state.swap);
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const poolToken = useSelector<RootState, TokenInfo | null>(state => state.pool.token);
  const formatMoney = useMoneyFormatter({ showCurrency: true, maxFractionDigits: 6 });

  const userPoolTokenPercent = poolToken?.pool?.contributionPercentage.shiftedBy(-2);
  const inPoolAmount = poolToken?.pool?.tokenReserve.times(userPoolTokenPercent || 0);

  const zilFormatOpts: MoneyFormatterOptions = {
    symbol: "ZIL",
    compression: 12,
  };
  const formatOpts: MoneyFormatterOptions = {
    symbol: poolToken?.symbol,
    compression: poolToken?.decimals,
  };

  useEffect(() => {
    if (poolToken && currencyDialogOverride) {
      setCurrencyDialogOverride(false);
    }
  }, [poolToken, currencyDialogOverride]);

  useEffect(() => {
    if (!poolFormState.forNetwork) return

    // clear form if network changed
    if (poolFormState.forNetwork !== layoutState.network) {
      setFormState({ ...initialFormState })
      dispatch(actions.Pool.clear());
    }

    // eslint-disable-next-line
  }, [layoutState.network]);

  const onPoolChange = (token: TokenInfo) => {
    if (!token.pool) return;
    const network = ZilswapConnector.network;
    dispatch(actions.Pool.select({ token, network }));
    onTokenChange("0");
  };

  const updateFormStates = (tokenAmount: BigNumber, removeContribution: BigNumber, inputAmount?: string) => {

    setFormState({
      tokenAmount: inputAmount || tokenAmount.toString(),
      removeContribution,
    });

    if (poolToken?.pool) {
      const zilAmount = tokenAmount.times(poolToken.pool.exchangeRate).decimalPlaces(poolToken.decimals);
      dispatch(actions.Pool.update({
        forNetwork: ZilswapConnector.network,
        removeZilAmount: zilAmount.shiftedBy(poolToken.decimals),
        removeTokenAmount: tokenAmount.shiftedBy(poolToken.decimals),
      }));
    }
  };

  const onPercentage = (percentage: number) => {
    if (!poolToken?.pool) return;
    const removeContribution = poolToken.pool.userContribution.times(percentage).decimalPlaces(0) || BIG_ZERO;
    const tokenAmount = removeContribution.div(poolToken.pool.totalContribution).times(poolToken.pool.tokenReserve).decimalPlaces(0);

    updateFormStates(tokenAmount.shiftedBy(-poolToken.decimals), removeContribution);
  };

  const onTokenChange = (inputAmount: string = "0") => {
    if (poolToken?.pool) {
      let bnTokenAmount = new BigNumber(inputAmount);
      if (bnTokenAmount.isNegative() || bnTokenAmount.isNaN())
        bnTokenAmount = BIG_ZERO;

      const userContribution = poolToken.pool.userContribution;
      const removeRatio = bnTokenAmount.div(poolToken.pool.tokenReserve.shiftedBy(-poolToken.decimals));
      let removeContribution = poolToken.pool.totalContribution.times(removeRatio).decimalPlaces(0);

      // replace input with max available tokens/contribution
      // input will only visually update onBlur to preserve UX
      if (removeContribution.isGreaterThan(userContribution!)) {
        bnTokenAmount = inPoolAmount!.decimalPlaces(0).shiftedBy(-poolToken.decimals);
        removeContribution = poolToken.pool.userContribution;
      }

      updateFormStates(bnTokenAmount, removeContribution, inputAmount);
    }
  };

  const onRemoveLiquidity = () => {
    if (!poolToken) return setCurrencyDialogOverride(true);
    if (poolFormState.removeTokenAmount.isZero()) return;
    if (loading) return;

    runRemoveLiquidity(async () => {
      const tokenAddress = poolToken.address;
      const removeContribution = formState.removeContribution;
      const slippage = swapFormState.slippage;

      ZilswapConnector.setDeadlineBlocks(swapFormState.expiry);
      const observedTx = await ZilswapConnector.removeLiquidity({
        tokenID: tokenAddress,
        contributionAmount: removeContribution,
        maxExchangeRateChange: toBasisPoints(slippage).toNumber(),
      });
      const walletObservedTx: WalletObservedTx = {
        ...observedTx!,
        address: walletState.wallet?.addressInfo.bech32 || "",
        network: walletState.wallet?.network || DefaultFallbackNetwork,
      };

      const updatedPool = ZilswapConnector.getPool(tokenAddress) || undefined;
      dispatch(actions.Token.update({
        address: tokenAddress,
        pool: updatedPool,
      }));
      dispatch(actions.Transaction.observe({ observedTx: walletObservedTx }));
    });
  };

  const onBack = () => {
    dispatch(actions.Layout.showPoolType("manage"));
  };

  const onDoneEditing = () => {
    setFormState({
      ...formState,
      tokenAmount: poolFormState.removeTokenAmount.shiftedBy(-(poolToken?.decimals || 0)).toString(),
    });
  };

  const liquidityTokenRate = poolToken?.pool?.totalContribution.isPositive() ? poolToken!.pool!.tokenReserve.div(poolToken!.pool!.totalContribution) : BIG_ZERO;

  return (
    <Box display="flex" flexDirection="column"  {...rest} className={clsx(classes.root, className)}>
      <Box className={classes.container}>
        <Box display="flex" justifyContent="flex-start" alignItems="center" marginY={4}>
          <Button variant="text" onClick={onBack} className={classes.backButton}>
            <ArrowBack color="disabled" />
            <Text variant="h3" marginLeft={1}>Remove Liquidity</Text>
          </Button>
        </Box>

        <CurrencyInput
          hideBalance
          showCurrencyDialog={currencyDialogOverride}
          onCloseDialog={() => setCurrencyDialogOverride(false)}
          label="Withdraw Token"
          token={poolToken}
          amount={formState.tokenAmount}
          disabled={!poolToken}
          onEditorBlur={onDoneEditing}
          onAmountChange={onTokenChange}
          onCurrencyChange={onPoolChange}
          dialogOpts={{
            hideNoPool: true,
            hideZil: true,
          }} />

        <ProportionSelect fullWidth
          color="primary"
          className={classes.proportionSelect}
          onSelectProp={onPercentage} />

        <KeyValueDisplay className={classes.keyValueLabel} hideIfNoValue kkey="In Pool">
          {!!poolToken && formatMoney(inPoolAmount || 0, formatOpts)}
        </KeyValueDisplay>

        <PoolIcon type="minus" />
        <InputLabel>You Receive (Estimate)</InputLabel>

        <ContrastBox className={classes.readOnly}>
          <Typography className={classes.previewAmount}>
            <span>{formatMoney(poolFormState.removeZilAmount, zilFormatOpts)}</span>
            <span> + {formatMoney(poolFormState.removeTokenAmount, formatOpts)}</span>
          </Typography>
        </ContrastBox>

        <PoolDetail className={classes.poolDetails} token={poolToken || undefined} />

        <Typography className={classes.errorMessage} color="error">{error?.message}</Typography>

        <FancyButton walletRequired
          loading={loading}
          className={classes.actionButton}
          variant="contained"
          color="primary"
          onClick={onRemoveLiquidity}>
          Remove Liquidity
        </FancyButton>

        {!!poolToken ? (
          <Typography
            variant="body2"
            className={clsx(classes.advanceDetails, { [classes.primaryColor]: showAdvanced })}
            onClick={() => setShowAdvanced(!showAdvanced)}>
            Advanced Details {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Typography>
        ) : <Box component="div" display="block" style={{ height: 16 }}>&nbsp;</Box>}
      </Box>

      {!!showAdvanced && !!poolToken && (
        <ContrastBox className={classes.showAdvanced}>
          <Typography className={classes.text} variant="body2">
            You are removing{" "}
            <strong>{formatMoney(poolFormState.removeZilAmount, zilFormatOpts)} + {formatMoney(poolFormState.removeTokenAmount, formatOpts)}</strong>
            from the liquidity pool.{" "}
            <strong>(~{formatMoney(poolFormState.removeTokenAmount, { ...formatOpts, showCurrency: true })} Pool Token)</strong>
          </Typography>

          <Divider className={classes.divider} />

          <KeyValueDisplay mt={"22px"} kkey={"Current Total Supply"}>
            {formatMoney(poolToken?.pool?.tokenReserve || 0, { ...formatOpts })} Pool Token
          </KeyValueDisplay>
          <KeyValueDisplay mt={"8px"} kkey={"Each Pool Token Value"}>
            {formatMoney(new BigNumber(liquidityTokenRate).times(poolToken?.pool?.exchangeRate || 0), { ...zilFormatOpts, compression: 0 })}
            {" "}+{" "}
            {formatMoney(new BigNumber(liquidityTokenRate).shiftedBy(poolToken?.decimals || 0), formatOpts)}
          </KeyValueDisplay>

          <Divider className={classes.divider} />

          <Box display="flex" justifyContent="space-between">
            <SlippageField label="Set Limit Transaction Slippage" />
            <ExpiryField />
          </Box>
        </ContrastBox>
      )}
    </Box>
  );
};

export default PoolWithdraw;
