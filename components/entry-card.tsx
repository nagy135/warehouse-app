import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { type Entry } from "~/lib/types";

export default function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Card className="w-full">
      <TouchableOpacity
        onPress={() => {
          router.push({ pathname: "./detail", params: entry });
        }}
      >
        <CardHeader>
          <CardTitle>{entry.name}</CardTitle>
          <CardDescription>entry number #{entry.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Content</Text>
        </CardContent>
        <CardFooter>
          <Text>Do stuff</Text>
        </CardFooter>
      </TouchableOpacity>
    </Card>
  );
}
