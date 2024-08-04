import { StatusBar } from 'expo-status-bar';

import { withExpoSnack } from 'nativewind';

import { Button, Text, View } from 'react-native';
import React, { useState } from 'react';


const App = () => {
	const [name, setName] = useState('Warehouse-App');
	return (
		<View className="flex-1 items-center justify-center">
			<Text className="text-slate-800">
				{`Welcome to ${name}!`}
			</Text>
			<Button onPress={(prev) => setName(`|${prev}|`)} title="Reset" />
			<StatusBar style="auto" />
		</View>
	);
}

export default withExpoSnack(App);
