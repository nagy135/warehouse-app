import { useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ButtonProps, useWindowDimensions, View } from "react-native";
import Scanner from "~/components/scanner";
import { Button } from "~/components/ui/button";
import { Input } from '~/components/ui/input';
import { Text } from "~/components/ui/text";
import { ProductPositionList } from "~/lib/exitDetailUtils";
import useMoveProductStorage from "~/lib/hooks/api/use-change-product-storage-state";
import useCheckStorageExits from '~/lib/hooks/api/use-check-storage-exits';
import { Box } from "~/lib/icons/Box";

type Props = { items: ProductPositionList, exitId: number, partnerId: number, refetchExit: () => void, isRefetching: boolean };

type Step =
  | "position"
  | "storage"
  | "box"
  | "product"
  | "quantity"
  | "rescanStorageToFinish";

export default function ExitWorkflow({ items, exitId, partnerId, refetchExit, isRefetching }: Props) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>("position");
  const [scannedBox, setScannedBox] = useState<number | null>(null);
  const [quantityInput, setQuantityInput] = useState<string>("");
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDone, setIsDone] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { mutateAsync: mutateCheckStorageExits } = useCheckStorageExits();
  const { mutateAsync: mutateMoveProductStorage } = useMoveProductStorage();
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  useEffect(() => {
    setIndex(0);
    setStep("position");
    setScannedBox(null);
    setQuantityInput("");
    setUsedIds([]);
    setError("");
  }, [items]);

  const current = items[index];

  const remainingIds = useMemo(() => {
    if (!current) return [];
    const used = new Set(usedIds);
    return current.productStoragesId.filter(id => !used.has(id));
  }, [current, usedIds]);

  const remainingCount = remainingIds.length;

  // Safety check: if current item is undefined, show loading state
  if (!current) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size={60} color="#666666" />
      </View>
    );
  }

  function goNextItem() {
    if (index + 1 >= items.length) {
      setIsDone(true);
      queryClient.invalidateQueries({ queryKey: ["exits"] });
      setTimeout(() => {
        router.replace("/logged-in/exits-index");
      }, 800);
    } else {
      refetchExit();
    }
  }

  function takeFirstN(n: number): number[] {
    return remainingIds.slice(0, n);
  }


  function handleScanPosition(scan: string) {
    if (scan === current.position.sku) {
      setStep("storage");
      setError("");
    } else {
      setError("Nesprávna pozícia!");
    }
  }

  function handleScanStorage(scan: string) {
    if (scan === current.storage.sku) {
      setStep("box");
      setError("");
    } else {
      setError("Nesprávne úložisko!");
    }
  }

  function handleScanBox(scan: string) {
    setIsLoading(true);
    mutateCheckStorageExits({ sku: scan })
      .then((data) => {
        setScannedBox(data.id);
        setStep("product");
        setError("");
      })
      .catch(() => {
        setError("Prenosný box nebol nájdený!");
      }).finally(() => {
        setIsLoading(false);
      });
  }

  function handleScanProduct(scan: string) {
    if (scan === current.product.sku || scan === current.product.ean) {
      setStep("quantity");
      setQuantityInput(remainingCount.toString());
      setError("");
    } else {
      setError("Nesprávny produkt!");
    }
  }

  function submitPartialMove() {
    const qty = Math.max(0, Math.floor(Number(quantityInput) || 0));
    if (!qty) {
      setError("Zadajte platné množstvo");
      return;
    }
    if (qty > remainingCount) {
      setError("Zadané množstvo je väčšie ako počet zostávajúcich produktov");
      return;
    }

    const take = Math.min(qty, remainingCount);
    const chosenIds = takeFirstN(take);

    if (!scannedBox) {
      setError("Prenosný box nebol nájdený!");
      return;
    }

    setIsLoading(true);
    mutateMoveProductStorage({ ids: chosenIds, storageId: scannedBox, exitId: exitId, partnerId: partnerId, productId: current.product.id }).then(() => {
      setUsedIds(prev => [...prev, ...chosenIds]);
      setQuantityInput("");
      setError("");

      if (remainingCount - take > 0) {
        setStep("box");
      } else {
        setStep("rescanStorageToFinish");
      }
    }).catch(() => {
      setError("Prenos produktov do prenosného boxu sa nepodaril!");
    }).finally(() => {
      setIsLoading(false);
    });
  }

  function handleRescanStorageToFinish(scan: string) {
    if (scan === current.storage.sku) {
      goNextItem();
    } else {
      setError("Nesprávne úložisko");
    }
  }

  return (
    <View className={`flex-1 ${isLandscape ? "p-2" : "p-4"}`}>
      <View className={isLandscape ? "mb-2" : "mb-4"}>
        <Text className="text-lg font-bold text-center">
          {current.product.name} ({current.productStoragesId.length} ks)
        </Text>
      </View>

      {error ? (
        <View className="mb-4 bg-red-100 p-2 rounded">
          <Text className="text-red-600 font-bold text-center">{error}</Text>
        </View>
      ) : null}

      {isDone && (
        <View className="mb-4 bg-green-100 p-2 rounded">
          <Text className="text-green-600 font-bold text-center">{t('exit-detail.exit-successful')}</Text>
        </View>
      )}

      {(isLoading || isRefetching) && (
        <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center">
          <ActivityIndicator size={60} color="#666666" />
        </View>
      )}

      <View className="flex-1 items-center justify-center">
        {step === "position" && (
          <>
            <View className={isLandscape ? "flex-row items-center justify-center gap-4 mb-4" : "mb-4"}>
              <Text className="text-center text-2xl">Oskenuj pozíciu</Text>
              <Text className="font-bold text-center text-2xl">{current.position.name}</Text>
            </View>

            {isFocused && <Scanner label={process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true' ? "Oskenuj pozíciu" : ''} onScan={handleScanPosition} />}
          </>
        )}

        {step === "storage" && (
          <>
            <View className={isLandscape ? "flex-row items-center justify-center gap-4 mb-4" : "mb-4"}>
              <Text className="text-center text-2xl">Oskenuj úložisko</Text>
              <Text className="font-bold text-center text-2xl">{current.storage.name}</Text>
            </View>
            {isFocused && <Scanner label={process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true' ? "Oskenuj úložisko" : ''} onScan={handleScanStorage} />}
          </>
        )}

        {step === "box" && (
          <View>
            <Text className="mb-1 text-center text-2xl">Oskenuj prenosný box</Text>
            {isFocused && <Scanner label={process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true' ? "Oskenuj prenosný box" : ''} onScan={handleScanBox} />}
            <View className="mt-4">
              <Text>Počet zostávajúcich produktov: {remainingCount}</Text>
            </View>
          </View>
        )}

        {step === "product" && (
          <View>
            <Text className="mb-1 text-center text-2xl">Oskenuj produkt</Text>
            {current.product.isBox && (
              <View className="flex-row items-center justify-center mt-2">
                <Box size={20} strokeWidth={1.25} className="text-foreground mr-1 bg-sky-200" />
                <Text className="text-sm text-center">Kartónové balenie</Text>
              </View>
            )}
            <View className={isLandscape ? "flex-row items-center justify-center gap-4 mb-2" : "mb-3"}>
              <Text className="font-bold text-center mb-2 text-xl">{current.product.name}</Text>
              <Text className="text-center text-sm">
                sku: <Text className="font-bold">{current.product.sku}</Text> | ean:{" "}
                <Text className="font-bold">{current.product.ean}</Text>
              </Text>
            </View>
            {current.product.expirations.length > 0 && (
              <Text className="text-center mb-4">
                Expirácie:{" "}
                {current.product.expirations
                  .map((e) => `${t('date', { date: new Date(e.value) })} (${e.count} ks)`)
                  .join(", ")}
              </Text>
            )}
            {isFocused && <Scanner label={process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true' ? "Oskenuj produkt" : ''} onScan={handleScanProduct} />}
          </View>
        )}

        {step === "quantity" && (
          <View
            className={
              isLandscape
                ? "flex-row items-center justify-center gap-4"
                : ""
            }
          >
            <Text className={isLandscape ? "mb-0 mr-2" : "mb-2"}>
              Zadaj počet (zostáva {remainingCount} ks)
            </Text>
            <Input
              className={`border border-neutral-300 rounded-lg p-2 flex-1 max-w-[100px] ${isLandscape ? "mb-0" : "mb-3"}`}
              keyboardType="numeric"
              value={quantityInput}
              onChangeText={setQuantityInput}
              placeholder="Počet ks"
            />
            <Button onPress={submitPartialMove} className="w-1/3">
              <Text>Potvrdiť</Text>
            </Button>
          </View>
        )}

        {step === "rescanStorageToFinish" && (
          <View>
            <View className={isLandscape ? "flex-row items-center justify-center gap-2 mb-4" : "mb-4"}>
              <Text className="text-center text-2xl">Oskenuj pôvodné úložisko:</Text>
              <Text className="font-bold text-center text-2xl">{current.storage.name}</Text>
            </View>
            {isFocused && <Scanner
              label={process.env.EXPO_PUBLIC_MOCK_SCANNER == 'true' ? "Oskenuj pôvodné úložisko" : ''}
              onScan={handleRescanStorageToFinish}
            />}
          </View>
        )}
      </View>
    </View>
  );
}
