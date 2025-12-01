import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import InventoryWorkflow from "~/components/inventory-work-flow/inventory-work-flow";

const InventoryScreen = () =>
    <View className="flex-1 bg-background">
        <InventoryWorkflow />
    </View>

export default InventoryScreen;
