import * as React from 'react';
import { View } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { useSession } from '~/ctx';
import { router } from 'expo-router';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';

const AVATAR_URI =
	'https://i.pinimg.com/736x/3f/94/70/3f9470b34a8e3f526dbdb022f9f19cf7.jpg';


export default function LoginForm() {
	const [showPassword, setShowPassword] = React.useState(false);
	const [email, setEmail] = React.useState('user@user.com');
	const [password, setPassword] = React.useState('user');
	const [progress, setProgress] = React.useState(0);
	const [loggingIn, setLoggingIn] = React.useState(false);
	const { signIn } = useSession();


	React.useEffect(() => {
		if (!loggingIn) return;
		if (progress >= 100) {
			signIn(email, password).then(() => {
				router.replace('/logged-in');
			});

		} else {
			setTimeout(() => {
				setProgress(progress + 10);
			}, 100);
		}

	}, [progress, setProgress, loggingIn])


	const handleLogInPress = React.useCallback(() => {
		setLoggingIn(true);
	}, [email, password]);
	return (
		<View className='flex-1 justify-center items-center gap-5 p-6 bg-secondary/30'>
			<Card className='w-full max-w-sm p-6 rounded-2xl'>
				<CardHeader className='items-center'>
					<Avatar alt="Rick Sanchez's Avatar" className='w-24 h-24'>
						<AvatarImage source={{ uri: AVATAR_URI }} />
						<AvatarFallback>
							<Text>RS</Text>
						</AvatarFallback>
					</Avatar>
					<View className='p-3' />
				</CardHeader>
				<CardContent>
					<View className="flex gap-3">
						<Input
							value={email}
							onChangeText={setEmail}
							aria-labelledby='inputLabel'
							aria-errormessage='inputError'
						/>
						<View className="flex-row justify-end gap-3">
							<Input
								className="flex-1"
								secureTextEntry={showPassword}
								value={password}
								onChangeText={setPassword}
								aria-labelledby='inputLabel'
								aria-errormessage='inputError'
							/>
							<Button
								variant='outline'
								className='shadow shadow-foreground/5'
								onPress={showPassword ? () => setShowPassword(false) : () => setShowPassword(true)}
							>
								<Text>{!showPassword ? "Hide" : "Show"}</Text>
							</Button>
						</View>
					</View>
				</CardContent>
				<CardFooter className='flex-col gap-3 pb-0'>
					{progress > 0 ? <Progress
						value={progress}
						className='h-2'
						indicatorClassName='bg-sky-600'
					/> : null}
					<View />

					<Button
						variant='outline'
						className='shadow shadow-foreground/5'
						onPress={handleLogInPress}
					>
						<Text>Log in</Text>
					</Button>
				</CardFooter>
			</Card>
		</View>
	);
}
