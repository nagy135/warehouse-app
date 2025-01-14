import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ScanPackage from '~/components/claim/scan-package';
import ScanPackages from '~/components/claim/scan-packages';
import ScanProducts from '~/components/claim/scan-products';
import { Text } from '~/components/ui/text';
import useNotificationModal from '~/lib/hooks/use-notification-modal';
import { EntryExitStatesEnum, ExitWithPackages } from '~/lib/types';

export enum ClaimStepEnum {
  SCAN_PACKAGE = 'SCAN_PACKAGE',
  SCAN_PACKAGES = 'SCAN_PACKAGES',
  SCAN_PRODUCTS = 'SCAN_PRODUCTS',
}

export type ClaimType = 'claim' | 'return' | undefined;

export default function ReturnPage() {
  const { t } = useTranslation();
  const [exit, setExit] = useState<ExitWithPackages>();
  const [openReturnOrClaimModal, setOpenReturnOrClaimModal] = useState(false);
  const [type, setType] = useState<ClaimType>();
  const [scannedTrackingNumbers, setScannedTrackingNumbers] = useState(
    new Set<string>(),
  );

  const [step, setStep] = useState<ClaimStepEnum>(ClaimStepEnum.SCAN_PACKAGE);

  const { modal: PackageNotFoundModal, setOpen: openPackageNotFoundModal } =
    useNotificationModal({
      variant: 'danger',
      title: t('return-detail.error'),
      description: exit ? (
        <Text>
          {t('return-detail.error-package-not-found-in-exit')}
          {'\n'}
          <Text className="font-bold">{exit.name}</Text>
        </Text>
      ) : (
        t('return-detail.error-package-not-found')
      ),
    });

  const {
    modal: ExitAlreadyClaimedOrReturned,
    setOpen: openExitAlreadyClaimedOrReturned,
  } = useNotificationModal({
    variant: 'danger',
    title: t('return-detail.error'),
    description:
      exit?.state === EntryExitStatesEnum.CLAIMED
        ? t('return-detail.error-exit-already-claimed')
        : t('return-detail.error-exit-already-returned'),
    onClose: () => setStep(ClaimStepEnum.SCAN_PACKAGE),
  });

  const addTrackingNumber = (trackingNumber: string) => {
    setScannedTrackingNumbers((prev) => {
      const newSet = new Set(prev);
      newSet.add(trackingNumber);
      return newSet;
    });
  };

  useEffect(() => {
    if (exit && scannedTrackingNumbers.size === exit.packages?.length) {
      setStep(ClaimStepEnum.SCAN_PRODUCTS);
    }
  }, [scannedTrackingNumbers]);

  useEffect(() => {
    if (
      exit?.state === EntryExitStatesEnum.CLAIMED ||
      exit?.state === EntryExitStatesEnum.RETURNED
    ) {
      openExitAlreadyClaimedOrReturned();
    }
  }, [exit]);

  const componentForStep = () => {
    switch (step) {
      case ClaimStepEnum.SCAN_PACKAGE:
        return (
          <ScanPackage
            addTrackingNumber={addTrackingNumber}
            openPackageNotFoundModal={openPackageNotFoundModal}
            setExit={setExit}
            setOpenReturnOrClaimModal={setOpenReturnOrClaimModal}
            setStep={setStep}
          />
        );
      case ClaimStepEnum.SCAN_PACKAGES:
        return (
          exit && (
            <ScanPackages
              addTrackingNumber={addTrackingNumber}
              openPackageNotFoundModal={openPackageNotFoundModal}
              setOpenReturnOrClaimModal={setOpenReturnOrClaimModal}
              openReturnOrClaimModal={openReturnOrClaimModal}
              scannedTrackingNumbers={scannedTrackingNumbers}
              setType={setType}
              type={type}
              exit={exit}
            />
          )
        );
      case ClaimStepEnum.SCAN_PRODUCTS:
        return exit && <ScanProducts type={type} exit={exit} />;
    }
  };

  return (
    <>
      {componentForStep()}
      {PackageNotFoundModal}
      {ExitAlreadyClaimedOrReturned}
    </>
  );
}
