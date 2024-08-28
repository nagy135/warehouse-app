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
import { type Exit } from "~/lib/types";

export default function ExitCard({ exit }: { exit: Exit }) {
  return (
    <Card className="w-full">
      <TouchableOpacity
        onPress={() => {
          /* @ts-ignore */
          router.push({ pathname: "/logged-in/exit-detail", params: exit });
        }}
      >
        <CardHeader>
          <CardTitle>{exit.name}</CardTitle>
          <CardDescription>exit number #{exit.id}</CardDescription>
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
