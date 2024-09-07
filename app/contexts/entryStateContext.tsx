import React, { createContext, Reducer, useContext, useReducer } from "react";
import { ProductSkuVariant } from "~/lib/types";

export type ProductSkuVariantWithCount = ProductSkuVariant & {
  count?: number;
};

type EntriesStateContextState = {
  scannedProductSkuVariants: ProductSkuVariantWithCount[];
};

export enum EntryStateActions {
  SET_PRODUCT_SKU_VARIANT,
  SET_PRODUCT_SKU_VARIANTS,
  CLEAR_SKU,
}

interface SetSku {
  type: EntryStateActions.SET_PRODUCT_SKU_VARIANT;
  value: ProductSkuVariantWithCount;
}

interface SetSkus {
  type: EntryStateActions.SET_PRODUCT_SKU_VARIANTS;
  value: ProductSkuVariantWithCount[];
}

interface ClearSku {
  type: EntryStateActions.CLEAR_SKU;
}

type Actions = SetSku | ClearSku | SetSkus;

const initialState: EntriesStateContextState = {
  scannedProductSkuVariants: [],
};

const reducer = (state: EntriesStateContextState, action: Actions) => {
  switch (action.type) {
    case EntryStateActions.SET_PRODUCT_SKU_VARIANT:
      return {
        ...state,
        scannedProductSkuVariants: [
          ...state.scannedProductSkuVariants,
          action.value,
        ],
      };
    case EntryStateActions.SET_PRODUCT_SKU_VARIANTS:
      return {
        ...state,
        scannedProductSkuVariants: [
          ...state.scannedProductSkuVariants,
          ...action.value,
        ],
      };
    case EntryStateActions.CLEAR_SKU:
      return {
        ...state,
        scannedProductSkuVariants: [],
      };
    default:
      return state;
  }
};

const EntryStateContext = createContext<{
  state: EntriesStateContextState;
  dispatch: React.Dispatch<Actions>;
}>({ state: initialState, dispatch: () => null });

const EntryStateProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer<
    Reducer<EntriesStateContextState, Actions>
  >(reducer, initialState);
  return (
    <EntryStateContext.Provider value={{ state, dispatch }}>
      {children}
    </EntryStateContext.Provider>
  );
};

const useEntryStateContext = () => useContext(EntryStateContext);

export { useEntryStateContext, EntryStateProvider };
