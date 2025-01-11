import { Button, ButtonProps } from './ui/button';
import { Text } from './ui/text';
import useScanner from '~/lib/hooks/use-scanner';

export default function Scanner({
  size = 'lg',
  label = '',
  variant = 'default',
  onScan,
  mockData,
}: {
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  label?: string;
  mockData?: string;
  onScan?: (data: string, label: string) => void;
}) {
  const { startScan, scanning } = useScanner({ onScan, mockData });

  return (
    <>
      {process.env.EXPO_PUBLIC_MOCK_SCANNER === 'true' ? (
        <Button onPress={() => startScan()} size={size} variant={variant}>
          <Text className="text-2xl font-bold">
            {scanning ? '...' : `${label}`}
          </Text>
        </Button>
      ) : (
        <Text className="text-center text-2xl font-bold">
          {scanning ? '...' : `${label}`}
        </Text>
      )}
    </>
  );
}
