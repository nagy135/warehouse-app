import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ClaimStepEnum } from '~/app/logged-in/return-index';
import Scanner from '~/components/scanner';
import useFindExitByTrackingNumber from '~/lib/hooks/api/use-find-exit-by-tracking-number';
import { ExitWithPackages } from '~/lib/types';
import { exitMock } from './data';

export default function ScanPackage({
  addTrackingNumber,
  setStep,
  setExit,
  openPackageNotFoundModal,
  setOpenReturnOrClaimModal,
}: {
  addTrackingNumber: (trackingNumber: string) => void;
  setStep: (step: ClaimStepEnum) => void;
  setExit: (exit: ExitWithPackages) => void;
  openPackageNotFoundModal: () => void;
  setOpenReturnOrClaimModal: (val: true) => void;
}) {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { mutateAsync: findExitByTrackingNumber } =
    useFindExitByTrackingNumber();

  return (
    <View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
      <View className="w-full flex-1 justify-center gap-5 p-3">
        {isFocused && (
          <Scanner
            label={t('return-detail.scan-package')}
            mockData="96505600117628"
            onScan={(trackingNumber) => {
              findExitByTrackingNumber({ trackingNumber })
                .then((resp) => {
                  setOpenReturnOrClaimModal(true);
                  addTrackingNumber(trackingNumber);
                  // setExit(resp.exit);
                  setExit(exitMock.exit); //TODO:
                  setStep(
                    (resp.exit.packages?.length || 0) > 1
                      ? ClaimStepEnum.SCAN_PACKAGES
                      : ClaimStepEnum.SCAN_PRODUCTS,
                  );
                })
                .catch(openPackageNotFoundModal);
            }}
          />
        )}
      </View>
    </View>
  );
}
