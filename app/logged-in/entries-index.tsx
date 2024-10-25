import { useIsFocused } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	ActivityIndicator,
	RefreshControl,
	ScrollView,
	View,
} from "react-native";
import EntryCard from "~/components/entry/card";
import RedirectModal from "~/components/modal/redirect-modal";
import Scanner from "~/components/scanner";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import useGetRecords from "~/lib/hooks/api/use-get-records";
import useNotificationModal from "~/lib/hooks/use-notification-modal";
import { Entry } from "~/lib/types";

export default function EntriesPage() {
	const [searchValue, setSearchValue] = useState("");
	const [foundEntry, setFoundEntry] = useState<Entry | null>(null);
	const [redirectModalOpen, setRedirectModalOpen] = useState(false);
	const { t } = useTranslation()
	const isFocused = useIsFocused();
	const { setOpen: notificationModalOpen, modal: notificationModal } =
		useNotificationModal({
			title: t('not-found-title'),
			description: t('entry-list.not-found'),
		});

	const {
		data: entries,
		isWaiting,
		isLoading,
		error,
		refreshing,
		onRefresh,
	} = useGetRecords<Entry>("entries", searchValue);
	if (error) return <Text>error</Text>;


	return (
		<>
			<View className="h-full p-2 container">
				<View className="flex-row gap-3">
					<Input
						className="flex-1 mb-2"
						placeholder={t('entry-list.search-by-name')}
						value={searchValue}
						onChangeText={setSearchValue}
					/>
					<View className="w-1/3 py-1">
						{isFocused && <Scanner
							label={t('scan')}
							mockData={"wafflesrefill123"}
							size={"sm"}
							onScan={(data) => {
								const foundEntry = entries?.find(
									(entry: Entry) => entry.sku === data
								);
								if (foundEntry) {
									setFoundEntry(foundEntry);
									setRedirectModalOpen(true);
								} else {
									notificationModalOpen();
								}
							}}
						/>}
					</View>
				</View>
				<ScrollView
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
				>
					{entries?.map((entry: Entry, i: number) => (
						<View key={`entry-card-${i}`} className="my-1">
							<EntryCard entry={entry} />
						</View>
					))}
				</ScrollView>
			</View>
			{(isWaiting || isLoading) && (
				<View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
					<ActivityIndicator size={60} color="#666666" />
				</View>
			)}
			{notificationModal}
			<RedirectModal
				open={redirectModalOpen}
				title={t('entry-list.redirect-to-entry')}
				description={
					<>
						<View>
							<Text>{t('entry-list.redirect-confirm')} </Text>
						</View>
						<View>
							<Text className="font-bold">{foundEntry?.name ?? "-"}</Text>
						</View>
					</>
				}
				hrefObject={{
					pathname: "/logged-in/entry-detail",
					/* @ts-ignore */
					params: foundEntry,
				}}
				setClose={() => setRedirectModalOpen(false)}
			/>
		</>
	);
}
