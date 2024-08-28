import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import ExitCard from "~/components/exit/card";
import RedirectModal from "~/components/modal/redirect-modal";
import Scanner from "~/components/scanner";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import useGetRecords from "~/lib/hooks/api/use-get-records";
import useNotificationModal from "~/lib/hooks/use-notification-modal";
import { Exit } from "~/lib/types";

export default function ExitsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [foundExit, setFoundExit] = useState<Exit | null>(null);
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const { setOpen: notificationModalOpen, modal: notificationModal } =
    useNotificationModal({
      title: "Not found",
      description: "Exit not found",
    });

  const {
    data: exits,
    isWaiting,
    isLoading,
    error,
    refreshing,
    onRefresh,
  } = useGetRecords<Exit>("exits", searchValue);
  if (error) return <Text>error</Text>;

  return (
    <>
      <View className="m-3">
        <View className="flex-row gap-3">
          <Input
            className="flex-1"
            placeholder="Search by name..."
            value={searchValue}
            onChangeText={setSearchValue}
          />
          <View className="w-1/3 py-1">
            <Scanner
              size={"sm"}
              onScan={(data) => {
                const foundExit = exits?.find(
                  (exit: Exit) => exit.sku === data
                );
                if (foundExit) {
                  setFoundExit(foundExit);
                  setRedirectModalOpen(true);
                } else {
                  notificationModalOpen();
                }
              }}
            />
          </View>
        </View>
        <ScrollView
          className="flex"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {exits?.map((exit: Exit, i: number) => (
            <View key={`exit-card-${i}`} className="my-1">
              <ExitCard exit={exit} />
            </View>
          ))}
        </ScrollView>
      </View>
      {(isWaiting || isLoading) && (
        <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
          <ActivityIndicator size={60} color="#666666" />
        </View>
      )}
      {notificationModal}
      <RedirectModal
        open={redirectModalOpen}
        title="Redirect to exit"
        description={
          <>
            <View>
              <Text>{"Are you sure you want to redirect to: "}</Text>
            </View>
            <View>
              <Text className="font-bold">{foundExit?.name ?? "-"}</Text>
            </View>
          </>
        }
        hrefObject={{
          pathname: "./exit-detail",
          /* @ts-ignore */
          params: foundExit,
        }}
        setClose={() => setRedirectModalOpen(false)}
      />
    </>
  );
}
