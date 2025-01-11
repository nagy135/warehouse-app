import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ClaimType } from '~/app/logged-in/return-index';
import Scanner from '~/components/scanner';
import { Text } from '~/components/ui/text';
import { ExitWithPackages } from '~/lib/types';
import PackageList from './package-list';
import ReturnOrClaimModal from './return-or-claim-modal';

export default function ScanPackages({
  addTrackingNumber,
  openPackageNotFoundModal,
  setOpenReturnOrClaimModal,
  exit,
  type,
  scannedTrackingNumbers,
  setType,
  openReturnOrClaimModal,
}: {
  addTrackingNumber: (trackingNumber: string) => void;
  openPackageNotFoundModal: () => void;
  setOpenReturnOrClaimModal: (val: false) => void;
  exit: ExitWithPackages;
  type: ClaimType;
  scannedTrackingNumbers: Set<string>;
  setType: (val: ClaimType) => void;
  openReturnOrClaimModal: boolean;
}) {
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  return (
    <View className="container h-full px-2">
      {type && (
        <Text className="mt-2 text-center text-xl font-bold">
          {type === 'claim'
            ? t('return-detail.claim')
            : t('return-detail.return')}
          : {exit.name}
        </Text>
      )}
      {isFocused && (
        <Scanner
          label={t('return-detail.scan-next-package')}
          mockData="96505600117629"
          onScan={(trackingNumber) => {
            if (
              exit.packages?.find(
                (exitPackage) => exitPackage.trackingNumber === trackingNumber,
              )
            ) {
              addTrackingNumber(trackingNumber);
            } else {
              openPackageNotFoundModal();
            }
          }}
        />
      )}
      <PackageList
        data={exit?.packages}
        scannedTrackingNumbers={scannedTrackingNumbers}
      />
      <ReturnOrClaimModal
        open={openReturnOrClaimModal}
        onConfirm={(selectedType) => {
          setType(selectedType);
          setOpenReturnOrClaimModal(false);
        }}
        title="Výdaj nájdeny"
        description={
          <Text>
            <Text>
              {t('return-detail.exit-name')}:{' '}
              <Text className="font-bold">{exit.name}</Text>
            </Text>
            {'\n'}
            <Text>
              {t('return-detail.number-of-packages')}:{' '}
              <Text className="font-bold">{exit.packages?.length}</Text>
            </Text>
          </Text>
        }
      />
    </View>
  );
}
