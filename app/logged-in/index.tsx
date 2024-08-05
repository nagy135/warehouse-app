import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useSession } from '~/ctx';
export default function LoggedInPage() {

	const { session } = useSession();
	return (
		<View className='flex-1 justify-center items-center gap-5 p-6 bg-secondary/30'>
			<Text className='color-white font-bold text-xl'>Logged In {session?.email ?? '-'}</Text>
			<Text className='color-white font-bold text-xl'>{session?.accessToken ?? '-'}</Text>
			<Text className='color-white font-bold text-xl'>{session?.refreshToken ?? '-'}</Text>
			<View className="flex-1 justify-center w-full gap-5 p-3">
				<Button><Text>Entry</Text></Button>
				<Button><Text>Exit</Text></Button>
			</View>
		</View>
	)
}
