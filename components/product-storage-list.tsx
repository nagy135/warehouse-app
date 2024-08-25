import { FlashList } from "@shopify/flash-list";
import * as React from "react";
import { Alert, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { Text } from "~/components/ui/text";
import { cn, groupBy } from "~/lib/utils";
import { ProductStorage } from "~/lib/types";
import { useMemo } from "react";

const MIN_COLUMN_WIDTHS = [50, 120, 120, 120, 120];

type ProductStorageWithCount = ProductStorage & { count: number };

export default function ProductStorageList({
	data,
}: {
	data: ProductStorage[];
}) {
	const { width } = useWindowDimensions();
	const insets = useSafeAreaInsets();

	const grouped = useMemo(() => groupBy(data, "productSkuVariant.id"), [data]);
	const unique = useMemo(() => {
		return Object.entries(grouped).map(([_, value]) => {
			const uniqueProductStorage = value[0] as ProductStorageWithCount;
			uniqueProductStorage.count = value.length;
			return uniqueProductStorage;
		});
	}, [grouped]);

	const columnWidths = React.useMemo(() => {
		return MIN_COLUMN_WIDTHS.map((minWidth) => {
			const evenWidth = width / MIN_COLUMN_WIDTHS.length;
			return evenWidth > minWidth ? evenWidth : minWidth;
		});
	}, [width]);

	return (
		<ScrollView
			horizontal
			bounces={false}
			showsHorizontalScrollIndicator={false}
		>
			<Table aria-labelledby="invoice-table">
				<TableHeader>
					<TableRow>
						<TableHead style={{ width: columnWidths[0] }}>
							<Text className="text-center font-bold text-md">Count</Text>
						</TableHead>
						<TableHead style={{ width: columnWidths[1] }}>
							<Text className="font-bold text-md">Variant name</Text>
						</TableHead>
						<TableHead
							className="font-bold text-lg"
							style={{ width: columnWidths[2] }}
						>
							<Text className="font-bold text-md">Storage name</Text>
						</TableHead>
						<TableHead
							className="font-bold text-lg"
							style={{ width: columnWidths[3] }}
						>
							<Text className="font-bold text-md">Change</Text>
						</TableHead>
						<TableHead
							className="font-bold text-lg"
							style={{ width: columnWidths[4] }}
						>
							<Text className="font-bold text-md">Delivery</Text>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<FlashList
						data={unique}
						estimatedItemSize={5}
						contentContainerStyle={{
							paddingBottom: insets.bottom,
						}}
						showsVerticalScrollIndicator={false}
						renderItem={({ item: productStorage, index }) => {
							return (
								<TableRow
									key={productStorage.id}
									className={cn(
										"active:bg-secondary",
										index % 2 && "bg-muted/40 "
									)}
								>
									<TableCell
										style={{ width: columnWidths[0] }}
										className="items-center"
									>
										<Text>{productStorage.count}</Text>
									</TableCell>
									<TableCell
										className="items-end"
										style={{ width: columnWidths[1] }}
									>
										<Text>{productStorage.productSkuVariant.name}</Text>
									</TableCell>
									<TableCell style={{ width: columnWidths[2] }}>
										<Text>{productStorage.storage.name}</Text>
									</TableCell>
									<TableCell style={{ width: columnWidths[3] }}>
										<Text>
											{productStorage.productSkuVariant.productCV.name}
										</Text>
									</TableCell>
									<TableCell style={{ width: columnWidths[4] }}>
										<Text>
											{productStorage.productSkuVariant.productDV.name}
										</Text>
									</TableCell>
								</TableRow>
							);
						}}
						ListFooterComponent={() => {
							return (
								<>
									<TableFooter>
										<TableRow>
											<TableCell className="flex-1 justify-center">
												<Text className="text-foreground">Total</Text>
											</TableCell>
											<TableCell className="items-end pr-8">
												<Button
													size="sm"
													variant="ghost"
													onPress={() => {
														Alert.alert(
															"total",
															`You pressed the total amount price button.`
														);
													}}
												>
													<Text>total</Text>
												</Button>
											</TableCell>
										</TableRow>
									</TableFooter>
									<View className="items-center py-3 ios:pb-0">
										<Text
											nativeID="invoice-table"
											className="items-center text-sm text-muted-foreground"
										>
											A list of product storages in this exit
										</Text>
									</View>
								</>
							);
						}}
					/>
				</TableBody>
			</Table>
		</ScrollView>
	);
}
