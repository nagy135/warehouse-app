import React, { useState } from "react";
import { Modal, View } from "react-native";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

export default function ConfirmationModal({ onConfirm }: {
	onConfirm: () => void;
}) {
	const [modalVisible, setModalVisible] = useState(false);
	return (
		<View className="justify-center p-3 items-end">
			<Modal
				animationType="slide"
				transparent={true}
				hardwareAccelerated={true}
				visible={modalVisible}
				onRequestClose={() => {
					setModalVisible(!modalVisible);
					onConfirm();
				}}>
				<View
					className="flex-1 justify-center items-center bg-opacity-50 p-5"
				>
					<View
						className="p-5 border border-black rounded items-center bg-white"
					>
						<Text className="mb-5">Are you sure?</Text>
						<Button
							variant="destructive"
							onPress={() => setModalVisible(!modalVisible)}>
							<Text>Confirm</Text>
						</Button>
					</View>
				</View>
			</Modal>
			<Button
				onPress={() => setModalVisible(true)}>
				<Text>Save</Text>
			</Button>
		</View>
	);
}
