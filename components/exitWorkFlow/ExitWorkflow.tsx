import React, { useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { Input } from '~/components/ui/input';
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import Scanner from "~/components/scanner";
import { useIsFocused } from "@react-navigation/native";
import { ProductPositionList } from "~/lib/exitDetailUtils";
import { useTranslation } from "react-i18next";
import { Box } from "~/lib/icons/Box";

type Props = { items: ProductPositionList };

type Step =
  | "position"
  | "storage"
  | "box"
  | "product"
  | "quantity"
  | "rescanStorageToFinish";

export default function ExitWorkflow({ items }: Props) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>("position");
  const [scannedBox, setScannedBox] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState<string>("");
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [error, setError] = useState<string>("");
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const current = items[index];

  const remainingIds = useMemo(() => {
    if (!current) return [];
    const used = new Set(usedIds);
    return current.productStoragesId.filter(id => !used.has(id));
  }, [current, usedIds]);

  const remainingCount = remainingIds.length;

  if (!current) {
    return (
      <View className="p-4">
        <Text>Hotovo 🎉 — prešli ste celý zoznam.</Text>
      </View>
    );
  }

  function goNextItem() {
    setIndex(i => i + 1);
    setStep("position");
    setScannedBox("");
    setQuantityInput("");
    setUsedIds([]);
    setError("");
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
    setScannedBox(scan);
    setStep("product");
    setError("");
  }

  function handleScanProduct(scan: string) {
    if (scan === current.product.sku || scan === current.product.ean) {
      setStep("quantity");
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

    // TODO: API volanie
    console.log("[PARTIAL_MOVE]", {
      transportBox: scannedBox,
      productId: current.product.id,
      productName: current.product.name,
      fromStorage: current.storage,
      fromPosition: current.position,
      count: take,
      productStoragesId: chosenIds,
    });

    setUsedIds(prev => [...prev, ...chosenIds]);
    setQuantityInput("");
    setError("");

    if (remainingCount - take > 0) {
      setStep("box");
    } else {
      setStep("rescanStorageToFinish");
    }
  }

  function handleRescanStorageToFinish(scan: string) {
    if (scan === current.storage.sku) {
      console.log("[ITEM_DONE]", {
        productId: current.product.id,
        productName: current.product.name,
        totalMoved: usedIds.length,
      });
      goNextItem();
    } else {
      setError("Nesprávne úložisko");
    }
  }

  return (
    <View className={`flex-1 ${isLandscape ? "p-2" : "p-4"}`}>
      <View className={isLandscape ? "mb-2" : "mb-4"}>
        <Text className="text-lg font-bold text-center">
          {index + 1} / {items.length} — {current.product.name} ({current.productStoragesId.length} ks)
        </Text>
      </View>

      {error ? (
        <View className="mb-4 bg-red-100 p-2 rounded">
          <Text className="text-red-600 font-bold text-center">{error}</Text>
        </View>
      ) : null}

      <View className="flex-1 items-center justify-center">
        {step === "position" && (
          <>
            <View className={isLandscape ? "flex-row items-center justify-center gap-4 mb-4" : "mb-4"}>
              <Text className="text-center text-2xl">Oskenuj pozíciu</Text>
              <Text className="font-bold text-center text-2xl">{current.position.name}</Text>
            </View>

            {isFocused && <Scanner label="Oskenuj pozíciu" onScan={handleScanPosition} />}
          </>
        )}

        {step === "storage" && (
          <>
            <View className={isLandscape ? "flex-row items-center justify-center gap-4 mb-4" : "mb-4"}>
              <Text className="text-center text-2xl">Oskenuj úložisko</Text>
              <Text className="font-bold text-center text-2xl">{current.storage.name}</Text>
            </View>
            {isFocused && <Scanner label="Oskenuj úložisko" onScan={handleScanStorage} />}
          </>
        )}

        {step === "box" && (
          <View>
            <Text className="mb-1 text-center text-2xl">Oskenuj prenosný box</Text>
            {isFocused && <Scanner label="Oskenuj prenosný box" onScan={handleScanBox} />}
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
            {isFocused && <Scanner label="Oskenuj produkt" onScan={handleScanProduct} />}
          </View>
        )}

        {step === "quantity" && (
          <View>
            <Text className="mb-2">Zadaj počet (zostáva {remainingCount} ks)</Text>
            <Input
              className="border border-neutral-300 rounded-lg p-2 mb-3"
              keyboardType="numeric"
              value={quantityInput}
              onChangeText={setQuantityInput}
              placeholder="Počet ks"
              autoFocus={true}
            />
            <Button onPress={submitPartialMove}><Text>Potvrdiť</Text></Button>
          </View>
        )}

        {step === "rescanStorageToFinish" && (
          <View>
            <View className={isLandscape ? "flex-row items-center justify-center gap-2 mb-4" : "mb-4"}>
              <Text className="text-center text-2xl">Oskenuj pôvodné úložisko:</Text>
              <Text className="font-bold text-center text-2xl">{current.storage.name}</Text>
            </View>
            {isFocused && <Scanner
              label="Oskenuj pôvodné úložisko"
              onScan={handleRescanStorageToFinish}
            />}
          </View>
        )}
      </View>
    </View>
  );
}
