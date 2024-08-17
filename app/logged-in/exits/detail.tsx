import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import ConfirmationModal from '~/components/confirmation-modal';
import Scanner from '~/components/scanner';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import useExitDetail from '~/lib/hooks/api/use-exit-detail';
import { Exit, type ToStringOrStringArray } from '~/lib/types';

export default function DetailPage() {
	const exit = useLocalSearchParams<ToStringOrStringArray<Exit>>();
	const { data, error, isLoading } = useExitDetail(Number(exit.id));
	return (
		<>
			<View className="m-2 flex-col gap-3">
				<ConfirmationModal buttonTitle="Save" onConfirm={() => console.log('confirmed!')} />
				<Card className='w-full'>
					<CardHeader>
						<CardTitle>{exit.name}</CardTitle>
						<CardDescription>#{exit.id}</CardDescription>
					</CardHeader>
					<CardContent>
						<Text>sku: {exit.sku}</Text>
						<Text>{`created by: ${exit.createdById} at ${new Date(exit.createdAt).toUTCString()}`}</Text>
						{error && <Text>error</Text>}
						{isLoading && <Text>isLoading</Text>}
						<Text>----</Text>
						<Text>{data?.name}</Text>
						{data?.productStorages?.map(ps => (
							<>
								<Text>
									storage name: {ps.storage.name}
								</Text>
								<Text>
									skuVariantName: {ps.productSkuVariant.name}
								</Text>
								<Text>
									change: {ps.productSkuVariant.productChangeVariant.change}
									value: {ps.productSkuVariant.productChangeVariant.value}
								</Text>
								<Text>
									{`weight: ${ps.productSkuVariant.productDeliveryVariant.weight}g`}
								</Text>
								<Text>
									{`size: ${ps.productSkuVariant.productDeliveryVariant.width}x${ps.productSkuVariant.productDeliveryVariant.height}x${ps.productSkuVariant.productDeliveryVariant.depth}`}
								</Text>
								<Text>
									original product name: {ps.productSkuVariant.productChangeVariant.product?.name}
								</Text>
							</>
						))}
					</CardContent>
					<CardFooter>
						<Scanner />
					</CardFooter>
				</Card>
			</View>
		</>
	);
}
