import { Link } from "expo-router";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export default function MovePage() {
  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <View className="flex-1 justify-center w-full gap-5 p-3">
        {/* @ts-ignore */}
        <Link href="/logged-in/move/storage" asChild>
          <Button className="text-2xl font-bold" size="lg">
            <Text>Storage</Text>
          </Button>
        </Link>
        {/* @ts-ignore */}
        <Link href="/logged-in/move/position" asChild>
          <Button className="text-2xl font-bold" size="lg">
            <Text>Position</Text>
          </Button>
        </Link>
      </View>
    </View>
  );
}
