import React, { useState } from "react";
import { Text } from "./ui/text";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";
import { View } from "react-native";
import { Input } from "./ui/input";
import useScanner from "~/lib/hooks/use-scanner";

export default function CountModal({
	open,
	setClose,
	onConfirm,
}: {
	open: boolean;
	setClose: () => void;
	onConfirm: (count: number) => void;
}) {
	const { startScan, scanning } = useScanner({
		onScan: () => {
			onConfirm(count);
			setClose();
		},
	});
	const [count, setCount] = useState(1);

	const onChangeCount = (text: string) => {
		setCount(Number(text));
	};
	return (
		<AlertDialog open={open}>
			<View className="flex items-end"></View>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Count how many items</AlertDialogTitle>
					<AlertDialogDescription>
						These will be marked as moved to selected moving storage.
						<View className="h-12">
							<Input
								keyboardType="numeric"
								placeholder="How many items are we moving"
								value={count.toString()}
								onChangeText={onChangeCount}
							/>
						</View>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onPress={setClose}>
						<Text>Cancel</Text>
					</AlertDialogCancel>
					<AlertDialogAction onPress={() => startScan()}>
						<Text>{scanning ? "..." : "From"}</Text>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
