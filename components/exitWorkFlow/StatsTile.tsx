// components/StatsTile.tsx
import { View } from "react-native";
import { Text } from "~/components/ui/text";

type Props = {
    label: string;
    value: number | string;
    emoji?: string;
};

export default function StatsTile({ label, value, emoji }: Props) {
    return (
        <View className="flex-1 rounded-2xl border border-neutral-200 bg-white/90 dark:bg-neutral-900/90 px-4 py-3 shadow-sm items-center justify-center">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                {emoji ? `${emoji} ` : ""}{label}
            </Text>
            <Text className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 text-center">
                {value}
            </Text>
        </View>
    );
}
