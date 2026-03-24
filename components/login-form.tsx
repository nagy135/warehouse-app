import * as React from 'react';
import {
  Alert,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
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
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import packageJson from '../package.json';

const AVATAR_URI =
  'https://i.pinimg.com/736x/3f/94/70/3f9470b34a8e3f526dbdb022f9f19cf7.jpg';

export default function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [progress, setProgress] = React.useState(0);
  const [loggingIn, setLoggingIn] = React.useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { signIn } = useSession();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!loggingIn) return;

    if (progress >= 100) {
      signIn(email, password)
        .then(() => {
          router.replace('/logged-in');
        })
        .catch(() => {
          Alert.alert(t('login.error'), t('login.could-not-log-in'), [
            {
              text: 'OK',
              onPress: () => {
                setProgress(0);
                setLoggingIn(false);
                clearTimeout(timerRef.current!);
              },
              style: 'default',
            },
          ]);
        });
    } else {
      if (process.env.EXPO_PUBLIC_FAKE_LOGIN_LOADER == 'false') {
        setProgress(100);
        return;
      }

      timerRef.current = setTimeout(
        () => {
          setProgress(progress + 10);
        },
        (Math.random() * 1000) / 2,
      );
    }
  }, [progress, loggingIn, email, password, signIn, t]);

  const handleLogInPress = React.useCallback(() => {
    setLoggingIn(true);
  }, []);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
          <Card className="w-full max-w-sm rounded-2xl p-6">
            <CardHeader className="items-center">
              <Avatar alt="Rick Sanchez's Avatar" className="h-24 w-24">
                <AvatarImage source={{ uri: AVATAR_URI }} />
                <AvatarFallback>
                  <Text>USER</Text>
                </AvatarFallback>
              </Avatar>
              <View className="p-3" />
              <Text className="text-xs text-muted-foreground">
                Version {packageJson.version}
              </Text>
            </CardHeader>

            <CardContent>
              <View className="flex gap-3">
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@test.com"
                />

                <View className="flex-row justify-end gap-3">
                  <Input
                    className="flex-1"
                    secureTextEntry={showPassword}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="password"
                  />
                  <Button
                    variant="outline"
                    className="shadow shadow-foreground/5"
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    <Text>
                      {!showPassword ? t('login.hide') : t('login.show')}
                    </Text>
                  </Button>
                </View>
              </View>
            </CardContent>

            <CardFooter className="flex-col gap-3 pb-0">
              {progress > 0 ? (
                <Progress
                  value={progress}
                  className="h-2"
                  indicatorClassName="bg-sky-600"
                />
              ) : null}

              <Button
                variant="outline"
                className="shadow shadow-foreground/5"
                onPress={handleLogInPress}
              >
                <Text>{t('login.log-in')}</Text>
              </Button>
            </CardFooter>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
