import { useIsFocused } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import ReturnOrClaimModal from "~/components/modal/return-or-claim-modal";
import PackageList from "~/components/package-list";
import Scanner from "~/components/scanner";
import { Text } from '~/components/ui/text';
import useFindExitByTrackingNumber from "~/lib/hooks/api/use-find-exit-by-tracking-number";
import useNotificationModal from "~/lib/hooks/use-notification-modal";
import { ExitWithPackages } from "~/lib/types";

export default function MovePage() {
  const { t } = useTranslation()
  const isFocused = useIsFocused();
  const [exit, setExit] = useState<ExitWithPackages>()
  const [openReturnOrClaimModal, setOpenReturnOrClaimModal] = useState(false)
  const [type, setType] = useState<'claim' | 'return' | undefined>()
  const [scannedTrackingNumbers, setScannedTrackingNumbers] = useState(new Set<string>())
  const { mutateAsync: findExitByTrackingNumber } = useFindExitByTrackingNumber()

  const { modal: PackageNotFoundModal, setOpen: openPackageNotFoundModal } = useNotificationModal({
    variant: 'danger',
    title: t('return-detail.error'),
    description: t('return-detail.error-package-not-found'),
  })
  return (
    <>
      {exit ? <View className="h-full px-2 container">
        {type && <Text className="font-bold text-xl text-center mt-2">{type === "claim" ? t('return-detail.claim') : t('return-detail.return')}: {exit.name}</Text>}
        <PackageList data={exit?.packages} scannedTrackingNumbers={scannedTrackingNumbers} />
        <ReturnOrClaimModal
          open={openReturnOrClaimModal}
          onConfirm={(selectedType) => {
            setType(selectedType)
            setOpenReturnOrClaimModal(false)
          }}
          title="Výdaj nájdeny"
          description={
            <Text>
              <Text>Názov výdaja: <Text className="font-bold">{exit.name}</Text></Text>{"\n"}
              <Text>Počet balíkov: <Text className="font-bold">{exit.packages?.length}</Text></Text>
            </Text>
          }
        />
      </View > : <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
        <View className="flex-1 justify-center w-full gap-5 p-3">
          {isFocused && <Scanner
            label={t('return-detail.scan-package')}
            variant="secondary"
            mockData="96505600117628"
            onScan={(trackingNumber) => {
              findExitByTrackingNumber({ trackingNumber }).then((resp) => {
                setOpenReturnOrClaimModal(true)
                scannedTrackingNumbers.add(trackingNumber)
                setExit(resp.exit)
              }).catch(() => { openPackageNotFoundModal() })
            }}
          />}
          {PackageNotFoundModal}
        </View>
      </View>
      }
    </>
  );
}
