import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Entry, type ToStringOrStringArray } from "~/lib/types";
import Scanner from "~/components/scanner";
import ConfirmationModal from "~/components/confirmation-modal";
import useRecordDetail from "~/lib/hooks/api/use-record-detail";
import { useState } from "react";
import ProductStorageList from "~/components/product-storage-list";
import CountModal from "~/components/count-modal";

export default function DetailPage() {
  const entry = useLocalSearchParams<ToStringOrStringArray<Entry>>();
  const { data, isLoading } = useRecordDetail<Entry>(Number(entry.id), "entry");
  const [selectedStorage, setSelectedStorage] = useState<number | null>(null);
  const [countModalOpen, setCountModalOpen] = useState(false);
  return (
    <View className="h-full px-2 container">
      <View className="m-2 flex flex-row gap-3">
        <Scanner label="What" onScan={() => setCountModalOpen(true)} />
        <Scanner
          label="Where"
          variant="secondary"
          onScan={(_data) => {
            setSelectedStorage(Math.floor(Math.random() * 100));
          }}
        />
        <ConfirmationModal
          buttonTitle="Save"
          onConfirm={() => console.log("confirmed!")}
        />
      </View>
      {selectedStorage && (
        <View>
          <Text>Selected storage: {selectedStorage}</Text>
        </View>
      )}
      {!isLoading && data?.productStorages && (
        <ProductStorageList data={data.productStorages} />
      )}
      <CountModal
        open={countModalOpen}
        setClose={() => setCountModalOpen(false)}
        onConfirm={(count) => {
          console.log(count);
          setCountModalOpen(false);
        }}
      />
    </View>
  );
}
