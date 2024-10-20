import React, { createContext, Reducer, useContext, useReducer } from "react";
import { ProductSkuVariant, ProductStorage } from "~/lib/types";

export type ProductSkuVariantWithCount = ProductSkuVariant & {
  count?: number;
};

type PagesStateContextState = {
  scannedProductSkuVariants: ProductSkuVariantWithCount[];
  productStorages: ProductStorage[];
};

export enum PagesStateActions {
  SET_PRODUCT_STORAGES,
  SET_PRODUCT_SKU_VARIANT,
  SET_PRODUCT_SKU_VARIANTS,
  CLEAR_SKU,
}

interface SetSku {
  type: PagesStateActions.SET_PRODUCT_SKU_VARIANT;
  value: ProductSkuVariantWithCount;
}

interface SetSkus {
  type: PagesStateActions.SET_PRODUCT_SKU_VARIANTS;
  value: ProductSkuVariantWithCount[];
}

interface SetProductStorages {
  type: PagesStateActions.SET_PRODUCT_STORAGES;
  value: ProductStorage[];
}

interface ClearSku {
  type: PagesStateActions.CLEAR_SKU;
}

type Actions = SetSku | ClearSku | SetSkus | SetProductStorages;

const initialState: PagesStateContextState = {
  scannedProductSkuVariants: [],
  productStorages: [],
};

const reducer = (state: PagesStateContextState, action: Actions) => {
  switch (action.type) {
    case PagesStateActions.SET_PRODUCT_SKU_VARIANT:
      return {
        ...state,
        scannedProductSkuVariants: [
          ...state.scannedProductSkuVariants,
          action.value,
        ],
      };
    case PagesStateActions.SET_PRODUCT_SKU_VARIANTS:
      return {
        ...state,
        scannedProductSkuVariants: [
          ...state.scannedProductSkuVariants,
          ...action.value,
        ],
      };
    case PagesStateActions.SET_PRODUCT_SKU_VARIANTS:
      return {
        ...state,
        scannedProductSkuVariants: [
          ...state.scannedProductSkuVariants,
          ...action.value,
        ],
      };
    case PagesStateActions.CLEAR_SKU:
      return {
        ...state,
        scannedProductSkuVariants: [],
      };
    case PagesStateActions.SET_PRODUCT_STORAGES:
      return {
        ...state,
        productStorages: action.value,
      };
    default:
      return state;
  }
};

const PagesStateContext = createContext<{
  state: PagesStateContextState;
  dispatch: React.Dispatch<Actions>;
}>({ state: initialState, dispatch: () => null });

const PageStateProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer<
    Reducer<PagesStateContextState, Actions>
  >(reducer, initialState);
  return (
    <PagesStateContext.Provider value={{ state, dispatch }}>
      {children}
    </PagesStateContext.Provider>
  );
};

const usePageStateContext = () => useContext(PagesStateContext);

export { usePageStateContext, PageStateProvider };
