// components/StatsTile.tsx
import { View } from "react-native";
import { Text } from "~/components/ui/text";

type Props = {
    label: string;
    value: number | string;
    emoji?: string;
    isLandscape?: boolean;
};

export default function StatsTile({ label, value, emoji, isLandscape }: Props) {
    return (
        <View
            className={`flex-1 rounded-2xl border border-neutral-200 bg-white/90 dark:bg-neutral-900/90 shadow-sm items-center justify-center
          ${isLandscape ? "px-3 py-2" : "px-4 py-3"}`}
        >
            <View
                className={
                    isLandscape
                        ? "flex-row items-center gap-2"
                        : "flex-col items-center"
                }
            >
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                    {emoji ? `${emoji} ` : ""}
                    {label}
                </Text>
                <Text className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50 text-center">
                    {value}
                </Text>
            </View>
        </View>
    );
}
