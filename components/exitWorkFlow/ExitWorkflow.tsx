import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { Input } from '~/components/ui/input';
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import Scanner from "~/components/scanner";
import { useIsFocused } from "@react-navigation/native";
import { ProductPositionList } from "~/lib/exitDetailUtils";
import { useTranslation } from "react-i18next";
import { ProductBoxSign } from "../product-box-sign";
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
  const isFocused = useIsFocused();
  const { t } = useTranslation();

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
  }

  function takeFirstN(n: number): number[] {
    return remainingIds.slice(0, n);
  }

  // --- handlery krokov ---

  function handleScanPosition(scan: string) {
    setStep("storage");
    return;
    if (scan === current.position.sku) {
      setStep("storage");
    } else {
      console.log("zla pozicia");
    }
  }

  function handleScanStorage(scan: string) {
    setStep("box");
    return;
    if (scan === current.storage.sku) {
      setStep("box");
    } else {
      console.log("zle ulozisko");
    }
  }

  function handleScanBox(scan: string) {
    setScannedBox(scan);
    setStep("product");
  }

  function handleScanProduct(scan: string) {
    setStep("quantity");
    return;
    if (scan === current.product.sku) {
      setStep("quantity");
    } else {
      console.log("zly produkt");
    }
  }

  function submitPartialMove() {
    const qty = Math.max(0, Math.floor(Number(quantityInput) || 0));
    if (!qty) return;

    const take = Math.min(qty, remainingCount);
    const chosenIds = takeFirstN(take);

    // TODO: tu bude volanie endpointu (zatím len log)
    console.log("[PARTIAL_MOVE]", {
      transportBox: scannedBox,
      productId: current.product.id,
      productName: current.product.name,
      fromStorage: current.storage,
      fromPosition: current.position,
      count: take,
      productStoragesId: chosenIds,
    });

    // označiť použité PS id
    setUsedIds(prev => [...prev, ...chosenIds]);

    setQuantityInput("");

    // ak ešte ostáva niečo naložiť -> späť na sken boxu
    if (remainingCount - take > 0) {
      setStep("box");
    } else {
      // všetko hotovo -> potvrď rescanom pôvodného úložiska
      setStep("rescanStorageToFinish");
    }
  }

  function handleRescanStorageToFinish(scan: string) {
    console.log("[ITEM_DONE]", {
      productId: current.product.id,
      productName: current.product.name,
      totalMoved: usedIds.length,
    });
    goNextItem();
    return;
    if (scan === current.storage.sku) {
      // TODO: tu môže byť finálne potvrdenie itemu na backende
      console.log("[ITEM_DONE]", {
        productId: current.product.id,
        productName: current.product.name,
        totalMoved: usedIds.length,
      });
      goNextItem();
    } else {
      console.log("zle ulozisko (finish)");
    }
  }

  return (
    <View className="flex-1 p-4">
      <View className="mb-4">
        <Text className="text-lg font-bold text-center">
          {index + 1} / {items.length} — {current.product.name} ({current.productStoragesId.length} ks)
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        {step === "position" && (
          <View>
            <Text className="mb-1 text-center text-2xl">Oskenuj pozíciu</Text>
            <Text className="font-bold mb-3 text-center mb-4 text-2xl">{current.position.name}</Text>
            {isFocused && <Scanner label="Oskenuj pozíciu" onScan={handleScanPosition} />}
          </View>
        )}

        {step === "storage" && (
          <View>
            <Text className="mb-1 text-center text-2xl">Oskenuj úložisko</Text>
            <Text className="font-bold mb-3 text-center mb-4 text-2xl">{current.storage.name}</Text>
            {isFocused && <Scanner label="Oskenuj úložisko" onScan={handleScanStorage} />}
          </View>
        )}

        {step === "box" && (
          <View>
            <Text className="mb-1 text-center text-2xl">Oskenuj transport box</Text>
            {isFocused && <Scanner label="Oskenuj transport box" onScan={handleScanBox} />}
            <View className="mt-4">
              <Text>Zostáva naložiť: {remainingCount}</Text>
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
            <Text className="font-bold mb-3 text-center mb-2">{current.product.name}</Text>
            <Text className="text-center mb-1 text-sm">sku: <Text className="font-bold">{current.product.sku}</Text> | ean: <Text className="font-bold">{current.product.ean}</Text></Text>
            {current.product.expirations.length > 0 && (
              <Text className="text-center mb-4 text-sm">
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
            <Text className="mb-2">Zadaj počet</Text>
            <Text className="mb-1">Zostáva: {remainingCount}</Text>
            <Input
              className="border border-neutral-300 rounded-lg p-2 mb-3"
              keyboardType="numeric"
              value={quantityInput}
              onChangeText={setQuantityInput}
              placeholder="Počet ks"
              autoFocus={true}
            />
            <View className="flex-row gap-2">
              <Button onPress={submitPartialMove}><Text>Potvrdiť</Text></Button>
              <Button onPress={() => { setQuantityInput(""); setStep("box"); }}>
                <Text>Späť</Text>
              </Button>
            </View>
          </View>
        )}

        {step === "rescanStorageToFinish" && (
          <View>
            <Text className="mb-1 text-center text-2xl">
              Pre potvrdenie oskenuj pôvodné úložisko:
            </Text>
            <Text className="font-bold mb-3 text-center mb-4 text-2xl">{current.storage.name}</Text>
            {isFocused && <Scanner
              label="Oskenuj úložisko na dokončenie"
              onScan={handleRescanStorageToFinish}
            />}
          </View>
        )}
      </View>
    </View>
  );
}
