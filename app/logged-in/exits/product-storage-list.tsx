import { FlashList } from "@shopify/flash-list";
import * as React from "react";
import { Alert, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { ProductStorage } from "~/lib/types";

const MIN_COLUMN_WIDTHS = [120, 120, 120, 120, 120];

export default function ProductStorageList({
  data,
}: {
  data: ProductStorage[];
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const columnWidths = React.useMemo(() => {
    return MIN_COLUMN_WIDTHS.map((minWidth) => {
      const evenWidth = width / MIN_COLUMN_WIDTHS.length;
      return evenWidth > minWidth ? evenWidth : minWidth;
    });
  }, [width]);

  return (
    <ScrollView
      horizontal
      bounces={false}
      showsHorizontalScrollIndicator={false}
    >
      <Table aria-labelledby="invoice-table">
        <TableHeader>
          <TableRow>
            <TableHead className="px-0.5" style={{ width: columnWidths[0] }}>
              <Text>Variant name</Text>
            </TableHead>
            <TableHead style={{ width: columnWidths[1] }}>
              <Text>Storage name</Text>
            </TableHead>
            <TableHead style={{ width: columnWidths[2] }}>
              <Text>Change</Text>
            </TableHead>
            <TableHead style={{ width: columnWidths[3] }}>
              <Text>Delivery</Text>
            </TableHead>
            <TableHead style={{ width: columnWidths[4] }}>
              <Text className="text-center md:text-right md:pr-5">Amount</Text>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <FlashList
            data={data}
            estimatedItemSize={5}
            contentContainerStyle={{
              paddingBottom: insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: productStorage, index }) => {
              return (
                <TableRow
                  key={productStorage.id}
                  className={cn(
                    "active:bg-secondary",
                    index % 2 && "bg-muted/40 "
                  )}
                >
                  <TableCell style={{ width: columnWidths[0] }}>
                    <Text>{productStorage.productSkuVariant.name}</Text>
                  </TableCell>
                  <TableCell style={{ width: columnWidths[1] }}>
                    <Text>{productStorage.storage.name}</Text>
                  </TableCell>
                  <TableCell style={{ width: columnWidths[2] }}>
                    <Text>
                      {productStorage.productSkuVariant.productCV.name}
                    </Text>
                  </TableCell>
                  <TableCell style={{ width: columnWidths[3] }}>
                    <Text>
                      {productStorage.productSkuVariant.productDV.name}
                    </Text>
                  </TableCell>
                  <TableCell
                    style={{ width: columnWidths[4] }}
                    className="items-end "
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="shadow-sm shadow-foreground/10 mr-3"
                      onPress={() => {
                        Alert.alert(
                          `You are counting ${productStorage.productSkuVariant.name}.`
                        );
                      }}
                    >
                      <Text>count</Text>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            }}
            ListFooterComponent={() => {
              return (
                <>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="flex-1 justify-center">
                        <Text className="text-foreground">Total</Text>
                      </TableCell>
                      <TableCell className="items-end pr-8">
                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={() => {
                            Alert.alert(
                              "total",
                              `You pressed the total amount price button.`
                            );
                          }}
                        >
                          <Text>total</Text>
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                  <View className="items-center py-3 ios:pb-0">
                    <Text
                      nativeID="invoice-table"
                      className="items-center text-sm text-muted-foreground"
                    >
                      A list of product storages in this exit
                    </Text>
                  </View>
                </>
              );
            }}
          />
        </TableBody>
      </Table>
    </ScrollView>
  );
}
