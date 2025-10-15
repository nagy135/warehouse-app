import { ChevronDown, Search, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Dropdown as DropdownElement } from 'react-native-element-dropdown';
import { useTranslation } from 'react-i18next';

export const Dropdown = <
    T extends string | number | null,
    K extends Record<string, any>,
>({
    value,
    setValue,
    data,
    labelField,
    valueField,
    placeholder,
    searchPlaceholder,
}: {
    value: T | null;
    setValue: (value: T | null) => void;
    data?: K[];
    labelField?: keyof K;
    valueField?: keyof K;
    placeholder?: string;
    searchPlaceholder?: string;
}) => {
    const { t } = useTranslation();
    const [dropdownFocus, setDropdownFocus] = useState(false);

    return (
        <View className="flex-row items-center mb-2">
            <View className="flex-1">
                <DropdownElement
                    style={{
                        height: 48,
                        borderColor: dropdownFocus ? '#3b82f6' : '#ccc',
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        marginBottom: 8,
                    }}
                    placeholderStyle={{ color: '#999' }}
                    selectedTextStyle={{ color: '#000' }}
                    inputSearchStyle={{
                        height: 40,
                        fontSize: 14,
                        color: '#333',
                    }}
                    data={data ?? []}
                    labelField={labelField ?? "name"}
                    valueField={valueField ?? "id"}
                    placeholder={!dropdownFocus ? placeholder : '...'}
                    value={value}
                    search
                    searchPlaceholder={searchPlaceholder ?? t("search")}
                    onFocus={() => setDropdownFocus(true)}
                    onBlur={() => setDropdownFocus(false)}
                    onChange={(item) => {
                        setValue(item.id);
                        setDropdownFocus(false);
                    }}
                    renderRightIcon={() => (
                        <ChevronDown
                            size={18}
                            color={dropdownFocus ? '#3b82f6' : '#555'}
                        />
                    )}
                    renderLeftIcon={() => <Search size={16} color="#666" className="mr-2" />}
                />
            </View>
            {value && (
                <TouchableOpacity
                    onPress={() => setValue(null)}
                    className="ml-2 p-1"
                >
                    <XCircle size={22} color="#666" />
                </TouchableOpacity>
            )}
        </View>
    )
}