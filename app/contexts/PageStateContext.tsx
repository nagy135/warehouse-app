import React, { createContext, Reducer, useContext, useReducer } from 'react';
import { ProductSkuVariant, ProductStorage } from '~/lib/types';

export type ProductSkuVariantWithCount = ProductSkuVariant & {
  count?: number;
};

type PagesStateContextState = {
  scannedProductSkuVariants: ProductSkuVariantWithCount[];
  productStorages: ProductStorage[];
  selectedPartner: number | null;
  selectedDelivery: number | null;
};

export enum PagesStateActions {
  SET_PRODUCT_STORAGES,
  SET_PRODUCT_SKU_VARIANT,
  SET_PRODUCT_SKU_VARIANTS,
  CLEAR_SKU,
  SET_SELECTED_PARTNER,
  SET_SELECTED_DELIVERY,
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

interface SetSelectedPartner {
  type: PagesStateActions.SET_SELECTED_PARTNER;
  value: number | null;
}

interface SetSelectedDelivery {
  type: PagesStateActions.SET_SELECTED_DELIVERY;
  value: number | null;
}

interface ClearSku {
  type: PagesStateActions.CLEAR_SKU;
}

type Actions = SetSku | ClearSku | SetSkus | SetProductStorages | SetSelectedPartner | SetSelectedDelivery;

const initialState: PagesStateContextState = {
  scannedProductSkuVariants: [],
  productStorages: [],
  selectedPartner: null,
  selectedDelivery: null,
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
    case PagesStateActions.SET_SELECTED_PARTNER:
      return {
        ...state,
        selectedPartner: action.value,
      };
    case PagesStateActions.SET_SELECTED_DELIVERY:
      return {
        ...state,
        selectedDelivery: action.value,
      };
    default:
      return state;
  }
};

const PagesStateContext = createContext<{
  state: PagesStateContextState;
  dispatch: React.Dispatch<Actions>;
}>({ state: initialState, dispatch: () => null });

const PageStateProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
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
