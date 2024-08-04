import { StatusBar } from 'expo-status-bar';

import { withExpoSnack } from 'nativewind';

import { Text, View } from 'react-native';
import { styled } from 'nativewind';

//import { Button, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';

const StyledView = styled(View)
const StyledText = styled(Text)

const App = () => {
	const [name, setName] = useState('Warehouse-App');
	return (
		<StyledView className="flex-1 items-center justify-center">
			<StyledText className="text-slate-800">
				{`Welcome to ${name}!`}
			</StyledText>
			<StatusBar style="auto" />
		</StyledView>
	);
}

export default withExpoSnack(App);
